import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import { getUser } from "../services/auth";

export default function ChatPage() {
  const { chatId } = useParams();
  const currentUser = getUser();

  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
  loadMessages();

  const interval = setInterval(() => {
    loadMessages();
  }, 3000);

  return () => clearInterval(interval);
}, [chatId]);

  async function loadMessages() {
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data.messages || []);
      setChatInfo(res.data.chat || null);
    } catch (error) {
      toast.error("Ошибка загрузки сообщений");
    }
  }

  async function sendMessage(e) {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      const res = await api.post(`/chats/${chatId}/messages`, {
        text,
      });

      setMessages((prev) => [...prev, res.data]);
      setText("");
      setTimeout(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, 100);
    } catch (error) {
      toast.error("Ошибка отправки сообщения");
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        <button
  type="button"
  onClick={() => window.history.back()}
  className="mb-4 px-4 py-2 rounded-2xl bg-white text-pink-500 border border-pink-100 shadow-sm hover:bg-pink-50 transition"
>
  ← Назад
</button>
        <Card className="h-[70vh] flex flex-col">
          <div className="border-b border-pink-100 pb-4 mb-4">
  <h1 className="text-2xl font-bold text-gray-900">
    {chatInfo?.salon?.name || "Чат"}
  </h1>

  <p className="text-gray-500 mt-1">
    {chatInfo?.owner?.fullName ||
      chatInfo?.client?.fullName ||
      "Пользователь"}
  </p>
</div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((message) => {
  const isMine = message.senderId === currentUser?.id;

  return (
    <div
      key={message.id}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-3xl px-4 py-3 shadow-sm ${
          isMine
            ? "bg-pink-500 text-white"
            : "bg-white border border-pink-100 text-gray-800"
        }`}
      >
        <p
          className={`text-xs mb-1 ${
            isMine ? "text-pink-100" : "text-gray-400"
          }`}
        >
          {message.sender?.fullName || "Пользователь"}
        </p>

        <p>{message.text}</p>

<p
  className={`text-[11px] mt-2 text-right ${
    isMine ? "text-pink-100" : "text-gray-400"
  }`}
>
  {new Date(message.createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })}
</p>
      </div>
    </div>
  );
})}
<div ref={messagesEndRef} />
          </div>

         <form onSubmit={sendMessage} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите сообщение"
              className="flex-1 p-3 rounded-2xl border border-pink-200 outline-none"
            />

            <Button type="submit" className="w-full sm:w-auto">
  Отправить
</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}