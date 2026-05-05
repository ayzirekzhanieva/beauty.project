import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { UserRound, Clock3, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import BackButton from "../components/BackButton";
import { FALLBACK_SALON_IMAGE, getImageUrl } from "../services/constants";

export default function SalonSpecialistsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalon();
  }, [id]);

  async function loadSalon() {
    try {
      setLoading(true);
      const res = await api.get(`/salons/${id}`);
      setSalon(res.data || null);
    } catch (error) {
      console.error("LOAD SALON SPECIALISTS ERROR:", error);
      toast.error("Не удалось загрузить мастеров");
      setSalon(null);
    } finally {
      setLoading(false);
    }
  }

  function formatWorkDays(workDays) {
    const map = {
      1: "Пн",
      2: "Вт",
      3: "Ср",
      4: "Чт",
      5: "Пт",
      6: "Сб",
      7: "Вс",
    };

    return (workDays || "1,2,3,4,5,6")
      .split(",")
      .map((day) => map[day.trim()])
      .filter(Boolean);
  }

  if (loading) {
    return <LoadingSpinner text="Загружаем мастеров..." />;
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <EmptyState
            title="Салон не найден"
            description="Попробуйте открыть страницу снова."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-pink-500 font-medium mb-2">Команда салона</p>
              <h1 className="text-4xl font-bold text-gray-900">
                Мастера — {salon.name}
              </h1>
              <p className="text-gray-600 mt-3">
                Выберите мастера, посмотрите его услуги и запишитесь онлайн.
              </p>
            </div>

            <Link to={`/salons/${salon.id}`}>
              <Button className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50">
                Вернуться к салону
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <UserRound className="w-5 h-5 text-pink-400" />
              <h2 className="text-2xl font-semibold text-gray-900">Все мастера</h2>
            </div>

            <span className="text-sm text-gray-500">
              {salon.specialists?.length || 0} мастеров
            </span>
          </div>

          {salon.specialists?.length === 0 ? (
            <EmptyState
              title="Мастера пока не добавлены"
              description="Скоро здесь появится команда салона."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {salon.specialists.map((specialist) => {
                const specialistServices = (specialist.specialistServices || [])
                  .map((item) => item.service)
                  .filter(Boolean);

                const formattedDays = formatWorkDays(specialist.workDays);

                return (
                  <div
                    key={specialist.id}
                    className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm hover:shadow-lg transition flex flex-col"
                  >
                    <img
                      src={getImageUrl(specialist.photoUrl)}
                      alt={specialist.fullName}
                      className="w-full h-60 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_SALON_IMAGE;
                      }}
                    />

                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {specialist.fullName}
                        </h3>

                        <p className="text-pink-500 font-medium mt-1">
                          {specialist.title || "Специалист"}
                        </p>
                      </div>

                      <p className="text-gray-600 leading-6 mb-4 min-h-[72px]">
                        {specialist.bio || "Описание скоро появится"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <Button
                          className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                          onClick={() => navigate(`/specialists/${specialist.id}`)}
                        >
                          Подробнее
                        </Button>

                        <Button
                          onClick={() =>
                            navigate(`/booking/${salon.id}?specialistId=${specialist.id}`)
                          }
                        >
                          Записаться
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}