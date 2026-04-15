const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/salon/:salonId", async (req, res) => {
  try {
    const salonId = Number(req.params.salonId);

    const reviews = await prisma.review.findMany({
      where: { salonId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const avg = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating: Number(avg.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { salonId, rating, comment } = req.body;

    if (req.user.role !== "CLIENT") {
      return res.status(403).json({ message: "Только клиент может оставлять отзывы" });
    }

    if (!salonId || !rating) {
      return res.status(400).json({ message: "salonId и rating обязательны" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Рейтинг должен быть от 1 до 5" });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_salonId: {
          userId: req.user.id,
          salonId: Number(salonId),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (existingReview) {
      const updatedReview = await prisma.review.update({
        where: {
          userId_salonId: {
            userId: req.user.id,
            salonId: Number(salonId),
          },
        },
        data: {
          rating: Number(rating),
          comment: comment || "",
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      return res.json({
        message: "Отзыв обновлен",
        review: updatedReview,
      });
    }

    const review = await prisma.review.create({
      data: {
        salonId: Number(salonId),
        userId: req.user.id,
        rating: Number(rating),
        comment: comment || "",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Отзыв добавлен",
      review,
    });
  } catch (error) {
    console.error("CREATE OR UPDATE REVIEW ERROR:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});
module.exports = router;