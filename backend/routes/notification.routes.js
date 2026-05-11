const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({ message: "Ошибка загрузки уведомлений" });
  }
});

router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({ count });
  } catch (error) {
    console.error("GET UNREAD COUNT ERROR:", error);
    res.status(500).json({ message: "Ошибка загрузки счётчика" });
  }
});

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: Number(req.params.id),
        userId: req.user.id,
      },
      data: {
        isRead: true,
      },
    });

    res.json(notification);
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(500).json({ message: "Ошибка обновления уведомления" });
  }
});

router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({ message: "Все уведомления прочитаны" });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);
    res.status(500).json({ message: "Ошибка обновления уведомлений" });
  }
});

module.exports = router;