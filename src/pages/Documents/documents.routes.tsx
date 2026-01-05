import type { RouteObject } from "react-router-dom";
import Documents from "./Components/Documents";
import DocumentDetail from "./Components/DocumentDetail";

export const documentsRoutes: RouteObject[] = [
  {
    path: "documents",
    children: [
      {
        index: true,
        element: <Documents />,
      },
      {
        path: ":id",
        element: <DocumentDetail />,
      },
    ],
  },
];

