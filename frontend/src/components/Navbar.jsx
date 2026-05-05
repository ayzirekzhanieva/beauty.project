import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  CircleUserRound,
  Menu,
  X,
} from "lucide-react";
import { getUser, isAuthenticated } from "../services/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isAuthenticated();

  const [openMenu, setOpenMenu] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  const profileMenuRef = useRef(null);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeMobileMenu() {
    setOpenMobileMenu(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenMobileMenu(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-200 bg-white text-pink-500 shadow-sm transition hover:bg-pink-50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-pink-500 md:text-2xl"
            >
              <Sparkles className="h-6 w-6" />
              Glow Find
            </Link>
          </div>

          <nav className="ml-auto hidden items-center gap-3 lg:flex">
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
          </nav>

          {loggedIn && (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-200 bg-white text-pink-500 shadow-sm transition hover:bg-pink-50 md:h-12 md:w-12"
              >
                <CircleUserRound className="h-6 w-6 md:h-7 md:w-7" />
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
        </div>
      </header>

      {openMobileMenu && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeMobileMenu}
          />

          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-pink-100 px-4 py-4">
              <div className="flex items-center gap-2 text-xl font-bold text-pink-500">
                <Sparkles className="h-5 w-5" />
                Glow Find
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-pink-200 bg-white text-pink-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  navigate("/");
                }}
                className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
              >
                Главная
              </button>

              {!loggedIn && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      navigate("/login");
                    }}
                    className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
                  >
                    Войти
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      navigate("/register");
                    }}
                    className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
                  >
                    Регистрация
                  </button>
                </>
              )}

              {loggedIn && user?.role === "CLIENT" && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/my-bookings");
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
                >
                  Мои записи
                </button>
              )}

              {loggedIn && user?.role === "OWNER" && (
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    navigate("/owner-dashboard");
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-pink-50"
                >
                  Кабинет
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}