import type { RouteObject } from "react-router-dom";
import Bouquets from "./Components/Bouquets";

export const bouquetsRoutes: RouteObject[] = [
    {
        path: "bouquet",
        children: [
            { index: true, element: <Bouquets /> },
            { path: "documents/:id", element: <BouquetDocuments /> },
        ],
    },
];