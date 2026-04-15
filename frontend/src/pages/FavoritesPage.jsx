import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Store } from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import BackToHome from "../components/BackToHome";
import { FALLBACK_SALON_IMAGE, getImageUrl } from "../services/constants";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setLoading(true);
      const res = await api.get("/favorites");
      setFavorites(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("LOAD FAVORITES ERROR:", error);
      toast.error(error.response?.data?.message || "Не удалось загрузить избранное");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  async function removeFavorite(salonId) {
    try {
      await api.delete(`/favorites/${salonId}`);
      toast.success("Удалено из избранного");
      loadFavorites();
    } catch (error) {
      console.error("REMOVE FAVORITE ERROR:", error);
      toast.error(error.response?.data?.message || "Ошибка удаления");
    }
  }

  if (loading) {
    return <LoadingSpinner text="Загружаем избранные салоны..." />;
  }

  const validFavorites = favorites.filter((favorite) => favorite?.salon);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <BackToHome />
        <h1 className="text-4xl font-bold mb-8">Избранные салоны</h1>

        {validFavorites.length === 0 ? (
          <EmptyState
            title="Избранное пока пусто"
            description="Добавляйте понравившиеся салоны, чтобы быстро находить их позже."
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validFavorites.map((favorite) => {
              const salon = favorite.salon;
              const reviews = Array.isArray(salon.reviews) ? salon.reviews : [];
              const avgRating = reviews.length
                ? (
                    reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
                    reviews.length
                  ).toFixed(1)
                : 0;

              return (
                <Card
                  key={favorite.id}
                  className="overflow-hidden p-0 hover:shadow-xl transition duration-300 h-full flex flex-col"
                >
                  <img
                    src={getImageUrl(salon.imageUrl)}
                    alt={salon.name || "Salon"}
                    className="w-full h-56 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_SALON_IMAGE;
                    }}
                  />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <div className="flex items-start gap-2 mb-2">
                        <Store className="w-5 h-5 text-pink-400 mt-1 shrink-0" />
                        <h2 className="text-2xl font-semibold text-gray-900 leading-tight break-words">
                          {salon.name || "Без названия"}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        <StarRating rating={Number(avgRating)} size={16} />
                        <span className="text-sm text-gray-500">
                          {reviews.length
                            ? `${avgRating} (${reviews.length})`
                            : "Пока нет отзывов"}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2 min-h-[48px]">
                      {salon.description || "Описание пока не добавлено"}
                    </p>

                    <div className="flex items-start gap-2 text-gray-500 mb-4 min-h-[28px]">
                      <MapPin className="w-4 h-4 mt-1 shrink-0" />
                      <span className="break-words">
                        {salon.address || "Адрес не указан"}
                      </span>
                    </div>

                    <div className="flex gap-3 mt-auto pt-2">
                      <Link to={`/salons/${salon.id}`} className="w-full">
                        <Button className="w-full bg-white text-pink-500 border border-pink-300 hover:bg-pink-50">
                          Подробнее
                        </Button>
                      </Link>

                      <Button
                        className="w-full bg-white text-pink-500 border border-pink-300 hover:bg-pink-50"
                        onClick={() => removeFavorite(salon.id)}
                      >
                        Убрать
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}