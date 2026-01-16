import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🔐 MUST MATCH BACKEND + NAVBAR
const ADMIN_EMAIL = "admin@gmail.com";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
