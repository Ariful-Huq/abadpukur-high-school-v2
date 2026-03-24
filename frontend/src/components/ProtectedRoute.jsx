// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { menuItems } from "../config/menuConfig";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // 1. If no user, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Flatten menuItems to check permissions
  const allRoutes = menuItems.flatMap((item) =>
    item.children ? [item, ...item.children] : [item]
  );

  const currentRouteConfig = allRoutes.find((item) => item.path === location.pathname);

  // 3. FIX: Check if role exists. If the route has no role restrictions, let them in.
  // Also, if it's the dashboard ("/"), let them in if they are logged in.
  if (location.pathname === "/") return children;

  if (currentRouteConfig?.roles) {
    if (!user.role || !currentRouteConfig.roles.includes(user.role)) {
      console.error(`Access denied. User Role: ${user.role}, Required:`, currentRouteConfig.roles);
      return <Navigate to="/" replace />; 
    }
  }

  return children;
}