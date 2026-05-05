import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Clock3, Sparkles, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";
import { FALLBACK_SALON_IMAGE, getImageUrl } from "../services/constants";

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

  if (loading) {
    return <LoadingSpinner text="Загружаем мастера..." />;
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <Card>
            <p className="text-gray-500">Мастер не найден.</p>
          </Card>
        </div>
      </div>
    );
  }

  const specialistServices = (specialist.specialistServices || [])
    .map((item) => item.service)
    .filter(Boolean);

  const workDays = formatWorkDays(specialist.workDays);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackButton />

        <Card className="overflow-hidden p-0 mb-8">
  <div className="grid lg:grid-cols-[420px_1fr] gap-0">
    <div className="h-[320px] sm:h-[380px] lg:h-full max-h-[520px] overflow-hidden">
      <img
        src={getImageUrl(specialist.photoUrl)}
        alt={specialist.fullName}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.src = FALLBACK_SALON_IMAGE;
        }}
      />
    </div>

    <div className="p-5 sm:p-6 md:p-8 flex flex-col justify-center">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-4 py-1 text-sm font-medium text-pink-600">
          Мастер
        </span>

        {specialist.salon?.name && (
          <span className="inline-flex rounded-full border border-pink-100 bg-white px-4 py-1 text-sm text-gray-600">
            {specialist.salon.name}
          </span>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
        {specialist.fullName}
      </h1>

      <p className="text-lg sm:text-xl text-pink-500 font-medium mb-5">
        {specialist.title || "Специалист"}
      </p>

      <p className="text-gray-600 leading-7 mb-6">
        {specialist.bio || "Описание мастера скоро появится."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-4">
          <p className="text-sm text-gray-500 mb-2">Рабочие дни</p>
          <div className="flex flex-wrap gap-2">
            {workDays.length > 0 ? (
              workDays.map((day) => (
                <span
                  key={day}
                  className="rounded-full border border-pink-100 bg-white px-3 py-1 text-xs font-medium text-pink-600"
                >
                  {day}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">Не указаны</span>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-4">
          <p className="text-sm text-gray-500 mb-2">Рабочие часы</p>
          <p className="text-gray-700 inline-flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-pink-400" />
            {specialist.workStartTime || "09:00"} –{" "}
            {specialist.workEndTime || "18:00"}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          className="w-full"
          onClick={() =>
            navigate(`/booking/${specialist.salonId}?specialistId=${specialist.id}`)
          }
        >
          Записаться к мастеру
        </Button>

        {specialist.salon?.id && (
          <Button
            className="w-full bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
            onClick={() => navigate(`/salons/${specialist.salon.id}`)}
          >
            Открыть салон
          </Button>
        )}
      </div>
    </div>
  </div>
</Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between gap-4 mb-5">
  <div className="flex items-center gap-2">
    <Sparkles className="w-5 h-5 text-pink-500" />
    <h2 className="text-2xl font-semibold text-gray-900">
      Услуги мастера
    </h2>
  </div>

  <span className="text-sm text-gray-500">
    {specialistServices.length} услуг
  </span>
</div>

            {specialistServices.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50 p-8 text-center">
                <p className="text-gray-700 font-medium">Услуги пока не указаны</p>
                <p className="text-gray-500 mt-2">
                  Скоро здесь появится список услуг мастера.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {specialistServices.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-3xl border border-pink-100 bg-white p-5 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mt-1 leading-6">
                          {service.description || "Описание услуги скоро появится"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
                        {service.price} сом
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
  <span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1 text-sm text-gray-600">
    <Clock3 className="w-4 h-4 text-pink-400" />
    {service.durationMin} мин
  </span>

  <Button
    onClick={() =>
      navigate(
        `/booking/${specialist.salonId}?specialistId=${specialist.id}&serviceId=${service.id}`
      )
    }
  >
    Записаться
  </Button>
</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4 mb-5">
  <div className="flex items-center gap-2">
    <UserRound className="w-5 h-5 text-pink-500" />
    <h2 className="text-2xl font-semibold text-gray-900">
      Портфолио
    </h2>
  </div>

  <span className="text-sm text-gray-500">
    {specialist.works?.length || 0} работ
  </span>
</div>

            {specialist.works?.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50 p-8 text-center">
                <p className="text-gray-700 font-medium">Работы пока не добавлены</p>
                <p className="text-gray-500 mt-2">
                  Скоро здесь появится портфолио мастера.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {specialist.works.map((work) => (
                  <div
  key={work.id}
  className="rounded-3xl overflow-hidden border border-pink-100 bg-white hover:shadow-md transition"
>
                    <img
                      src={getImageUrl(work.imageUrl)}
                      alt={work.caption || "Portfolio work"}
                      className="w-full h-44 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_SALON_IMAGE;
                      }}
                    />
                    {work.caption && (
                      <div className="p-3">
                        <p className="text-sm text-gray-600">{work.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}