import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Scissors,
  ShoppingBag,
  Clock3,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import { getUser, isAuthenticated } from "../services/auth";
import { FALLBACK_SALON_IMAGE, getImageUrl } from "../services/constants";
import BackButton from "../components/BackButton";

function formatReviewDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "U";

  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export default function SalonDetailsPage() {
  const { id } = useParams();
  const user = getUser();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    loadSalon();
    loadReviews();
  }, [id]);

  async function loadSalon() {
    try {
      const res = await api.get(`/salons/${id}`);
      setSalon(res.data);
    } catch (error) {
      console.error("Ошибка загрузки салона:", error);
      toast.error("Не удалось загрузить салон");
    }
  }

  async function loadReviews() {
    try {
      const res = await api.get(`/reviews/salon/${id}`);
      setReviewsData({
        reviews: Array.isArray(res.data?.reviews) ? res.data.reviews : [],
        averageRating: Number(res.data?.averageRating || 0),
        totalReviews: Number(res.data?.totalReviews || 0),
      });
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);
      setReviewsData({
        reviews: [],
        averageRating: 0,
        totalReviews: 0,
      });
    }
  }

  const currentUserReview = useMemo(() => {
    if (!user || !Array.isArray(reviewsData.reviews)) return null;

    return (
      reviewsData.reviews.find(
        (review) => review?.user?.id === user.id
      ) || null
    );
  }, [reviewsData.reviews, user]);

  useEffect(() => {
    if (currentUserReview) {
      setReviewForm({
        rating: currentUserReview.rating || 5,
        comment: currentUserReview.comment || "",
      });
    } else {
      setReviewForm({
        rating: 5,
        comment: "",
      });
    }
  }, [currentUserReview]);

  async function handleSubmitReview(e) {
    e.preventDefault();

    if (!isAuthenticated()) {
      toast.error("Сначала войдите в аккаунт");
      return;
    }

    try {
      const res = await api.post("/reviews", {
        salonId: Number(id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });

      toast.success(res.data?.message || "Отзыв сохранен");
      await loadReviews();
      await loadSalon();
    } catch (error) {
      console.error("Ошибка сохранения отзыва:", error);
      toast.error(error.response?.data?.message || "Ошибка сохранения отзыва");
    }
  }

  if (!salon) {
    return <LoadingSpinner text="Загрузка салона..." />;
  }

  return (
    <div className="min-h-screen bg-pink-50 px-4 py-6 sm:px-6">
  <div className="max-w-6xl mx-auto space-y-8">
        <BackButton />

        <Card className="overflow-hidden p-0 mb-8">
  <img
    src={getImageUrl(salon.imageUrl)}
    alt={salon.name}
    className="w-full h-72 md:h-96 object-cover"
    onError={(e) => {
      e.currentTarget.src = FALLBACK_SALON_IMAGE;
    }}
  />

 <div className="p-6 max-w-6xl mx-auto">
    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
      <div className="flex-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {salon.name}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <StarRating rating={reviewsData.averageRating} size={18} />
            <span className="font-medium text-gray-900">
              {reviewsData.averageRating || "0.0"}
            </span>
          </div>

          <span className="text-gray-500">
            {reviewsData.totalReviews > 0
              ? `${reviewsData.totalReviews} отзывов`
              : "Пока нет отзывов"}
          </span>
        </div>

        <p className="text-gray-600 text-lg leading-8 mb-5 max-w-3xl">
          {salon.description || "Описание пока не добавлено"}
        </p>

        <div className="flex items-start gap-2 text-gray-500 mb-6">
          <MapPin className="w-5 h-5 text-pink-400 mt-1 shrink-0" />
          <span>{salon.address || "Адрес не указан"}</span>
        </div>

        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <Link to={`/booking/${salon.id}`} className="w-full sm:w-auto">
  <Button className="w-full sm:w-auto">Записаться в салон</Button>
</Link>

<a href="#reviews" className="w-full sm:w-auto">
  <Button className="w-full sm:w-auto bg-white text-pink-500 border border-pink-300 hover:bg-pink-50">
    Смотреть отзывы
  </Button>
</a>
        </div>
      </div>

      <div className="w-full lg:w-[280px]">
        <div className="rounded-3xl border border-pink-100 bg-pink-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Кратко о салоне
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Рейтинг</p>
              <p className="font-semibold text-gray-900">
                {reviewsData.averageRating || "0.0"} / 5
              </p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Отзывы</p>
              <p className="font-semibold text-gray-900">
                {reviewsData.totalReviews}
              </p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Услуги</p>
              <p className="font-semibold text-gray-900">
                {salon.services?.length || 0}
              </p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Мастера</p>
              <p className="font-semibold text-gray-900">
                {salon.specialists?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
  <div className="flex items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-2">
      <Scissors className="w-5 h-5 text-pink-400" />
      <h2 className="text-2xl font-semibold text-gray-900">Услуги</h2>
    </div>

    <span className="text-sm text-gray-500">
      {salon.services?.length || 0} услуг
    </span>
  </div>

  {salon.services?.length === 0 ? (
    <EmptyState
      title="Нет услуг"
      description="Салон пока не добавил услуги."
    />
  ) : (
    <div className="space-y-4">
      {(salon.services || []).map((service) => (
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

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1 text-sm text-gray-600">
              <Clock3 className="w-4 h-4 text-pink-400" />
              {service.durationMin} мин
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1 text-sm text-gray-600">
              от {service.price} сом
            </span>
          </div>
        </div>
      ))}
    </div>
  )}
</Card>

          <Card>
  <div className="flex items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-2">
      <ShoppingBag className="w-5 h-5 text-pink-400" />
      <h2 className="text-2xl font-semibold text-gray-900">Товары</h2>
    </div>

    <span className="text-sm text-gray-500">
      {salon.products?.length || 0} товаров
    </span>
  </div>

  {salon.products?.length === 0 ? (
    <EmptyState
      title="Нет товаров"
      description="Салон пока не добавил товары."
    />
  ) : (
    <div className="space-y-4">
      {(salon.products || []).map((product) => (
        <div
          key={product.id}
          className="rounded-3xl border border-pink-100 bg-white p-5 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {product.name}
              </h3>
              <p className="text-gray-600 mt-1 leading-6">
                {product.description || "Описание товара скоро появится"}
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600">
              {product.price} сом
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white px-3 py-1 text-sm text-gray-600">
              В наличии: {product.stock}
            </span>

            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700">
                Есть в наличии
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700">
                Нет в наличии
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</Card>
        </div>

        <Card className="mb-8">
  <div className="flex items-center justify-between gap-4 mb-6">
  <div className="flex items-center gap-2">
    <UserRound className="w-5 h-5 text-pink-400" />
    <h2 className="text-2xl font-semibold text-gray-900">Наши мастера</h2>
  </div>

  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-500">
      {salon.specialists?.length || 0} мастеров
    </span>

      <Link to={`/salons/${salon.id}/specialists`}>
        <Button className="bg-white text-pink-500 border border-pink-300 hover:bg-pink-50">
          Смотреть всех
        </Button>
      </Link>
  </div>
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

        const workDaysMap = {
          1: "Пн",
          2: "Вт",
          3: "Ср",
          4: "Чт",
          5: "Пт",
          6: "Сб",
          7: "Вс",
        };

        const formattedDays = (specialist.workDays || "1,2,3,4,5,6")
          .split(",")
          .map((day) => workDaysMap[day.trim()])
          .filter(Boolean);

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



        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-1 h-fit">
            <div className="flex items-center justify-between gap-4 mb-5">
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      {currentUserReview ? "Изменить отзыв" : "Оставить отзыв"}
    </h2>
    <p className="text-gray-500 mt-1">
      Поделитесь впечатлением о салоне
    </p>
  </div>

  {currentUserReview && (
    <span className="inline-flex rounded-full border border-pink-200 bg-pink-50 px-4 py-1 text-sm font-medium text-pink-600">
      Ваш отзыв
    </span>
  )}
</div>

            {!isAuthenticated() ? (
              <p className="text-gray-500">
                Войдите в аккаунт, чтобы оставить отзыв.
              </p>
            ) : user?.role !== "CLIENT" ? (
              <p className="text-gray-500">
                Только клиенты могут оставлять отзывы.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Рейтинг
                  </label>

                  <StarRating
                    rating={reviewForm.rating}
                    interactive={true}
                    onChange={(value) =>
                      setReviewForm({
                        ...reviewForm,
                        rating: value,
                      })
                    }
                    size={24}
                  />
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
                    placeholder="Напишите ваш отзыв"
                    rows="5"
                    className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                  />
                </div>

                {currentUserReview && (
  <p className="text-sm text-gray-500">
    Вы уже оставляли отзыв. Здесь можно изменить рейтинг и комментарий.
  </p>
)}

                <Button type="submit" className="w-full">
                  {currentUserReview ? "Обновить отзыв" : "Отправить отзыв"}
                </Button>
              </form>
            )}
          </Card>

          <Card className="xl:col-span-2">
  <div className="flex items-center justify-between gap-4 mb-6">
    <h2 className="text-2xl font-semibold text-gray-900">
      Отзывы клиентов
    </h2>

    <span className="text-sm text-gray-500">
      {reviewsData.totalReviews} отзывов
    </span>
  </div>

  {reviewsData.reviews.length === 0 ? (
    <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50 p-10 text-center">
      <p className="text-lg font-medium text-gray-700">
        Пока нет отзывов
      </p>
      <p className="mt-2 text-gray-500">
        Станьте первым, кто поделится впечатлением о салоне.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {reviewsData.reviews.map((review) => {
        const isMine = user && review?.user?.id === user.id;

        return (
          <div
            key={review.id}
            className={`rounded-3xl border p-5 shadow-sm ${
              isMine
                ? "border-pink-200 bg-pink-50"
                : "border-pink-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                {getInitials(review?.user?.fullName)}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">
                    {review?.user?.fullName || "Пользователь"}
                  </p>

                  {isMine && (
                    <span className="inline-flex rounded-full border border-pink-200 bg-white px-3 py-1 text-xs font-medium text-pink-600">
                      Ваш отзыв
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} size={16} />
                  <span className="text-sm text-gray-500">
                    {formatReviewDate(review.createdAt)}
                  </span>
                </div>

                <p className="text-gray-700 leading-7">
                  {review.comment || "Без текста"}
                </p>
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
    </div>
  );
}