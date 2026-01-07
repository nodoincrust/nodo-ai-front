import React from "react"; // make sure this import exists
import { Navigate } from "react-router-dom";
import { getRoleFromToken } from "../../utils/jwt";
import { OtpRouteProps } from "../../types/common";

const OtpRoute = ({ children }: OtpRouteProps) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
        const role = getRoleFromToken(token);

        if (role === "SYSTEM_ADMIN") return <Navigate to="/companies" replace />;
        if (role === "COMPANY_ADMIN") return <Navigate to="/departments" replace />;
    }

    return children;
};

export default OtpRoute;