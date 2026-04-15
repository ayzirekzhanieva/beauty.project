import { Routes, Route, Link, useNavigate } from "react-router-dom";
import SalonsPage from "./pages/SalonsPage";
import BookingPage from "./pages/BookingPage";
import SalonDetailsPage from "./pages/SalonDetailsPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import OwnerDashboardPage from "./pages/OwnerDashboardPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { getUser, logout } from "./services/auth";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function Navbar() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate("/");
    window.location.reload();
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-pink-500">
        Beauty Studio Hub
      </Link>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link
              to="/profile"
              className="text-gray-700 font-medium hover:text-pink-500"
            >
              Профиль
            </Link>

            {user.role === "CLIENT" && (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-700 font-medium hover:text-pink-500"
                >
                  Мои записи
                </Link>

                <Link
                  to="/favorites"
                  className="text-gray-700 font-medium hover:text-pink-500"
                >
                  Избранное
                </Link>
              </>
            )}

            {user.role === "OWNER" && (
              <Link
                to="/owner-dashboard"
                className="text-gray-700 font-medium hover:text-pink-500"
              >
                Кабинет владельца
              </Link>
            )}

            <span className="text-gray-600">{user.fullName}</span>

            <button
              onClick={handleLogout}
              className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-2xl shadow-md transition"
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-700 font-medium hover:text-pink-500"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-2xl shadow-md transition"
            >
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<SalonsPage />} />
        <Route path="/salons/:id" element={<SalonDetailsPage />} />
        <Route path="/booking/:salonId" element={<BookingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute role="CLIENT">
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute role="CLIENT">
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute role="OWNER">
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </div>
  );
}