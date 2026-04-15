import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  MapPin,
  Store,
  Sparkles,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import { getUser, isAuthenticated } from "../services/auth";
import { FALLBACK_SALON_IMAGE, getImageUrl } from "../services/constants";

export default function SalonsPage() {
  const user = getUser();

  const [salons, setSalons] = useState([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [loading, setLoading] = useState(true);
  const [favoriteSalonIds, setFavoriteSalonIds] = useState([]);

  useEffect(() => {
    loadSalons();
  }, []);

  useEffect(() => {
    if (isAuthenticated() && user?.role === "CLIENT") {
      loadFavorites();
    }
  }, []);

  async function loadSalons() {
    try {
      setLoading(true);
      const res = await api.get("/salons");
      setSalons(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Ошибка загрузки салонов:", error);
      setSalons([]);
      toast.error("Не удалось загрузить салоны");
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const res = await api.get("/favorites");
      setFavoriteSalonIds(
        Array.isArray(res.data) ? res.data.map((item) => item.salonId) : []
      );
    } catch (error) {
      console.error("LOAD FAVORITES ERROR:", error);
    }
  }

  async function toggleFavorite(salonId) {
    if (!isAuthenticated()) {
      toast.error("Сначала войдите в аккаунт");
      return;
    }

    if (user?.role !== "CLIENT") {
      toast.error("Избранное доступно только клиентам");
      return;
    }

    try {
      const isFavorite = favoriteSalonIds.includes(salonId);

      if (isFavorite) {
        await api.delete(`/favorites/${salonId}`);
        setFavoriteSalonIds((prev) => prev.filter((id) => id !== salonId));
        toast.success("Удалено из избранного");
      } else {
        await api.post(`/favorites/${salonId}`);
        setFavoriteSalonIds((prev) => [...prev, salonId]);
        toast.success("Добавлено в избранное");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка избранного");
    }
  }

  const filteredSalons = useMemo(() => {
    let result = [...salons];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((salon) => {
        const salonNameMatch = salon.name?.toLowerCase().includes(query);

        const serviceNameMatch = (salon.services || []).some((service) =>
          service.name?.toLowerCase().includes(query)
        );

        return salonNameMatch || serviceNameMatch;
      });
    }

    if (priceFilter !== "ALL") {
      const maxPrice = Number(priceFilter);

      result = result.filter((salon) =>
        (salon.services || []).some((service) => Number(service.price) <= maxPrice)
      );
    }

    if (sortBy === "AZ") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "CHEAPEST") {
      result.sort((a, b) => {
        const aMin =
          a.services?.length > 0
            ? Math.min(...a.services.map((service) => Number(service.price)))
            : Infinity;

        const bMin =
          b.services?.length > 0
            ? Math.min(...b.services.map((service) => Number(service.price)))
            : Infinity;

        return aMin - bMin;
      });
    }

    if (sortBy === "MOST_SERVICES") {
      result.sort((a, b) => (b.services?.length || 0) - (a.services?.length || 0));
    }

    return result;
  }, [salons, search, priceFilter, sortBy]);

  if (loading) {
    return <LoadingSpinner text="Загружаем салоны..." />;
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <section className="px-6 pt-10 pb-6">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-pink-100 via-pink-50 to-white rounded-[32px] p-8 md:p-12 shadow-md">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">
                Soft Pink Minimalism
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-5">
              Найди свой любимый beauty salon в пару кликов
            </h1>

            <p className="text-lg text-gray-600 mb-8">
              Записывайся на услуги, изучай товары салонов и управляй бронированиями
              в одном красивом маркетплейсе.
            </p>

            <div className="bg-white rounded-3xl shadow-md px-6 py-4 flex items-center gap-4">
              <Search className="w-5 h-5 text-pink-400" />
              <input
                type="text"
                placeholder="Поиск салонов или услуг..."
                className="w-full outline-none text-lg bg-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-md p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-5 h-5 text-pink-500" />
              <h2 className="text-xl font-semibold">Фильтры и сортировка</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Фильтр по цене услуг
                </label>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                >
                  <option value="ALL">Все цены</option>
                  <option value="20">До 20 сом</option>
                  <option value="30">До 30 сом</option>
                  <option value="50">До 50 сом</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Сортировка
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-pink-200 outline-none bg-white"
                >
                  <option value="DEFAULT">По умолчанию</option>
                  <option value="AZ">A–Z</option>
                  <option value="CHEAPEST">Сначала дешевле</option>
                  <option value="MOST_SERVICES">Больше услуг</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Салоны красоты</h2>
            <p className="text-gray-500">Найдено: {filteredSalons.length}</p>
          </div>

          {filteredSalons.length === 0 ? (
            <EmptyState
              title="Ничего не найдено"
              description="Попробуйте изменить поисковый запрос или фильтры."
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => {
                const avgRating =
                  salon.reviews?.length > 0
                    ? (
                        salon.reviews.reduce((sum, review) => sum + review.rating, 0) /
                        salon.reviews.length
                      ).toFixed(1)
                    : 0;

                return (
                  <Card
                    key={salon.id}
                    className="overflow-hidden p-0 hover:shadow-xl transition duration-300 h-full flex flex-col"
                  >
                    <img
                      src={getImageUrl(salon.imageUrl)}
                      alt={salon.name}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_SALON_IMAGE;
                      }}
                    />

                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <Store className="w-5 h-5 text-pink-400 mt-1 shrink-0" />
                            <h2 className="text-2xl font-semibold text-gray-900 leading-tight break-words">
                              {salon.name}
                            </h2>
                          </div>

                          {user?.role === "CLIENT" && (
                            <button
                              type="button"
                              onClick={() => toggleFavorite(salon.id)}
                              className="shrink-0"
                            >
                              <Heart
                                className={
                                  favoriteSalonIds.includes(salon.id)
                                    ? "w-5 h-5 fill-pink-500 text-pink-500"
                                    : "w-5 h-5 text-pink-300 hover:text-pink-500"
                                }
                              />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <StarRating rating={Number(avgRating)} size={16} />
                          <span className="text-sm text-gray-500">
                            {salon.reviews?.length
                              ? `${avgRating} (${salon.reviews.length})`
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

                      <div className="mb-5">
                        <p className="font-medium mb-2">Популярные услуги:</p>
                        <div className="flex flex-wrap gap-2">
                          {(salon.services || []).slice(0, 4).map((service) => (
                            <span
                              key={service.id}
                              className="text-sm bg-pink-50 text-pink-600 px-3 py-1 rounded-full border border-pink-100"
                            >
                              {service.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto pt-2">
                        <Link to={`/salons/${salon.id}`} className="w-full">
                          <Button className="w-full bg-white text-pink-500 border border-pink-300 hover:bg-pink-50">
                            Подробнее
                          </Button>
                        </Link>

                        <Link to={`/booking/${salon.id}`} className="w-full">
                          <Button className="w-full">Записаться</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}