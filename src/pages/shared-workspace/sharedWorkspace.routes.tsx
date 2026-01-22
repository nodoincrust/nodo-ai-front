import type { RouteObject } from "react-router-dom";
import SharedWorkspace from "./SharedWorkspace";
import SharedDocumentDetail from "./SharedDocumentDetail";

export const sharedWorkspaceRoutes: RouteObject[] = [
  {
    path: "/sharedworkspace",
    children: [
      {
        index: true,
        element: <SharedWorkspace />,
      },
      {
        path: "documents/:id",
        element: <SharedDocumentDetail />,
      },
    ],
  },
];

