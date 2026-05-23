import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";

function getRoleLabel(role) {
  if (role === "CLIENT") return "Клиент";
  if (role === "OWNER") return "Владелец салона";
  return role;
}

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [nameForm, setNameForm] = useState({
    fullName: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  function handleScroll() {
    setIsScrolled(window.scrollY > 120);
  }

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  async function loadProfile() {
    try {
      setLoading(true);
      const res = await api.get("/profile/me");
      setProfile(res.data);
      setNameForm({
        fullName: res.data.fullName || "",
      });
    } catch (error) {
      toast.error("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();

    try {
      const res = await api.patch("/profile/me", {
        fullName: nameForm.fullName,
      });

      setProfile(res.data.user);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Профиль обновлен");
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка обновления профиля");
    }
  }

  async function handleDeleteAccount() {
  try {
    await api.delete("/auth/me");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    toast.success("Аккаунт удалён");

    setIsDeleteModalOpen(false);

    window.location.href = "/register";
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);

    toast.error(
      error.response?.data?.message || "Ошибка удаления аккаунта"
    );
  }
}
  async function changePassword(e) {
    e.preventDefault();

    try {
      const res = await api.patch("/profile/change-password", passwordForm);

      toast.success(res.data.message || "Пароль изменен");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка смены пароля");
    }
  }

  if (loading) {
    return <LoadingSpinner text="Загружаем профиль..." />;
  }

return (
  <div className="min-h-screen bg-[#fff7f5] p-6">
    <div className="mx-auto max-w-6xl">
      <div className="sticky top-24 z-40 ml-4 mt-2 mb-3 w-fit">
  <button
    type="button"
    onClick={() => window.history.back()}
    className={`bg-white/95 backdrop-blur shadow-md border border-[#fdeae5] text-[#ee8585] transition-all duration-300 flex items-center justify-center ${
      isScrolled
        ? "w-11 h-11 rounded-full text-2xl"
        : "px-4 py-2 rounded-2xl gap-2 text-lg"
    }`}
  >
    <span>←</span>
    {!isScrolled && <span>Назад</span>}
  </button>
</div>

      <h1 className="mb-6 text-4xl font-bold text-gray-900">
        Настройки аккаунта
      </h1>

      <Card className="mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#fdeae5] bg-[#fff7f5] text-4xl font-bold text-[#ee8585]">
            {(profile?.fullName || profile?.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">
              {profile?.fullName || "Пользователь"}
            </h2>

            <p className="text-gray-600">{profile?.email || "—"}</p>

            <div className="flex flex-wrap gap-3 pt-1">
              <span className="inline-flex rounded-full border border-pink-200 bg-[#fff7f5] px-4 py-1 text-sm font-medium text-[#ee8585]">
                {getRoleLabel(profile?.role)}
              </span>

              <span className="inline-flex rounded-full border border-gray-200 bg-white px-4 py-1 text-sm text-gray-600">
                Зарегистрирован: {formatDate(profile?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Личные данные
          </h2>

          <div className="space-y-5">
            <div className="rounded-2xl border border-[#fdeae5] bg-[#fff7f5] p-4">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-lg text-gray-900">{profile?.email || "—"}</p>
            </div>

            <div className="rounded-2xl border border-[#fdeae5] bg-[#fff7f5] p-4">
              <p className="text-sm font-medium text-gray-500">Тип аккаунта</p>
              <p className="mt-1 text-lg text-gray-900">
                {getRoleLabel(profile?.role)}
              </p>
            </div>

            <div className="rounded-2xl border border-[#fdeae5] bg-[#fff7f5] p-4">
              <p className="text-sm font-medium text-gray-500">Дата регистрации</p>
              <p className="mt-1 text-lg text-gray-900">
                {formatDate(profile?.createdAt)}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Полное имя
              </label>
              <input
                type="text"
                value={nameForm.fullName}
                onChange={(e) =>
                  setNameForm({
                    ...nameForm,
                    fullName: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-pink-200 bg-white p-3 outline-none"
                placeholder="Введите имя"
              />
            </div>

            <Button onClick={updateProfile}>
              Сохранить изменения
            </Button>
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            Безопасность
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Текущий пароль
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-pink-200 bg-white p-3 outline-none"
                placeholder="Введите текущий пароль"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">
                Новый пароль
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-pink-200 bg-white p-3 outline-none"
                placeholder="Введите новый пароль"
              />
            </div>

            <Button onClick={changePassword}>
              Сменить пароль
            </Button>

          <button
  type="button"
  onClick={() => {
    setIsDeleteModalOpen(true);
  }}
  className="px-5 py-3 rounded-2xl bg-white text-red-500 border border-red-200 hover:bg-red-50 transition"
>
  Удалить аккаунт
</button>
          </div>
        </Card>
      </div>
    </div>
    {isDeleteModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
      <h3 className="text-2xl font-bold mb-3 text-[#ee8585]">
        Удалить аккаунт?
      </h3>

      <p className="text-gray-600 mb-6">
        Это действие нельзя отменить. Все данные будут удалены.
      </p>

      <div className="flex justify-end gap-3">
        <Button
          className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          Отмена
        </Button>

        <Button
  className="bg-[#ee8585] text-white hover:bg-[#ee8585]"
  onClick={handleDeleteAccount}
>
  Удалить
</Button>
      </div>
    </div>
  </div>
)}
  </div>
);
}