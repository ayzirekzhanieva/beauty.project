import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import { isAuthenticated } from "../services/auth";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import BackToHome from "../components/BackToHome";

export default function BookingPage() {
  const { salonId } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
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
    if (bookingDate) {
      loadAvailability();
    } else {
      setAvailability({
        allSlots: [],
        busySlots: [],
        availableSlots: [],
      });
      setBookingTime("");
    }
  }, [bookingDate, salonId]);

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
      const res = await api.get(`/bookings/availability/${salonId}?date=${bookingDate}`);

      setAvailability({
        allSlots: Array.isArray(res.data?.allSlots) ? res.data.allSlots : [],
        busySlots: Array.isArray(res.data?.busySlots) ? res.data.busySlots : [],
        availableSlots: Array.isArray(res.data?.availableSlots)
          ? res.data.availableSlots
          : [],
      });

      if (bookingTime && Array.isArray(res.data?.busySlots) && res.data.busySlots.includes(bookingTime)) {
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

  const services = Array.isArray(salon?.services) ? salon.services : [];

  const selectedService = useMemo(() => {
    if (!serviceId || !services.length) return null;
    return services.find((service) => service.id === Number(serviceId)) || null;
  }, [services, serviceId]);

  if (!salon) {
    return <LoadingSpinner text="Загружаем страницу записи..." />;
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        <BackToHome />

        <Card>
          <h1 className="text-2xl font-bold mb-2">{salon.name}</h1>
          <p className="text-gray-600 mb-6">{salon.description || "Описание пока не добавлено"}</p>

          <form onSubmit={handleBooking} className="space-y-5">
            <div>
              <label className="block mb-2 font-medium">Выберите услугу</label>
              <select
                className="w-full p-3 rounded-2xl border border-pink-200 outline-none"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                required
              >
                <option value="">Выберите услугу</option>
                {services.map((service) => (
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
                  <span className="font-semibold">Длительность:</span> {selectedService.durationMin} мин
                </p>
                <p>
                  <span className="font-semibold">Стоимость:</span> {selectedService.price} сом
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
                required
              />
            </div>

            <div>
              <label className="block mb-3 font-medium flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-pink-400" />
                Время
              </label>

              {!bookingDate ? (
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
                            : "bg-white text-pink-500 border-pink-300 hover:bg-pink-50"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}

              {bookingDate && !loadingAvailability && (
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

            <Button type="submit" className="w-full" disabled={!bookingTime || !serviceId}>
              Подтвердить запись
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}