import { Navigate } from "react-router-dom";
import { getUser, isAuthenticated } from "../services/auth";

export default function ProtectedRoute({ children, role }) {
  const user = getUser();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}