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
import SpecialistDetailsPage from "./pages/SpecialistDetailsPage";
import Navbar from "./components/Navbar";
import { useLocation } from "react-router-dom";
import SalonSpecialistsPage from "./pages/SalonSpecialistsPage";

export default function App() {
  const location = useLocation();

const hideNavbarRoutes = [
  "/login",
  "/register",
  "/forgot-password"
];

const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  return (
    <div>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<SalonsPage />} />
        <Route path="/salons/:id" element={<SalonDetailsPage />} />
        <Route path="/booking/:salonId" element={<BookingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/salons/:id/specialists" element={<SalonSpecialistsPage />} />

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
        <Route path="/specialists/:id" element={<SpecialistDetailsPage />} />
      </Routes>
    </div>
  );
}