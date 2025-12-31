import type { RouteObject } from "react-router-dom";
import Companies from "./Components/Companies";

export const companiesRoutes: RouteObject[] = [
  {
    path: "companies",
    children: [
      {
        index: true,
        element: <Companies />,
      },
    ],
  },
];