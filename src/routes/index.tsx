import { createBrowserRouter } from "react-router-dom";
import { authRoutes } from "../pages/Auth/auth.routes";
import Layout from "../layout/Layout";
import ProtectedRoute from "../layout/ProtectedRoute";
import { companiesRoutes } from "../pages/Companies/companies.routes";
import { departmentsRoutes } from "../pages/Company/Departments/departments.routes";
import { documentsRoutes } from "../pages/Documents/documents.routes";
import { employeesRoutes } from "../pages/Company/Employees/employees.routes";
import { awaitingApprovalRoutes } from "../pages/Company/Awaiting_Approval/awaitingApproval.routes";
import { bouquetsRoutes } from "../pages/Bouquet/bouquet.routes";
import { sharedWorkspaceRoutes } from "../pages/shared-workspace/sharedWorkspace.routes";
import { templatesRoutes } from "../pages/Dynamic_Templates/templates.routes";
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
      ...employeesRoutes,
      ...awaitingApprovalRoutes,
      ...bouquetsRoutes,
      ...sharedWorkspaceRoutes,
      ...templatesRoutes
    ],
  },
]);

export default router;