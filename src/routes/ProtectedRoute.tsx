import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/storage";

const ProtectedRoute = () => {
  const authenticated = isAuthenticated();
  
  console.log("ProtectedRoute check - Authenticated:", authenticated);
  
  if (!authenticated) {
    console.log("Not authenticated, redirecting to login...");
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
