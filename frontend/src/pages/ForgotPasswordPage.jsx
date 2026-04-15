import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import BackToHome from "../components/BackToHome";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Письмо отправлено");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка восстановления пароля");
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-md mx-auto">
        <BackToHome />
        <Card>
          <h1 className="text-3xl font-bold mb-6 text-center">
            Забыли пароль?
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                placeholder="Введите ваш email"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Отправить ссылку для сброса
            </Button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Если такой email существует, мы отправим ссылку для сброса пароля.
          </p>
        </Card>
      </div>
    </div>
  );
}