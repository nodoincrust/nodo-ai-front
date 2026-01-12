import type { RouteObject } from "react-router-dom";
import Departments from "./Components/Departments";


export const departmentsRoutes: RouteObject[] = [
    {
        path: "departments",
        children: [
            {
                index: true,
                element: <Departments />,
            },
        
        ],
    },
];