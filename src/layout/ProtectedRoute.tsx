import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { ProtectedRouteProps } from "../types/common";
import { getRoleFromToken } from "../utils/jwt";

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

  // Role-based access control
  const role = getRoleFromToken(token);
  
  // Employee role can only access documents route
  // if (role === "EMPLOYEE" || role === "employee") {
  //   const allowedPaths = ["/documents", "/document"];
  //   if (!allowedPaths.some(allowedPath => path.startsWith(allowedPath))) {
  //     return <Navigate to="/documents" replace />;
  //   }
  // }

  return <>{children}</>;
};

export default ProtectedRoute;