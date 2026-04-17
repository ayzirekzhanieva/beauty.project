import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, CircleUserRound } from "lucide-react";
import { getUser, isAuthenticated } from "../services/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isAuthenticated();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-pink-500"
        >
          <Sparkles className="h-6 w-6" />
          GlowFind
        </Link>

        <nav className="flex items-center gap-3 flex-wrap">
          <Link
            to="/"
            className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-pink-50"
          >
            Главная
          </Link>

          {!loggedIn && (
            <>
              <Link
                to="/login"
                className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-pink-50"
              >
                Войти
              </Link>

              <Link
                to="/register"
                className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-pink-50"
              >
                Регистрация
              </Link>
            </>
          )}

          {loggedIn && user?.role === "CLIENT" && (
            <Link
              to="/my-bookings"
              className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-pink-50"
            >
              Мои записи
            </Link>
          )}

          {loggedIn && user?.role === "OWNER" && (
            <Link
              to="/owner-dashboard"
              className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-pink-50"
            >
              Кабинет
            </Link>
          )}

          {loggedIn && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-pink-200 bg-white text-pink-500 shadow-sm transition hover:bg-pink-50"
              >
                <CircleUserRound className="h-7 w-7" />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-pink-100 bg-white p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
                  >
                    Настройки
                  </button>

                  {user?.role === "CLIENT" && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenu(false);
                        navigate("/favorites");
                      }}
                      className="w-full rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
                    >
                      Избранное
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl px-4 py-3 text-left text-pink-500 transition hover:bg-pink-50"
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}