import type { RouteObject } from "react-router-dom";
import SharedWorkspace from "./SharedWorkspace";
import SharedDocumentDetail from "./SharedDocumentDetail";
import SharedBouquetDocuments from "./SharedBouquetDocuments";
import SharedBouquetDocumentDetails from "./SharedBouquetDocumentDetails";

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
      {
        path: "bouquets/documents",
        element: <SharedBouquetDocuments />,
      },
      {
        path: "bouquets/:bouquetId/documents/:id",
        element: <SharedBouquetDocumentDetails />,
      },
    ],
  },
];

