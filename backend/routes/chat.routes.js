const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { salonId } = req.body;

    const salon = await prisma.salon.findUnique({
      where: { id: Number(salonId) },
      select: { id: true, ownerId: true },
    });

    if (!salon) {
      return res.status(404).json({ message: "Салон не найден" });
    }

    if (req.user.id === salon.ownerId) {
      return res.status(400).json({ message: "Нельзя создать чат с самим собой" });
    }

    const chat = await prisma.chat.upsert({
      where: {
        clientId_ownerId_salonId: {
          clientId: req.user.id,
          ownerId: salon.ownerId,
          salonId: salon.id,
        },
      },
      update: {},
      create: {
        clientId: req.user.id,
        ownerId: salon.ownerId,
        salonId: salon.id,
      },
    });

    res.json(chat);
  } catch (error) {
    console.error("START CHAT ERROR:", error);
    res.status(500).json({ message: "Ошибка создания чата" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ clientId: req.user.id }, { ownerId: req.user.id }],
      },
      include: {
        client: { select: { id: true, fullName: true, email: true } },
        owner: { select: { id: true, fullName: true, email: true } },
        salon: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(chats);
  } catch (error) {
    console.error("GET CHATS ERROR:", error);
    res.status(500).json({ message: "Ошибка загрузки чатов" });
  }
});

router.get("/:chatId/messages", authMiddleware, async (req, res) => {
  try {
    const chatId = Number(req.params.chatId);

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ clientId: req.user.id }, { ownerId: req.user.id }],
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Чат не найден" });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const fullChat = await prisma.chat.findUnique({
  where: { id: chatId },
  include: {
    client: {
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    },
    owner: {
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    },
    salon: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

    res.json({
  chat: fullChat,
  messages,
});
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ message: "Ошибка загрузки сообщений" });
  }
});

router.post("/:chatId/messages", authMiddleware, async (req, res) => {
  try {
    const chatId = Number(req.params.chatId);
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Сообщение не может быть пустым" });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        OR: [{ clientId: req.user.id }, { ownerId: req.user.id }],
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Чат не найден" });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: req.user.id,
        text: text.trim(),
      },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    const receiverId =
  chat.clientId === req.user.id ? chat.ownerId : chat.clientId;

const sender = await prisma.user.findUnique({
  where: { id: req.user.id },
  select: {
    fullName: true,
    email: true,
  },
});

const chatDetails = await prisma.chat.findUnique({
  where: { id: chatId },
  include: {
    salon: {
      select: {
        name: true,
      },
    },
  },
});

await prisma.notification.create({
  data: {
    userId: receiverId,
    title: "Новое сообщение",
    message: `${
      sender?.fullName || sender?.email || "Пользователь"
    } написал(а) вам в чате салона ${
      chatDetails?.salon?.name || ""
    }`,
    type: "CHAT",
    link: `/chats/${chatId}`,
  },
});

    res.status(201).json(message);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: "Ошибка отправки сообщения" });
  }
});

module.exports = router;