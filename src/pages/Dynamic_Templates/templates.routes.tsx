import { RouteObject } from "react-router-dom";
import Templates from "./Components/Templates";
import TemplateLayout from "./Components/Create_Templates/TemplateLayout";

export const templatesRoutes: RouteObject[] = [
    {
        path: "templates",
        children: [
            {
                index: true,
                element: <Templates />,
            },
            {
                path: "createTemplates",
                element: <TemplateLayout />,
            },
            {
                path: "edit/:id",
                element: <TemplateLayout />,
            },
            {
                path: "view/:id",
                element: <TemplateLayout />,
            },
        ],
    },
];