import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import BackToHome from "../components/BackToHome";

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
      <div className="max-w-4xl mx-auto">
        <BackToHome />
        <h1 className="text-4xl font-bold mb-8">Профиль</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-2xl font-semibold mb-4">Мои данные</h2>

            <div className="space-y-3 mb-6 text-gray-700">
              <p>
                <span className="font-semibold">Email:</span> {profile.email}
              </p>
              <p>
                <span className="font-semibold">Роль:</span> {profile.role}
              </p>
              <p>
                <span className="font-semibold">Дата регистрации:</span>{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>

            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Полное имя
                </label>
                <input
                  type="text"
                  value={nameForm.fullName}
                  onChange={(e) =>
                    setNameForm({
                      fullName: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                />
              </div>

              <Button type="submit">Сохранить имя</Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold mb-4">Сменить пароль</h2>

            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
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
                  className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
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
                  className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                />
              </div>

              <Button type="submit">Сменить пароль</Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}