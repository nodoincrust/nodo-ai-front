import type { RouteObject } from "react-router-dom";
import RoleManagement from "./Components/RoleManagement";

export const roleManagementRoutes: RouteObject[] = [
  {
    path: "role-management",
    children: [
      {
        index: true,
        element: <RoleManagement />,
      },
    ],
  },
];
