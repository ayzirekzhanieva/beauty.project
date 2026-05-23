import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import { getUser } from "../services/auth";

export default function MyChatsPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const user = getUser();

  useEffect(() => {
    loadChats();
  }, []);

  async function loadChats() {
    try {
      const res = await api.get("/chats");
      setChats(res.data || []);
    } catch (error) {
      toast.error("Ошибка загрузки чатов");
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7f5] p-6">
      <div className="max-w-4xl mx-auto">
        <button
  type="button"
  onClick={() => window.history.back()}
  className="mb-4 px-4 py-2 rounded-2xl bg-white text-[#ee8585] border border-[#fdeae5] shadow-sm hover:bg-[#fff7f5] transition"
>
  ← Назад
</button>
        <h1 className="text-3xl font-bold mb-6">Мои чаты</h1>

        {chats.length === 0 ? (
          <Card>
            <p className="text-gray-500">У вас пока нет чатов.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Card key={chat.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">
  {user?.role === "OWNER"
    ? (
        chat.client?.fullName ||
        chat.client?.email ||
        "Клиент"
      )
    : (
        chat.owner?.fullName ||
        chat.owner?.email ||
        "Владелец"
      )}
</h2>

                    <p className="text-gray-500">
  {user?.role === "OWNER"
    ? `Салон: ${chat.salon?.name || "—"}`
    : `Салон: ${chat.salon?.name || "—"}`}
</p>

                    <p className="text-sm text-gray-400 mt-2">
                      {chat.messages?.[0]?.text || "Нет сообщений"}
                    </p>
                  </div>

                  <Button onClick={() => navigate(`/chats/${chat.id}`)}>
                    Открыть чат
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}