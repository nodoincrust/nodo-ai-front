import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "../pages/Auth/auth.routes";
import Layout from "../layout/Layout";
import ProtectedRoute from "../layout/ProtectedRoute";
import { companiesRoutes } from "../pages/Companies/companies.routes";
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
      ...companiesRoutes,
    ],
  },
]);

export default router;
