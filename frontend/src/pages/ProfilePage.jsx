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
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Профиль обновлен");
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка обновления профиля");
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
  <div className="min-h-screen bg-pink-50 p-6">
    <div className="mx-auto max-w-6xl">
      <BackButton />

      <h1 className="mb-6 text-4xl font-bold text-gray-900">
        Настройки аккаунта
      </h1>

      <Card className="mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-4xl font-bold text-pink-500">
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
              <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-4 py-1 text-sm font-medium text-pink-600">
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
            <div className="rounded-2xl border border-pink-100 bg-pink-50 p-4">
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-lg text-gray-900">{profile?.email || "—"}</p>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-pink-50 p-4">
              <p className="text-sm font-medium text-gray-500">Тип аккаунта</p>
              <p className="mt-1 text-lg text-gray-900">
                {getRoleLabel(profile?.role)}
              </p>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-pink-50 p-4">
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
          </div>
        </Card>
      </div>
    </div>
  </div>
);
}