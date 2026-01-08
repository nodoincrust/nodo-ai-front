import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "../pages/Auth/auth.routes";
import Layout from "../layout/Layout";
import ProtectedRoute from "../layout/ProtectedRoute";
import { companiesRoutes } from "../pages/Companies/companies.routes";
import { departmentsRoutes } from "../pages/Company/Departments/departments.routes";
import { documentsRoutes } from "../pages/Documents/documents.routes";
import { employeesRoutes } from "../pages/Company/Employees/employees.routes";
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
      ...departmentsRoutes,
      ...documentsRoutes,
      ...employeesRoutes
    ],
  },
]);

export default router;