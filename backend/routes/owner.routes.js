const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware, ownerOnly } = require("../middleware/auth.middleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/salons", authMiddleware, ownerOnly, upload.single("image"), async (req, res) => {
  try {
    const { name, description, address } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const salon = await prisma.salon.create({
      data: {
        name,
        description,
        address,
        imageUrl,
        ownerId: req.user.id,
      },
    });

    res.status(201).json({
      message: "Салон создан",
      salon,
    });
  } catch (error) {
    console.error("CREATE SALON ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/services", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { salonId, name, description, price, durationMin } = req.body;

    const salon = await prisma.salon.findFirst({
      where: {
        id: Number(salonId),
        ownerId: req.user.id,
      },
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден или не принадлежит владельцу" });
    }

    const service = await prisma.service.create({
      data: {
        salonId: Number(salonId),
        name,
        description,
        price: Number(price),
        durationMin: Number(durationMin),
      },
    });

    res.status(201).json({
      message: "Услуга добавлена",
      service,
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/products", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { salonId, name, description, price, stock } = req.body;

    const salon = await prisma.salon.findFirst({
      where: {
        id: Number(salonId),
        ownerId: req.user.id,
      },
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден или не принадлежит владельцу" });
    }

    const product = await prisma.product.create({
      data: {
        salonId: Number(salonId),
        name,
        description,
        price: Number(price),
        stock: Number(stock),
      },
    });

    res.status(201).json({
      message: "Товар добавлен",
      product,
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/dashboard", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const ownerSalons = await prisma.salon.findMany({
      where: { ownerId: req.user.id },
      select: { id: true },
    });

    const salonIds = ownerSalons.map((salon) => salon.id);

    const bookingsCount = await prisma.booking.count({
      where: {
        salonId: { in: salonIds },
      },
    });

    const sales = await prisma.booking.aggregate({
      where: {
        salonId: { in: salonIds },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const incomingBookings = await prisma.booking.findMany({
      where: {
        salonId: { in: salonIds },
      },
      include: {
        client: true,
        salon: true,
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      bookingsCount,
      totalSales: sales._sum.totalPrice || 0,
      incomingBookings,
    });
  } catch (error) {
    console.error("OWNER DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch("/bookings/:id/status", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Некорректный статус" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        salon: true,
      },
    });

    if (!booking) {
      return res.status(404).json({ message: "Запись не найдена" });
    }

    const ownerSalon = await prisma.salon.findFirst({
      where: {
        id: booking.salonId,
        ownerId: req.user.id,
      },
    });

    if (!ownerSalon) {
      return res.status(403).json({ message: "Это не ваша запись" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        client: true,
        salon: true,
        service: true,
      },
    });

    res.json({
      message: "Статус записи обновлен",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch("/services/:id", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { name, description, price, durationMin } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        salon: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    if (service.salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваша услуга" });
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        description,
        price: Number(price),
        durationMin: Number(durationMin),
      },
    });

    res.json({
      message: "Услуга обновлена",
      service: updatedService,
    });
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/services/:id", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const serviceId = Number(req.params.id);

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        salon: true,
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Услуга не найдена" });
    }

    if (service.salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваша услуга" });
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    res.json({ message: "Услуга удалена" });
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch("/products/:id", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, description, price, stock } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        salon: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    if (product.salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш товар" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
      },
    });

    res.json({
      message: "Товар обновлен",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/products/:id", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const productId = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        salon: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Товар не найден" });
    }

    if (product.salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш товар" });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ message: "Товар удален" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch("/salons/:id", authMiddleware, ownerOnly, upload.single("image"), async (req, res) => {
  try {
    const salonId = Number(req.params.id);
    const { name, description, address } = req.body;

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден" });
    }

    if (salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш салон" });
    }

    const updatedSalon = await prisma.salon.update({
      where: { id: salonId },
      data: {
        name,
        description,
        address,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : salon.imageUrl,
      },
    });

    res.json({
      message: "Салон обновлен",
      salon: updatedSalon,
    });
  } catch (error) {
    console.error("UPDATE SALON ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/salons/:id", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const salonId = Number(req.params.id);

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден" });
    }

    if (salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш салон" });
    }

    await prisma.booking.deleteMany({
      where: { salonId },
    });

    await prisma.product.deleteMany({
      where: { salonId },
    });

    await prisma.service.deleteMany({
      where: { salonId },
    });

    await prisma.salon.delete({
      where: { id: salonId },
    });

    res.json({ message: "Салон удален" });
  } catch (error) {
    console.error("DELETE SALON ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/specialists", authMiddleware, ownerOnly, upload.single("photo"), async (req, res) => {
  try {
    const { salonId, fullName, title, bio } = req.body;

    const salon = await prisma.salon.findUnique({
      where: { id: Number(salonId) },
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден" });
    }

    if (salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш салон" });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const specialist = await prisma.specialist.create({
      data: {
        salonId: Number(salonId),
        fullName,
        title,
        bio,
        photoUrl,
      },
    });

    res.status(201).json({
      message: "Мастер добавлен",
      specialist,
    });
  } catch (error) {
    console.error("CREATE SPECIALIST ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.patch("/specialists/:id", authMiddleware, ownerOnly, upload.single("photo"), async (req, res) => {
  try {
    const specialistId = Number(req.params.id);
    const { fullName, title, bio } = req.body;

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      include: {
        salon: true,
      },
    });

    if (!specialist) {
      return res.status(404).json({ message: "Мастер не найден" });
    }

    if (specialist.salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш мастер" });
    }

    const updatedSpecialist = await prisma.specialist.update({
      where: { id: specialistId },
      data: {
        fullName,
        title,
        bio,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : specialist.photoUrl,
      },
    });

    res.json({
      message: "Мастер обновлен",
      specialist: updatedSpecialist,
    });
  } catch (error) {
    console.error("UPDATE SPECIALIST ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/specialists/:id", authMiddleware, ownerOnly, async (req, res) => {
  try {
    const specialistId = Number(req.params.id);

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      include: {
        salon: true,
      },
    });

    if (!specialist) {
      return res.status(404).json({ message: "Мастер не найден" });
    }

    if (specialist.salon.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Это не ваш мастер" });
    }

    await prisma.specialist.delete({
      where: { id: specialistId },
    });

    res.json({ message: "Мастер удален" });
  } catch (error) {
    console.error("DELETE SPECIALIST ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;