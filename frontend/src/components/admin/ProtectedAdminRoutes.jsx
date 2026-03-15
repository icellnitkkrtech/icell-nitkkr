import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedAdminRoute() {

  const { user, loading } = useAuth();

  if (loading) {
    return <div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!["admin", "superadmin"].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}