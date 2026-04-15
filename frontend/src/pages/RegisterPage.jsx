import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { saveAuth } from "../services/auth";
import Card from "../components/Card";
import Button from "../components/Button";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CLIENT",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);
      saveAuth(res.data);
      toast.success("Регистрация успешна");
      navigate("/");
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <h1 className="text-3xl font-bold mb-6 text-center">Регистрация</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Полное имя</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                required
              />
            </div>

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

            <div>
              <label className="block mb-2 font-medium">Роль</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
              >
                <option value="CLIENT">Клиент</option>
                <option value="OWNER">Владелец салона</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-4">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-pink-500 font-medium">
              Войти
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}