import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Scissors,
  ShoppingBag,
  ArrowLeft,
  Clock3,
  DollarSign,
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
import { UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

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

  const [selectedSpecialistId, setSelectedSpecialistId] = useState("");

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
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-pink-500 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        <Card className="overflow-hidden p-0 mb-8">
          <img
            src={getImageUrl(salon.imageUrl)}
            alt={salon.name}
            className="w-full h-80 object-cover"
          />

          <div className="p-6 md:p-8">
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {salon.name}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <StarRating rating={reviewsData.averageRating} size={18} />
                <span className="text-gray-500">
                  {reviewsData.totalReviews
                    ? `${reviewsData.averageRating} (${reviewsData.totalReviews} отзывов)`
                    : "Пока нет отзывов"}
                </span>
              </div>

              <p className="text-gray-600 text-lg mb-4">
                {salon.description || "Описание пока не добавлено"}
              </p>

              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-5 h-5 text-pink-400" />
                <span>{salon.address || "Адрес не указан"}</span>
              </div>
            </div>

            <Link to={`/booking/${salon.id}`}>
              <Button>Записаться в салон</Button>
            </Link>
          </div>
        </Card>

        <div className="mb-6">
  <label className="block text-sm font-medium text-gray-600 mb-2">
    Выберите мастера
  </label>

  <select
    value={selectedSpecialistId}
    onChange={(e) => setSelectedSpecialistId(e.target.value)}
    className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
    required
  >
    <option value="">Выберите мастера</option>

    {salon.specialists.map((specialist) => (
      <option key={specialist.id} value={specialist.id}>
        {specialist.fullName} — {specialist.title}
      </option>
    ))}
  </select>
</div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="w-5 h-5 text-pink-400" />
              <h2 className="text-2xl font-semibold">Услуги</h2>
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
                    className="border border-pink-100 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <span className="text-pink-500 font-bold">
                        {service.price} сом
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">
                      {service.description || "Без описания"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="w-4 h-4" />
                        {service.durationMin} мин
                      </span>

                      <span className="inline-flex items-center gap-1">
                        {service.price} сом
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              <h2 className="text-2xl font-semibold">Товары</h2>
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
                    className="border border-pink-100 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <span className="text-pink-500 font-bold">
                        {product.price} сом
                      </span>
                    </div>

                    <p className="text-gray-600 mb-2">
                      {product.description || "Без описания"}
                    </p>

                    <p className="text-sm text-gray-500">
                      В наличии: {product.stock}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="mb-8">
  <div className="flex items-center gap-2 mb-4">
    <UserRound className="w-5 h-5 text-pink-400" />
    <h2 className="text-2xl font-semibold">Наши мастера</h2>
  </div>

  {salon.specialists?.length === 0 ? (
    <EmptyState
      title="Мастера пока не добавлены"
      description="Скоро здесь появится команда салона."
    />
  ) : (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {salon.specialists.map((specialist) => (
        <div
          key={specialist.id}
          className="border border-pink-100 rounded-2xl overflow-hidden bg-white"
        >
          <img
            src={getImageUrl(specialist.photoUrl)}
            alt={specialist.fullName}
            className="w-full h-56 object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_SALON_IMAGE;
            }}
          />

          <div className="p-4">
            <h3 className="text-xl font-semibold">{specialist.fullName}</h3>
            <p className="text-pink-500 font-medium mb-2">
              {specialist.title || "Специалист"}
            </p>
            <p className="text-gray-600">
              {specialist.bio || "Описание скоро появится"}
            </p>
          </div>
          <Button
  onClick={() =>
    navigate(`/booking/${salon.id}?specialistId=${specialist.id}`)
  }
  className="w-full mt-4"
>
  Записаться к мастеру
</Button>
          {specialist.works?.length > 0 && (
  <div className="mt-4">
    <p className="font-medium mb-2">Портфолио</p>
    <div className="grid grid-cols-2 gap-2">
      {specialist.works.map((work) => (
        <div key={work.id}>
          <img
            src={getImageUrl(work.imageUrl)}
            alt={work.caption || "Portfolio work"}
            className="w-full h-28 object-cover rounded-xl"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_SALON_IMAGE;
            }}
          />
          {work.caption && (
            <p className="text-xs text-gray-500 mt-1">{work.caption}</p>
          )}
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      ))}
    </div>
  )}
</Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">Оставить отзыв</h2>

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
                    Вы уже оставляли отзыв. Ниже можно его изменить.
                  </p>
                )}

                <Button type="submit" className="w-full">
                  {currentUserReview ? "Обновить отзыв" : "Отправить отзыв"}
                </Button>
              </form>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Отзывы клиентов</h2>

            {reviewsData.reviews.length === 0 ? (
              <EmptyState
                title="Пока нет отзывов"
                description="Станьте первым, кто поделится впечатлением о салоне."
              />
            ) : (
              <div className="space-y-4">
                {reviewsData.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border border-pink-100 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review?.user?.fullName || "Пользователь"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <StarRating rating={review.rating} size={16} />
                    </div>

                    <p className="text-gray-600">
                      {review.comment || "Без текста"}
                    </p>
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