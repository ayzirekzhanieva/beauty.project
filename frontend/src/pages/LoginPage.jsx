import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { saveAuth } from "../services/auth";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      saveAuth(res.data);
      toast.success("Вход выполнен");
      navigate("/");
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="mb-10 text-center">
  <h1 className="text-4xl font-bold text-pink-500">
    Glow Find
  </h1>
  <p className="mt-2 text-gray-500">
    Найди своего мастера красоты
  </p>
</div>
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-3xl font-bold mb-6 text-center">Вход</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Пароль</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Загрузка..." : "Войти"}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            <Link to="/forgot-password" className="text-pink-500 font-medium">
              Забыли пароль?
            </Link>
          </p>

          <p className="text-center text-gray-600 mt-4">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-pink-500 font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}