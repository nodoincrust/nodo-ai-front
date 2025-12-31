import Login from "./Components/Login";
import AuthLayout from "./Components/AuthLayout";
import ForgotPassword from "./Components/ForgotPassword";
import OtpRoute from "./otp.route";
import VerifyOtp from "./Components/VerifyOTP";
import type { RouteObject } from "react-router-dom";

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Login /> },
      {
        path: "verify-otp",
        element: (
          <OtpRoute>
            <VerifyOtp/>
          </OtpRoute>
        ),
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
];
