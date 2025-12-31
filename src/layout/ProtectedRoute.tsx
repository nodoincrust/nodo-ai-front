import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { ProtectedRouteProps } from "../types/common";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  // Get token from userDetails
  const token = localStorage.getItem("accessToken");

  // Public pages that don't require authentication
  const publicPaths = ["/", "/verify-otp", "/forgot-password"];

  // Normalize path (remove trailing slash)
  const path = location.pathname.replace(/\/$/, "");

  // Allow public pages without token
  if (publicPaths.includes(path)) return <>{children}</>;
  // Redirect to login if no token
  if (!token) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;