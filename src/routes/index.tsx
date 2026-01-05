import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "../pages/Auth/auth.routes";
import Layout from "../layout/Layout";
import ProtectedRoute from "../layout/ProtectedRoute";
import { companiesRoutes } from "../pages/Companies/companies.routes";
import { documentsRoutes } from "../pages/Documents/documents.routes";
import { getRoleFromToken } from "../utils/jwt";

// Component to handle default route based on user role
const DefaultRoute = () => {
  const token = localStorage.getItem("accessToken");
  
  if (!token) {
    return <Navigate to="/" replace />;
  }

  const role = getRoleFromToken(token);
  
  // Redirect based on role
  if (role === "SYSTEM_ADMIN") {
    return <Navigate to="/companies" replace />;
  } else if (role === "COMPANY_ADMIN") {
    return <Navigate to="/departments" replace />;
  } else if (role === "EMPLOYEE" || role === "employee") {
    return <Navigate to="/documents" replace />;
  } else if (role === "USER") {
    return <Navigate to="/user" replace />;
  }
  
  // Default: try to get first sidebar item or redirect to documents
  const authData = JSON.parse(localStorage.getItem("authData") || "{}");
  const sidebar = authData.sidebar || [];
  
  if (sidebar.length > 0) {
    return <Navigate to={sidebar[0].path} replace />;
  }
  
  return <Navigate to="/documents" replace />;
};

const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DefaultRoute />,
      },
      ...companiesRoutes,
      ...documentsRoutes,
    ],
  },
]);

export default router;
