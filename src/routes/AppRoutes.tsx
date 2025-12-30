import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/login";
import VerifyOtp from "../pages/Login/VerifyOtp";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "../pages/DashBoard.tsx/Dashboard";
import CompanyDashboard from "../pages/companyDashboard/compDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/comapnyDashboard" element={<CompanyDashboard />} />
        <Route path="/comapnyDashboard/:menuType" element={<CompanyDashboard />} />
      </Route>
      
      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

