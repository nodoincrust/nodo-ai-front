import { RouteObject } from "react-router-dom";
import CreateTemplate from "./Components/Create_Templates/CreateTemplate";
import Templates from "./Components/Templates";
import EditTemplateForm from "./Components/Create_Templates/EditTemplateForm";

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
                element: <CreateTemplate />,
            },
            {
                path: "edit/:id",
                element: <EditTemplateForm />,
            },
        ],
    },
];