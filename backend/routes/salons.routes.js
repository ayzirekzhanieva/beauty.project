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
  specialists: true,
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
  specialists: true,
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

module.exports = router;