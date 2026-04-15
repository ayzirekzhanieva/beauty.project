import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import BackToHome from "../components/BackToHome";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!token) {
      toast.error("Токен отсутствует");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      toast.success(res.data.message || "Пароль сброшен");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка сброса пароля");
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-md mx-auto">
        <BackToHome />
        <Card>
          <h1 className="text-3xl font-bold mb-6 text-center">
            Сброс пароля
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                placeholder="Введите новый пароль"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                placeholder="Повторите новый пароль"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Сбросить пароль
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}