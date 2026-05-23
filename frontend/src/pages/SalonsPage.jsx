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
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [sortBy, setSortBy] = useState("DEFAULT");
  const [loading, setLoading] = useState(true);
  const [favoriteSalonIds, setFavoriteSalonIds] = useState([]);
  const [onlyReviewed, setOnlyReviewed] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");


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
  const query = search.toLowerCase().trim();

  result = result.filter((salon) => {
    const text = `
      ${salon.name || ""}
      ${salon.description || ""}
      ${salon.address || ""}
      ${(salon.services || []).map((s) => s.name).join(" ")}
    `.toLowerCase();

    return text.includes(query);
  });
}
    if (selectedCategory) {
  result = result.filter((salon) => {
    const text = `
      ${salon.name || ""}
      ${salon.description || ""}
      ${(salon.services || []).map((s) => s.name).join(" ")}
    `.toLowerCase();

    return text.includes(selectedCategory.toLowerCase());
  });
}

    const minPriceValue = minPriceFilter ? Number(minPriceFilter) : null;
const maxPriceValue =
  maxPriceFilter
    ? Number(maxPriceFilter)
    : priceFilter !== "ALL"
    ? Number(priceFilter)
    : null;

if (minPriceValue !== null || maxPriceValue !== null) {
  result = result.filter((salon) =>
    (salon.services || []).some((service) => {
      const price = Number(service.price);

      const matchesMin =
        minPriceValue === null || price >= minPriceValue;

      const matchesMax =
        maxPriceValue === null || price <= maxPriceValue;

      return matchesMin && matchesMax;
    })
  );
}

    const activeMaxPrice =
  customPrice !== "" ? Number(customPrice) : priceFilter !== "ALL" ? Number(priceFilter) : null;

