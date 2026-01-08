import type { RouteObject } from "react-router-dom";
import Employees from "./Components/Employees";

export const employeesRoutes: RouteObject[] = [
    {
        path: "employees",
        children: [
            {
                index: true,
                element: <Employees />,
            },
        ],
    },
];