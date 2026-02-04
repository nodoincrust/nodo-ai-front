import { RouteObject } from "react-router-dom";
import Templates from "./Components/Templates";
import TemplateLayout from "./Components/Create_Templates/TemplateLayout";
import SubmittedUsers from "./Components/submittedUsers";
import SubmitTemplateForm from "./Components/Create_Templates/SubmitTemplateForm";

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
            {
                path: "submitted-users/:templateId",
                element: <SubmittedUsers />,
            },
            {
                path: "view-response/:id",
                element: <TemplateLayout />,
            }
        ],
    },
];