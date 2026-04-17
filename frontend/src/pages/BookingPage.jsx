import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CalendarDays, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { isAuthenticated } from "../services/auth";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import BackButton from "../components/BackButton";

export default function BookingPage() {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [salon, setSalon] = useState(null);
  const [specialistId, setSpecialistId] = useState(
    searchParams.get("specialistId") || ""
  );
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availability, setAvailability] = useState({
    allSlots: [],
    busySlots: [],
    availableSlots: [],
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    loadSalon();
  }, [salonId]);

  useEffect(() => {
    if (bookingDate && specialistId) {
      loadAvailability();
    } else {
      setAvailability({
        allSlots: [],
        busySlots: [],
        availableSlots: [],
      });
      setBookingTime("");
    }
  }, [bookingDate, specialistId, salonId]);

  async function loadSalon() {
    try {
      const res = await api.get(`/salons/${salonId}`);
      setSalon(res.data || null);
    } catch (error) {
      console.error("Ошибка загрузки салона:", error);
      toast.error("Не удалось загрузить салон");
      setSalon(null);
    }
  }

  async function loadAvailability() {
    try {
      setLoadingAvailability(true);

      const res = await api.get(
        `/bookings/availability/${salonId}?date=${bookingDate}&specialistId=${specialistId}`
      );

      setAvailability({
        allSlots: Array.isArray(res.data?.allSlots) ? res.data.allSlots : [],
        busySlots: Array.isArray(res.data?.busySlots) ? res.data.busySlots : [],
        availableSlots: Array.isArray(res.data?.availableSlots)
          ? res.data.availableSlots
          : [],
      });

      if (
        bookingTime &&
        Array.isArray(res.data?.busySlots) &&
        res.data.busySlots.includes(bookingTime)
      ) {
        setBookingTime("");
      }
    } catch (error) {
      console.error("Ошибка загрузки слотов:", error);
      toast.error("Не удалось загрузить доступное время");
      setAvailability({
        allSlots: [],
        busySlots: [],
        availableSlots: [],
      });
    } finally {
      setLoadingAvailability(false);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Сначала войдите в аккаунт");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post("/bookings", {
        salonId: Number(salonId),
        specialistId: Number(specialistId),
        serviceId: Number(serviceId),
        bookingDate,
        bookingTime,
        notes,
      });

      toast.success(res.data?.message || "Запись создана");
      navigate("/my-bookings");
    } catch (error) {
      console.error("BOOKING ERROR:", error);
      toast.error(error.response?.data?.message || "Ошибка при записи");
      loadAvailability();
    }
  }

  const specialists = Array.isArray(salon?.specialists) ? salon.specialists : [];

  const selectedSpecialist = useMemo(() => {
    if (!specialistId) return null;
    return specialists.find((item) => item.id === Number(specialistId)) || null;
  }, [specialists, specialistId]);

  const specialistServices = useMemo(() => {
    if (!selectedSpecialist) return [];

    return (selectedSpecialist.specialistServices || [])
      .map((item) => item.service)
      .filter(Boolean);
  }, [selectedSpecialist]);

  const selectedService = useMemo(() => {
    if (!serviceId) return null;
    return specialistServices.find((item) => item.id === Number(serviceId)) || null;
  }, [specialistServices, serviceId]);

  if (!salon) {
    return <LoadingSpinner text="Загружаем страницу записи..." />;
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        <BackButton />

        <Card>
          <h1 className="text-2xl font-bold mb-2">{salon.name}</h1>
          <p className="text-gray-600 mb-6">
            {salon.description || "Описание пока не добавлено"}
          </p>

          <form onSubmit={handleBooking} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Выберите мастера</label>
              <select
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                value={specialistId}
                onChange={(e) => {
                  setSpecialistId(e.target.value);
                  setServiceId("");
                  setBookingTime("");
                }}
                required
              >
                <option value="">Выберите мастера</option>
                {specialists.map((specialist) => (
                  <option key={specialist.id} value={specialist.id}>
                    {specialist.fullName} — {specialist.title || "Специалист"}
                  </option>
                ))}
              </select>
            </div>

            {selectedSpecialist && (
              <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Мастер:</span>{" "}
                  {selectedSpecialist.fullName}
                </p>
                <p>
                  <span className="font-semibold">Специализация:</span>{" "}
                  {selectedSpecialist.title || "Специалист"}
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium">Выберите услугу</label>
              <select
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
                disabled={!specialistId}
              >
                <option value="">
                  {!specialistId ? "Сначала выберите мастера" : "Выберите услугу"}
                </option>

                {specialistServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {service.price} сом — {service.durationMin} мин
                  </option>
                ))}
              </select>
            </div>

            {selectedService && (
              <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Услуга:</span> {selectedService.name}
                </p>
                <p>
                  <span className="font-semibold">Длительность:</span>{" "}
                  {selectedService.durationMin} мин
                </p>
                <p>
                  <span className="font-semibold">Стоимость:</span>{" "}
                  {selectedService.price} сом
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-pink-400" />
                Дата
              </label>
              <input
                type="date"
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label className="block mb-3 font-medium flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-pink-400" />
                Время
              </label>

              {!specialistId ? (
                <div className="text-gray-500 text-sm">Сначала выберите мастера</div>
              ) : !serviceId ? (
                <div className="text-gray-500 text-sm">Сначала выберите услугу</div>
              ) : !bookingDate ? (
                <div className="text-gray-500 text-sm">Сначала выберите дату</div>
              ) : loadingAvailability ? (
                <div className="text-gray-500 text-sm">Загружаем слоты...</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {(availability.allSlots || []).map((slot) => {
                    const isBusy = (availability.busySlots || []).includes(slot);
                    const isSelected = bookingTime === slot;

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isBusy}
                        onClick={() => setBookingTime(slot)}
                        className={`px-4 py-3 rounded-2xl border text-sm font-medium transition ${
                          isBusy
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : isSelected
                            ? "bg-pink-500 text-white border-pink-500"
                            : "bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}

              {specialistId && serviceId && bookingDate && !loadingAvailability && (
                <div className="mt-3 text-sm text-gray-500">
                  Серые слоты заняты. Доступны записи с 09:00 до 18:00.
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Комментарий</label>
              <textarea
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Например: хочу вечерний макияж"
              />
            </div>

            {selectedSpecialist &&
 selectedService &&
 bookingDate &&
 bookingTime && (
  <div className="rounded-2xl border border-pink-100 bg-pink-50 p-5 space-y-2 text-sm text-gray-700">
    <h3 className="text-base font-semibold text-black mb-2">
      Детали записи
    </h3>

    <p>
      <span className="font-medium">Салон:</span> {salon.name}
    </p>

    <p>
      <span className="font-medium">Мастер:</span>{" "}
      {selectedSpecialist.fullName}
    </p>

    <p>
      <span className="font-medium">Услуга:</span>{" "}
      {selectedService.name}
    </p>

    <p>
      <span className="font-medium">Дата:</span> {bookingDate}
    </p>

    <p>
      <span className="font-medium">Время:</span> {bookingTime}
    </p>

    <p className="text-pink-600 font-semibold pt-1">
      Стоимость: {selectedService.price} сом
    </p>
  </div>
)}

            <Button
  type="submit"
  disabled={!bookingTime || !serviceId || !specialistId}
  className="w-full"
>
  {!specialistId
    ? "Выберите мастера"
    : !serviceId
    ? "Выберите услугу"
    : !bookingTime
    ? "Выберите время"
    : "Подтвердить запись"}
</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}