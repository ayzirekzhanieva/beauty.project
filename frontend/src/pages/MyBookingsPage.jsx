import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import BackToHome from "../components/BackToHome";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my");
      setBookings(res.data);
    } catch (error) {
      console.error("Ошибка загрузки записей:", error);
      toast.error("Не удалось загрузить записи");
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

  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();

    const sorted = [...bookings].sort((a, b) => {
      const dateA = new Date(`${a.bookingDate}T${a.bookingTime}`);
      const dateB = new Date(`${b.bookingDate}T${b.bookingTime}`);
      return dateA - dateB;
    });

    const upcoming = [];
    const past = [];

    for (const booking of sorted) {
      const bookingDateTime = new Date(`${booking.bookingDate}T${booking.bookingTime}`);

      const isPastByDate = bookingDateTime < now;
      const isFinishedStatus =
        booking.status === "COMPLETED" || booking.status === "CANCELLED";

      if (isPastByDate || isFinishedStatus) {
        past.push(booking);
      } else {
        upcoming.push(booking);
      }
    }

    return {
      upcomingBookings: upcoming,
      pastBookings: past.reverse(),
    };
  }, [bookings]);

  function BookingCard({ booking, showCancel }) {
    return (
      <Card key={booking.id}>
        <h2 className="text-xl font-semibold mb-2">{booking.salon.name}</h2>
        <p className="text-gray-600 mb-1">Услуга: {booking.service.name}</p>
        <p className="text-gray-600 mb-1">Дата: {booking.bookingDate}</p>
        <p className="text-gray-600 mb-1">Время: {booking.bookingTime}</p>
        <p className="text-gray-600 mb-1">Стоимость: {booking.totalPrice} сом</p>
        <p className="text-gray-600 mb-4">Статус: {booking.status}</p>

        {showCancel && booking.status !== "CANCELLED" && (
          <Button
            className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
            onClick={() => cancelBooking(booking.id)}
          >
            Отменить запись
          </Button>
        )}
      </Card>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Загружаем ваши записи..." />;
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackToHome />
        <h1 className="text-4xl font-bold mb-8">Мои записи</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>

            {upcomingBookings.length === 0 ? (
              <EmptyState
                title="Нет будущих записей"
                description="Когда вы забронируете услугу, она появится здесь."
              />
            ) : (
              <div className="grid gap-4">
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    showCancel={true}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Past</h2>

            {pastBookings.length === 0 ? (
              <EmptyState
                title="История пока пуста"
                description="Завершенные и отмененные записи будут отображаться здесь."
              />
            ) : (
              <div className="grid gap-4">
                {pastBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    showCancel={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}