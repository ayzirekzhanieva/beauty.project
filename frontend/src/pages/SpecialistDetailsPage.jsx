import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";
import { FALLBACK_SALON_IMAGE, getImageUrl } from "../services/constants";

export default function SpecialistDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpecialist();
  }, [id]);

  async function loadSpecialist() {
    try {
      setLoading(true);
      const res = await api.get(`/salons/specialists/${id}`);
      setSpecialist(res.data || null);
    } catch (error) {
      console.error("LOAD SPECIALIST ERROR:", error);
      toast.error("Не удалось загрузить мастера");
      setSpecialist(null);
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
    .filter(Boolean)
    .join(", ");
}

  if (loading) {
    return <LoadingSpinner text="Загружаем мастера..." />;
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-pink-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Card>
            <p className="text-gray-500">Мастер не найден.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-5xl mx-auto">
        <BackButton />

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden p-0">
            <img
              src={getImageUrl(specialist.photoUrl)}
              alt={specialist.fullName}
              className="w-full h-[420px] object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_SALON_IMAGE;
              }}
            />
          </Card>

          <Card>
            <p className="text-sm text-pink-500 font-medium mb-2">
              {specialist.salon?.name || "Салон"}
            </p>

            <h1 className="text-4xl font-bold mb-2">{specialist.fullName}</h1>

            <p className="text-xl text-pink-500 font-medium mb-4">
              {specialist.title || "Специалист"}
            </p>

            <p className="text-gray-600 leading-7 mb-6">
              {specialist.bio || "Описание мастера скоро появится."}
            </p>
            <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 text-sm text-gray-700 mb-6">
  <p>
    <span className="font-semibold">Рабочие часы:</span>{" "}
    {specialist.workStartTime || "09:00"} – {specialist.workEndTime || "18:00"}
  </p>
  <p>
  <span className="font-semibold">Рабочие дни:</span>{" "}
  {formatWorkDays(specialist.workDays)}
</p>
</div>

            <Button
              className="w-full"
              onClick={() =>
                navigate(`/booking/${specialist.salonId}?specialistId=${specialist.id}`)
              }
            >
              Записаться к мастеру
            </Button>
          </Card>
        </div>

        <Card className="mt-8">
  <h2 className="text-2xl font-semibold mb-4">Услуги мастера</h2>

  {specialist.specialistServices?.length === 0 ? (
    <p className="text-gray-500">Услуги пока не привязаны.</p>
  ) : (
    <div className="grid md:grid-cols-2 gap-4">
      {specialist.specialistServices.map((item) => (
        <div
          key={item.id}
          className="border border-pink-100 rounded-2xl p-4 bg-white"
        >
          <h3 className="text-lg font-semibold">{item.service.name}</h3>

          <p className="text-gray-600 mt-1">
            {item.service.description || "Описание скоро появится"}
          </p>

          <div className="mt-3 text-sm text-gray-500">
            <p>Стоимость: {item.service.price} сом</p>
            <p>Длительность: {item.service.durationMin} мин</p>
          </div>
        </div>
      ))}
    </div>
  )}
</Card>

        <Card className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Портфолио</h2>

          {specialist.works?.length === 0 ? (
            <p className="text-gray-500">Работы пока не добавлены.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialist.works.map((work) => (
                <div key={work.id} className="border border-pink-100 rounded-2xl p-3 bg-white">
                  <img
                    src={getImageUrl(work.imageUrl)}
                    alt={work.caption || "Work"}
                    className="w-full h-64 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_SALON_IMAGE;
                    }}
                  />
                  {work.caption && (
                    <p className="text-sm text-gray-600 mt-2">{work.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}