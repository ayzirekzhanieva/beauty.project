const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res
        .status(403)
        .json({ message: "Только клиент может иметь избранное" });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        salon: {
          include: {
            services: true,
            products: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/:salonId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res
        .status(403)
        .json({ message: "Только клиент может добавлять избранное" });
    }

    const salonId = Number(req.params.salonId);

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_salonId: {
          userId: req.user.id,
          salonId,
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ message: "Салон уже в избранном" });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        salonId,
      },
    });

    res.status(201).json({
      message: "Салон добавлен в избранное",
      favorite,
    });
  } catch (error) {
    console.error("ADD FAVORITE ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/:salonId", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "CLIENT") {
      return res
        .status(403)
        .json({ message: "Только клиент может удалять избранное" });
    }

    const salonId = Number(req.params.salonId);

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_salonId: {
          userId: req.user.id,
          salonId,
        },
      },
    });

    if (!existingFavorite) {
      return res.status(404).json({ message: "Салон не найден в избранном" });
    }

    await prisma.favorite.delete({
      where: {
        userId_salonId: {
          userId: req.user.id,
          salonId,
        },
      },
    });

    res.json({ message: "Салон удален из избранного" });
  } catch (error) {
    console.error("REMOVE FAVORITE ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;