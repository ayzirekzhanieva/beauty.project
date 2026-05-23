import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await api.get("/notifications");
      setNotifications((res.data || []).filter((item) => !item.isRead));
    } catch (error) {
      toast.error("Ошибка загрузки уведомлений");
    }
  }

  async function openNotification(notification) {
  try {
    await api.patch(`/notifications/${notification.id}/read`);

    setNotifications((prev) =>
      prev.filter((item) => item.id !== notification.id)
    );

    if (notification.link) {
      navigate(notification.link);
    }
  } catch (error) {
    toast.error("Ошибка открытия уведомления");
  }
}

  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all");
      loadNotifications();
    } catch (error) {
      toast.error("Ошибка обновления уведомлений");
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

        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Уведомления</h1>

          <Button onClick={markAllRead}>
            Прочитать все
          </Button>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <p className="text-gray-500">Уведомлений пока нет.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                className={`w-full text-left rounded-3xl p-5 shadow-sm border transition ${
                  notification.isRead
                    ? "bg-white border-[#fdeae5]"
                    : "bg-[#fff7f5] border-pink-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {notification.title}
                    </h2>

                    <p className="text-gray-600 mt-1">
                      {notification.message}
                    </p>

                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <span className="rounded-full bg-[#ee8585] text-white text-xs px-3 py-1">
                      Новое
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}