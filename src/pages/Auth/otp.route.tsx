import React from "react"; // make sure this import exists
import { Navigate } from "react-router-dom";
import { getRoleFromToken } from "../../utils/jwt";

interface OtpRouteProps {
    children: React.ReactElement;
}

const OtpRoute = ({ children }: OtpRouteProps) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        const role = getRoleFromToken(token);

        if (role === "SYSTEM_ADMIN") return <Navigate to="/dashboard" replace />;
        if (role === "COMPANY_ADMIN") return <Navigate to="/companies" replace />;
    }

    return children;
};

export default OtpRoute;