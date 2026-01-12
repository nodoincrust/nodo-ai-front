import type { RouteObject } from "react-router-dom";
import AwaitingApproval from "./Components/AwaitingApproval";
import AwaitingApprovalDetails from "./Components/AwaitingApprovalDetails";

export const awaitingApprovalRoutes: RouteObject[] = [
    {
        path: "awaitingApproval",
        children: [
            {
                index: true,
                element: <AwaitingApproval />,
            },
            {
                path: ":id",
                element: <AwaitingApprovalDetails />,
            },
        ],
    },
];