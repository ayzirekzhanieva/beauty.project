import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock3, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import LoadingSpinner from "../components/LoadingSpinner";

function getStatusLabel(status) {
  if (status === "PENDING") return "Ожидает";
  if (status === "CONFIRMED") return "Подтверждено";
  if (status === "COMPLETED") return "Завершено";
  if (status === "CANCELLED") return "Отменено";
  return status;
}

function getStatusClasses(status) {
  if (status === "PENDING") {
    return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
  if (status === "CONFIRMED") {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (status === "COMPLETED") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (status === "CANCELLED") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-gray-50 text-gray-700 border-gray-200";
}

function isPastBooking(booking) {
  const today = new Date().toISOString().split("T")[0];
  return (
    booking.status === "COMPLETED" ||
    booking.status === "CANCELLED" ||
    booking.bookingDate < today
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-pink-100 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-pink-50">
        <Sparkles className="h-10 w-10 text-pink-500" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="mt-3 text-gray-500">{description}</p>
    </div>
  );
}

function BookingTabs({ activeTab, setActiveTab, upcomingCount, historyCount }) {
  const tabs = [
    { key: "upcoming", label: `Предстоящие (${upcomingCount})` },
    { key: "history", label: `История (${historyCount})` },
  ];

  return (
    <div className="mb-8">
      <div className="inline-flex flex-wrap gap-2 rounded-3xl border border-pink-100 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-pink-500 text-white shadow-sm"
                : "bg-white text-gray-600 hover:bg-pink-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel, onRepeat, onLeaveReview }) {
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const canRepeat = isPastBooking(booking);
  const canLeaveReview = booking.status === "COMPLETED";

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {booking.salon?.name || "Салон"}
            </h3>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-medium ${getStatusClasses(
                booking.status
              )}`}
            >
              {getStatusLabel(booking.status)}
            </div>
          </div>

          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-medium text-gray-900">Мастер:</span>{" "}
              {booking.specialist?.fullName || "Не выбран"}
            </p>

            <p>
              <span className="font-medium text-gray-900">Услуга:</span>{" "}
              {booking.service?.name || "—"}
            </p>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-pink-400" />
              <span>{booking.bookingDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-pink-400" />
              <span>{booking.bookingTime}</span>
            </div>

            <p>
              <span className="font-medium text-gray-900">Стоимость:</span>{" "}
              {booking.totalPrice} сом
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[180px]">
          {canCancel && (
            <Button
              className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
              onClick={() => onCancel(booking.id)}
            >
              Отменить
            </Button>
          )}

          {canRepeat && (
            <Button
              onClick={() =>
                onRepeat(booking.salonId, booking.specialistId || "")
              }
            >
              Записаться снова
            </Button>
          )}
          {canLeaveReview && (
  <Button
    className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
    onClick={() => onLeaveReview(booking)}
  >
    Оставить отзыв
  </Button>
)}
        </div>
      </div>
    </Card>
  );
}

function RatingStars({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const active = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            className="transition hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                active
                  ? "fill-pink-400 text-pink-400"
                  : "text-pink-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function MyBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
  rating: 5,
  comment: "",
}); 

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("LOAD MY BOOKINGS ERROR:", error);
      toast.error("Не удалось загрузить записи");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(bookingId) {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success("Запись отменена");
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка отмены записи");
    }
  }

  async function submitReview(e) {
  e.preventDefault();

  if (!selectedBookingForReview) return;

  try {
    const res = await api.post("/reviews", {
      salonId: selectedBookingForReview.salonId,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment,
    });

    toast.success(res.data?.message || "Отзыв сохранен");
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
    setExistingReview(null);
    setReviewForm({
      rating: 5,
      comment: "",
    });
  } catch (error) {
    toast.error(error.response?.data?.message || "Ошибка сохранения отзыва");
  }
}

  function repeatBooking(salonId, specialistId) {
    if (specialistId) {
      navigate(`/booking/${salonId}?specialistId=${specialistId}`);
      return;
    }
    navigate(`/booking/${salonId}`);
  }

  async function leaveReview(booking) {
  try {
    const res = await api.get(`/reviews/salon/${booking.salonId}`);
    const reviews = Array.isArray(res.data?.reviews) ? res.data.reviews : [];

    const myReview =
      reviews.find((review) => review?.user?.id === booking.clientId) || null;

    setSelectedBookingForReview(booking);
    setExistingReview(myReview);

    if (myReview) {
      setReviewForm({
        rating: myReview.rating || 5,
        comment: myReview.comment || "",
      });
    } else {
      setReviewForm({
        rating: 5,
        comment: "",
      });
    }

    setReviewModalOpen(true);
  } catch (error) {
    toast.error("Не удалось загрузить отзыв");
  }
}

  const upcomingBookings = useMemo(() => {
    return bookings.filter((booking) => !isPastBooking(booking));
  }, [bookings]);

  const historyBookings = useMemo(() => {
    return bookings.filter((booking) => isPastBooking(booking));
  }, [bookings]);

  const visibleBookings =
    activeTab === "upcoming" ? upcomingBookings : historyBookings;

  if (loading) {
    return <LoadingSpinner text="Загружаем ваши записи..." />;
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="mx-auto max-w-6xl">
        <BackButton />

        <h1 className="mb-6 text-4xl font-bold text-gray-900">Мои записи</h1>

        <BookingTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          upcomingCount={upcomingBookings.length}
          historyCount={historyBookings.length}
        />

        {visibleBookings.length === 0 ? (
          activeTab === "upcoming" ? (
            <EmptyState
              title="Нет будущих записей"
              description="Когда вы забронируете услугу, она появится здесь."
            />
          ) : (
            <EmptyState
              title="История пока пуста"
              description="Здесь будут отображаться завершённые и отменённые записи."
            />
          )
        ) : (
          <div className="grid gap-5">
            {visibleBookings.map((booking) => (
              <BookingCard
               key={booking.id}
               booking={booking}
               onCancel={cancelBooking}
               onRepeat={repeatBooking}
               onLeaveReview={leaveReview}
              />
            ))}
          </div>
        )}
      </div>
      {reviewModalOpen && selectedBookingForReview && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {existingReview ? "Изменить отзыв" : "Оставить отзыв"}
      </h3>

      <p className="text-gray-500 mb-6">
        {selectedBookingForReview.salon?.name} —{" "}
        {selectedBookingForReview.service?.name}
      </p>

      <form onSubmit={submitReview} className="space-y-4">
        <div>
  <label className="block text-sm font-medium text-gray-600 mb-2">
    Рейтинг
  </label>

  <RatingStars
    value={Number(reviewForm.rating)}
    onChange={(rating) =>
      setReviewForm({
        ...reviewForm,
        rating,
      })
    }
  />

  <p className="mt-2 text-sm text-gray-500">
    {Number(reviewForm.rating) === 5 && "Отлично"}
    {Number(reviewForm.rating) === 4 && "Хорошо"}
    {Number(reviewForm.rating) === 3 && "Нормально"}
    {Number(reviewForm.rating) === 2 && "Плохо"}
    {Number(reviewForm.rating) === 1 && "Очень плохо"}
  </p>
</div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Комментарий
          </label>
          <textarea
            value={reviewForm.comment}
            onChange={(e) =>
              setReviewForm({
                ...reviewForm,
                comment: e.target.value,
              })
            }
            className="w-full rounded-2xl border border-pink-200 bg-white p-3 outline-none"
            rows="4"
            placeholder="Поделитесь впечатлением"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button
  type="button"
  onClick={() => {
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
    setExistingReview(null);

    setReviewForm({
      rating: 5,
      comment: "",
    });
  }}
>
  Отмена
</Button>

          <Button type="submit">
            {existingReview ? "Сохранить изменения" : "Отправить отзыв"}
          </Button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}