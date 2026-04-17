const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function generateTimeSlots(start = "09:00", end = "18:00", step = 30) {
  const slots = [];
  let current = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  while (current < endMinutes) {
    slots.push(minutesToTime(current));
    current += step;
  }

  return slots;
}

router.get("/availability/:salonId", async (req, res) => {
  try {
    const salonId = Number(req.params.salonId);
    const { date, specialistId } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Дата обязательна" });
    }

    if (!specialistId) {
      return res.status(400).json({ message: "specialistId обязателен" });
    }

    const specialist = await prisma.specialist.findUnique({
      where: { id: Number(specialistId) },
    });

    if (!specialist) {
      return res.status(404).json({ message: "Мастер не найден" });
    }

    const jsDay = new Date(date).getDay(); // 0=Sunday, 1=Monday...
    const normalizedDay = jsDay === 0 ? 7 : jsDay; // Monday=1 ... Sunday=7

    const allowedDays = (specialist.workDays || "1,2,3,4,5,6")
      .split(",")
      .map((item) => Number(item.trim()))
      .filter(Boolean);

    if (!allowedDays.includes(normalizedDay)) {
      return res.json({
        date,
        salonId,
        specialistId: Number(specialistId),
        allSlots: [],
        busySlots: [],
        availableSlots: [],
        message: "Мастер не работает в этот день",
      });
    }

    const workStartTime = specialist.workStartTime || "09:00";
    const workEndTime = specialist.workEndTime || "18:00";

    const bookings = await prisma.booking.findMany({
      where: {
        salonId,
        specialistId: Number(specialistId),
        bookingDate: date,
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        service: true,
      },
    });

    const allSlots = generateTimeSlots(workStartTime, workEndTime, 30);
    const busySlots = new Set();

    for (const booking of bookings) {
      const startMinutes = timeToMinutes(booking.bookingTime.slice(0, 5));
      const endMinutes = startMinutes + booking.service.durationMin;

      let current = startMinutes;
      while (current < endMinutes) {
        busySlots.add(minutesToTime(current));
        current += 30;
      }
    }

    const availableSlots = allSlots.filter((slot) => !busySlots.has(slot));

    res.json({
      date,
      salonId,
      specialistId: Number(specialistId),
      workStartTime,
      workEndTime,
      workDays: allowedDays,
      allSlots,
      busySlots: Array.from(busySlots),
      availableSlots,
    });
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { salonId, specialistId, serviceId, bookingDate, bookingTime, notes } = req.body;

    if (req.user.role !== "CLIENT") {
      return res.status(403).json({ message: "Только клиент может создавать запись" });
    }

    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });

    const existingBookings = await prisma.booking.findMany({
  where: {
    salonId: Number(salonId),
    specialistId: specialistId ? Number(specialistId) : null,
    bookingDate,
    status: {
      not: "CANCELLED",
    },
  },
  include: {
    service: true,
  },
});

const newStart = timeToMinutes(bookingTime);
const newEnd = newStart + service.durationMin;

for (const existingBooking of existingBookings) {
  const existingStart = timeToMinutes(existingBooking.bookingTime.slice(0, 5));
  const existingEnd = existingStart + existingBooking.service.durationMin;

  const hasConflict = newStart < existingEnd && newEnd > existingStart;

  if (hasConflict) {
    return res.status(400).json({
      message: "Это время уже занято. Выберите другой слот.",
    });
  }
}

    if (!service) {
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: req.user.id,
        salonId: Number(salonId),
        serviceId: Number(serviceId),
        specialistId: specialistId ? Number(specialistId) : null,
        bookingDate,
        bookingTime,
        notes: notes || "",
        totalPrice: service.price,
      },
      include: {
        service: true,
        salon: true,
        specialist: true,
      },
    });

    res.status(201).json({
      message: "Запись успешно создана",
      booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        clientId: req.user.id,
      },
      include: {
        salon: true,
        service: true,
        specialist: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    if (req.user.role !== "CLIENT") {
      return res.status(403).json({ message: "Только клиент может отменять свои записи" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    if (booking.clientId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваша запись" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ message: "Запись уже отменена" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: {
        salon: true,
        service: true,
        specialist: true,
      },
    });

    res.json({
      message: "Запись отменена",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;