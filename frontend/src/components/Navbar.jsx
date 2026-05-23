import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Sparkles,CircleUserRound,Menu,X,Home,CalendarDays,} from "lucide-react";
import { getUser, isAuthenticated } from "../services/auth";
import api from "../services/api";
import { Bell, MessageCircle } from "lucide-react";
import { QrCode } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const loggedIn = isAuthenticated();

  const [openMenu, setOpenMenu] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  function handleLogout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  loadUnreadCount();

  const interval = setInterval(loadUnreadCount, 5000);

  return () => clearInterval(interval);
}, []);

async function loadUnreadCount() {
  try {
    const res = await api.get("/notifications/unread-count");
    setUnreadCount(res.data.count || 0);
  } catch (error) {
    setUnreadCount(0);
  }
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
      <header className="sticky top-0 z-50 border-b border-[#fdeae5] bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpenMobileMenu(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-pink-200 bg-white text-[#ee8585] shadow-sm transition hover:bg-[#fff7f5] md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-[#ee8585] md:text-2xl"
            >
              <Sparkles className="h-6 w-6" />
              Glow Find
            </Link>
          </div>

          <nav className="ml-auto hidden items-center gap-3 lg:flex">
            <Link
  to="/"
  className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#fdeae5] shadow-sm hover:bg-[#fff7f5] transition"
>
  <Home className="w-5 h-5 text-[#ee8585]" />
</Link>

            {!loggedIn && (
              <>
                <Link
                  to="/login"
                  className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-[#fff7f5]"
                >
                  Войти
                </Link>

                <Link
                  to="/register"
                  className="rounded-2xl px-4 py-2 text-gray-700 transition hover:bg-[#fff7f5]"
                >
                  Регистрация
                </Link>
              </>
            )}

            {loggedIn && user?.role === "CLIENT" && (
              <Link
  to="/my-bookings"
  className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#fdeae5] shadow-sm hover:bg-[#fff7f5] transition"
>
  <CalendarDays className="w-5 h-5 text-[#ee8585]" />
</Link>
            )}
            <Link
  to="/my-chats"
  className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#fdeae5] shadow-sm hover:bg-[#fff7f5] transition"
>
  <MessageCircle className="w-5 h-5 text-[#ee8585]" />
</Link>
            <Link
  to="/notifications"
  className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#fdeae5] shadow-sm hover:bg-[#fff7f5] transition"
>
  <Bell className="w-5 h-5 text-[#ee8585]" />

  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center bg-[#ee8585] text-white text-[11px] rounded-full font-medium">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  )}
</Link>
<Link
  to="/qr-code"
  className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-white border border-[#fdeae5] shadow-sm hover:bg-[#fff7f5] transition"
>
  <QrCode className="w-5 h-5 text-[#ee8585]" />
</Link>
          </nav>

          {loggedIn && (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-200 bg-white text-[#ee8585] shadow-sm transition hover:bg-[#fff7f5] md:h-12 md:w-12"
              >
                <CircleUserRound className="h-6 w-6 md:h-7 md:w-7" />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-3xl border border-[#fdeae5] bg-white p-2 shadow-xl">
                  {user?.role === "OWNER" && (
  <button
    type="button"
    onClick={() => {
      setOpenMenu(false);
      navigate("/owner-dashboard");
    }}
    className="w-full rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
  >
    Кабинет
  </button>
)}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(false);
                      navigate("/profile");
                    }}
                    className="w-full rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
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
                      className="w-full rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
                    >
                      Избранное
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-2xl px-4 py-3 text-left text-[#ee8585] transition hover:bg-[#fff7f5]"
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
            <div className="flex items-center justify-between border-b border-[#fdeae5] px-4 py-4">
              <div className="flex items-center gap-2 text-xl font-bold text-[#ee8585]">
                <Sparkles className="h-5 w-5" />
                Glow Find
              </div>

              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-pink-200 bg-white text-[#ee8585]"
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
                className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
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
                    className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
                  >
                    Войти
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeMobileMenu();
                      navigate("/register");
                    }}
                    className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
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
                  className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
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
                  className="rounded-2xl px-4 py-3 text-left text-gray-700 transition hover:bg-[#fff7f5]"
                >
                  Кабинет
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {loggedIn && (
  <div className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-2 backdrop-blur-xl shadow-lg lg:hidden">
    
    <Link
      to="/"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7f5]"
    >
      <Home className="h-5 w-5 text-[#ee8585]" />
    </Link>

    {user?.role === "CLIENT" && (
      <Link
        to="/my-bookings"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7f5]"
      >
        <CalendarDays className="h-5 w-5 text-[#ee8585]" />
      </Link>
    )}

    <Link
      to="/my-chats"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7f5]"
    >
      <MessageCircle className="h-5 w-5 text-[#ee8585]" />
    </Link>

    <Link
      to="/notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7f5]"
    >
      <Bell className="h-5 w-5 text-[#ee8585]" />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#ee8585] text-white text-[10px] rounded-full">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>

    <Link
      to="/qr-code"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff7f5]"
    >
      <QrCode className="h-5 w-5 text-[#ee8585]" />
    </Link>
  </div>
)}
    </>
  );
}