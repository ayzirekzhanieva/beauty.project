const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const salons = await prisma.salon.findMany({
      include: {
  services: true,
  products: true,
  reviews: true,
  specialists: {
  include: {
    works: true,
    specialistServices: {
      include: {
        service: true,
      },
    },
  },
},
},
      orderBy: {
        id: "desc",
      },
    });

    res.json(salons);
  } catch (error) {
    console.error("GET SALONS ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const salonId = Number(req.params.id);

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      include: {
  services: true,
  products: true,
  reviews: true,
  specialists: {
  include: {
    works: true,
    specialistServices: {
      include: {
        service: true,
      },
    },
  },
},
},
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден" });
    }

    res.json(salon);
  } catch (error) {
    console.error("GET SALON BY ID ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/specialists/:id", async (req, res) => {
  try {
    const specialistId = Number(req.params.id);

    const specialist = await prisma.specialist.findUnique({
      where: { id: specialistId },
      include: {
  salon: true,
  works: true,
  specialistServices: {
    include: {
      service: true,
    },
  },
},
    });

    if (!specialist) {
      return res.status(404).json({ message: "Мастер не найден" });
    }

    res.json(specialist);
  } catch (error) {
    console.error("GET SPECIALIST DETAILS ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;