if (activeMaxPrice) {
  result = result.filter((salon) =>
    (salon.services || []).some(
      (service) => Number(service.price) <= activeMaxPrice
    )
  );
}

    if (onlyReviewed) {
  result = result.filter((salon) => (salon.reviews?.length || 0) > 0);
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

    if (sortBy === "EXPENSIVE") {
  result.sort((a, b) => {
    const aMax =
      a.services?.length > 0
        ? Math.max(...a.services.map((service) => Number(service.price)))
        : 0;

    const bMax =
      b.services?.length > 0
        ? Math.max(...b.services.map((service) => Number(service.price)))
        : 0;

    return bMax - aMax;
  });
}

if (sortBy === "MOST_REVIEWS") {
  result.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
}

if (sortBy === "BEST_RATING") {
  result.sort((a, b) => {
    const aRating =
      a.reviews?.length > 0
        ? a.reviews.reduce((sum, review) => sum + review.rating, 0) /
          a.reviews.length
        : 0;

    const bRating =
      b.reviews?.length > 0
        ? b.reviews.reduce((sum, review) => sum + review.rating, 0) /
          b.reviews.length
        : 0;

    return bRating - aRating;
  });
}

if (sortBy === "NAME_ASC") {
  result.sort((a, b) => a.name.localeCompare(b.name));
}

if (sortBy === "NAME_DESC") {
  result.sort((a, b) => b.name.localeCompare(a.name));
}

    if (sortBy === "MOST_SERVICES") {
      result.sort((a, b) => (b.services?.length || 0) - (a.services?.length || 0));
    }

    return result;
}, [salons, search, selectedCategory, priceFilter, minPriceFilter, maxPriceFilter, sortBy, onlyReviewed]);

  if (loading) {
    return <LoadingSpinner text="Загружаем салоны..." />;
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      <section className="px-6 pt-8 pb-4">
  <div className="max-w-6xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-[#fdeae5]">
    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
      Найди beauty salon рядом
    </h1>

    <p className="text-gray-500 mb-5">
      Салоны, услуги, мастера и запись онлайн.
    </p>

    <div className="bg-[#fff7f5] rounded-2xl px-5 py-3 flex items-center gap-3 border border-[#fdeae5]">
      <Search className="w-5 h-5 text-pink-400" />
      <input
        type="text"
        placeholder="Поиск салонов или услуг..."
        className="w-full outline-none bg-transparent"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  </div>
</section>

      <section className="px-6 pb-10">
  <div className="max-w-6xl mx-auto grid lg:grid-cols-[260px_1fr] gap-6">
    <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto bg-white rounded-3xl shadow-md border border-[#fdeae5] p-5">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Фильтры</h2>

      <div className="mb-6">
  <h3 className="font-semibold text-gray-800 mb-3">
    Популярные категории
  </h3>

  <div className="flex flex-col gap-2">
    {["Маникюр", "Волосы", "Макияж", "Брови", "Уход"].map((category) => (
      <button
        key={category}
        type="button"
        onClick={() =>
  setSelectedCategory(selectedCategory === category ? "" : category)
}
        className={`text-left rounded-2xl border px-4 py-2 text-sm font-medium transition ${
  selectedCategory === category
    ? "bg-[#ee8585] text-white border-[#ee8585]"
    : "bg-[#fff7f5] text-[#ee8585] border-[#fdeae5] hover:bg-pink-100"
}`}
      >
        {category}
      </button>
    ))}
  </div>
</div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Цена</h3>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          >
            <option value="ALL">Все цены</option>
            <option value="20">До 2000 сом</option>
            <option value="30">До 3000 сом</option>
            <option value="50">До 5000 сом</option>
          </select>
          <div className="grid grid-cols-2 gap-2 mt-3">
  <input
    type="number"
    value={minPriceFilter}
    onChange={(e) => setMinPriceFilter(e.target.value)}
    placeholder="от"
    className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
  />

  <input
    type="number"
    value={maxPriceFilter}
    onChange={(e) => setMaxPriceFilter(e.target.value)}
    placeholder="до"
    className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
  />
</div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Отзывы</h3>

          <label className="flex items-center gap-3 text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyReviewed}
              onChange={(e) => setOnlyReviewed(e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            Только с отзывами
          </label>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Сортировка</h3>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          >
            <option value="DEFAULT">По умолчанию</option>
            <option value="CHEAPEST">Сначала дешевле</option>
            <option value="EXPENSIVE">Сначала дороже</option>
            <option value="MOST_SERVICES">Больше услуг</option>
            <option value="MOST_REVIEWS">Больше отзывов</option>
<option value="BEST_RATING">Лучший рейтинг</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setSelectedCategory("");
            setPriceFilter("ALL");
            setMinPriceFilter("");
            setMaxPriceFilter("");
            setOnlyReviewed(false);
            setSortBy("DEFAULT");
          }}
          className="w-full rounded-2xl border border-pink-200 bg-[#fff7f5] px-4 py-3 text-[#ee8585] font-medium hover:bg-pink-100 transition"
        >
          Сбросить фильтры
        </button>
      </div>
    </aside>

    <main>
      <button
  type="button"
  onClick={() => setIsMobileFiltersOpen(true)}
  className="lg:hidden mb-4 w-full rounded-2xl bg-white border border-[#fdeae5] px-4 py-3 text-[#ee8585] font-medium shadow-sm"
>
  Фильтры
</button>
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
        <div className="space-y-5">
          {filteredSalons.map((salon) => {
            const avgRating =
              salon.reviews?.length > 0
                ? (
                    salon.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / salon.reviews.length
                  ).toFixed(1)
                : 0;

            const minPrice =
              salon.services?.length > 0
                ? Math.min(
                    ...salon.services.map((service) => Number(service.price))
                  )
                : null;

            return (
              <Card
                key={salon.id}
                className="relative overflow-hidden p-4 flex flex-col md:flex-row gap-5 border border-[#fdeae5] hover:shadow-xl transition bg-white"
              >
                <img
                  src={getImageUrl(salon.imageUrl)}
                  alt={salon.name}
                  className="w-full md:w-56 h-44 object-cover rounded-2xl bg-[#fff7f5]"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_SALON_IMAGE;
                  }}
                />

                <div className="flex-1 pr-10">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {salon.name}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <StarRating rating={Number(avgRating)} size={16} />
                    <span className="text-sm text-gray-500">
                      {salon.reviews?.length
                        ? `${avgRating} • ${salon.reviews.length} отзывов`
                        : "Пока нет отзывов"}
                    </span>
                  </div>

                  <p className="mt-3 text-gray-600 line-clamp-2">
                    {salon.services?.slice(0, 4).map((s) => s.name).join(", ") ||
                      "Услуги пока не добавлены"}
                  </p>

                  <div className="flex items-start gap-2 text-gray-500 mt-3">
                    <MapPin className="w-4 h-4 mt-1 shrink-0" />
                    <span>{salon.address || "Адрес не указан"}</span>
                  </div>

                  {minPrice !== null && (
                    <p className="mt-3 text-[#ee8585] font-semibold">
                      от {minPrice} сом
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    <Link to={`/salons/${salon.id}`}>
                      <Button className="bg-white text-[#ee8585] border border-pink-300 hover:bg-[#fff7f5]">
                        Подробнее
                      </Button>
                    </Link>

                    <Link to={`/booking/${salon.id}`}>
                      <Button>Записаться</Button>
                    </Link>
                  </div>
                </div>

                {user?.role === "CLIENT" && (
                  <button
                    type="button"
                    onClick={() => toggleFavorite(salon.id)}
                    className="absolute top-5 right-5"
                  >
                    <Heart
                      className={
                        favoriteSalonIds.includes(salon.id)
                          ? "w-7 h-7 fill-[#ee8585] text-[#ee8585]"
                          : "w-7 h-7 text-pink-300 hover:text-[#ee8585]"
                      }
                    />
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </main>
  </div>
</section>
{isMobileFiltersOpen && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-end lg:hidden">
    <div className="w-full max-h-[85vh] overflow-y-auto bg-white rounded-t-3xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold">Фильтры</h2>

        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(false)}
          className="text-[#ee8585] font-medium"
        >
          Закрыть
        </button>
      </div>

      <div className="mb-6">
  <h3 className="font-semibold text-gray-800 mb-3">
    Популярные категории
  </h3>

  <div className="flex flex-col gap-2">
    {["Маникюр", "Волосы", "Макияж", "Брови", "Уход"].map((category) => (
      <button
        key={category}
        type="button"
        onClick={() =>
  setSelectedCategory(selectedCategory === category ? "" : category)
}
        className={`text-left rounded-2xl border px-4 py-2 text-sm font-medium transition ${
  selectedCategory === category
    ? "bg-[#ee8585] text-white border-[#ee8585]"
    : "bg-[#fff7f5] text-[#ee8585] border-[#fdeae5] hover:bg-pink-100"
}`}
      >
        {category}
      </button>
    ))}
  </div>
</div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Цена</h3>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          >
            <option value="ALL">Все цены</option>
            <option value="20">До 2000 сом</option>
            <option value="30">До 3000 сом</option>
            <option value="50">До 5000 сом</option>
          </select>
          <div className="grid grid-cols-2 gap-2 mt-3">
  <input
    type="number"
    value={minPriceFilter}
    onChange={(e) => setMinPriceFilter(e.target.value)}
    placeholder="от"
    className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
  />

  <input
    type="number"
    value={maxPriceFilter}
    onChange={(e) => setMaxPriceFilter(e.target.value)}
    placeholder="до"
    className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
  />
</div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Отзывы</h3>

          <label className="flex items-center gap-3 text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyReviewed}
              onChange={(e) => setOnlyReviewed(e.target.checked)}
              className="w-4 h-4 accent-pink-500"
            />
            Только с отзывами
          </label>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Сортировка</h3>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-3xl border border-[#fdeae5] bg-[#fffdfc] px-5 py-3 text-base outline-none transition focus:border-[#ee8585] focus:ring-4 focus:ring-[#fff1ee]"
          >
            <option value="DEFAULT">По умолчанию</option>
            <option value="CHEAPEST">Сначала дешевле</option>
            <option value="EXPENSIVE">Сначала дороже</option>
            <option value="MOST_SERVICES">Больше услуг</option>
            <option value="MOST_REVIEWS">Больше отзывов</option>
<option value="BEST_RATING">Лучший рейтинг</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setSelectedCategory("");
            setPriceFilter("ALL");
            setMinPriceFilter("");
            setMaxPriceFilter("");
            setOnlyReviewed(false);
            setSortBy("DEFAULT");
          }}
          className="w-full rounded-2xl border border-pink-200 bg-[#fff7f5] px-4 py-3 text-[#ee8585] font-medium hover:bg-pink-100 transition"
        >
          Сбросить фильтры
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}