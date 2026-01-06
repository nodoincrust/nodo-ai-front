import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "../pages/Auth/auth.routes";
import Layout from "../layout/Layout";
import ProtectedRoute from "../layout/ProtectedRoute";
import { companiesRoutes } from "../pages/Companies/companies.routes";
import { departmentsRoutes } from "../pages/Company/Departments/departments.routes";
import { documentsRoutes } from "../pages/Documents/documents.routes";
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
      ...departmentsRoutes,
      ...documentsRoutes
    ],
  },
]);

export default router;
