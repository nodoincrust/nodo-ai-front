import type { RouteObject } from "react-router-dom";
import Bouquets from "./Components/Bouquets";
import BouquetDocuments from "./BouquetDocuments";
import BoquetDocumentDetails from "./BoquetDocumentDetails";

export const bouquetsRoutes: RouteObject[] = [
    {
        path: "bouquet",
        children: [
            { index: true, element: <Bouquets /> },
            { path: "documents", element: <BouquetDocuments /> },
            { path: "documents/:id", element: <BoquetDocumentDetails /> },
        ],
    },
];