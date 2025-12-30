import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layoutes/AuthLayout/AuthLayout";
import AppButton from "../../components/common/AppButton";
import { authService } from "../../services/auth.service";
import { setToken } from "../../utils/storage";
import { getRoleFromToken } from "../../utils/jwt";
import { notification, Spin } from "antd";
import "./VerifyOtp.scss";

interface SidebarItem {
  id: number;
  label: string;
  path: string;
  icon: string;
  icon_active?: string | null;
}
  
interface VerifyOtpResponse {
  token: string;
  sidebar: SidebarItem[];
  is_department_head: boolean;
  department_id: number | null;
}

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      const nextInput = document.querySelector<HTMLInputElement>(
        `.otp-input-container input:nth-child(${index + 2})`
      );
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
      prevInput?.focus();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (!/^\d{4}$/.test(code)) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      notification.destroy();

      const res = await authService.verifyOtp(email, code);
      const { token, sidebar, is_department_head, department_id } = res.data as VerifyOtpResponse;

      if (!token) {
        setError("Token not received from server");
        return;
      }

      // ✅ Store token
      setToken(token);

      // ✅ Store full auth object including sidebar/icons
      localStorage.setItem(
        "authData",
        JSON.stringify({ token, sidebar, is_department_head, department_id })
      );

      const role = getRoleFromToken(token);

      if (role === "SYSTEM_ADMIN") navigate("/dashboard", { replace: true });
      else if (role === "COMPANY_ADMIN") navigate("/comapnyDashboard", { replace: true });
      else if (role === "USER") navigate("/user/dashboard", { replace: true });
      else navigate("/", { replace: true });
    } catch (err: any) {
      notification.destroy();
      const msg = err.response?.data?.detail || "Failed to verify OTP";
      notification.error({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");
      notification.destroy();

      await authService.sendOtp(email);

      notification.success({
        message: `OTP has been sent to ${email}`,
      });
    } catch (err: any) {
      notification.destroy();
      const msg = err.response?.data?.detail || "Failed to resend OTP";
      notification.error({ message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {loading && (
        <div className="full-screen-spin">
          <Spin />
        </div>
      )}

      <div className="verify-otp-page">
        <h2 className="brand-name">NODO AI</h2>
        <h3>Enter OTP</h3>
        <p>
          A 4-digit code has been sent to <span className="email-highlight">{email}</span>.
          Please enter it below to log in
        </p>
        <p className="text-muted">
          Entered wrong email?{" "}
          <span className="go-back-link" onClick={() => navigate("/")}>
            Go back
          </span>
        </p>

        <div className="otp-input-container">
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              value={digit}
              maxLength={1}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onFocus={(e) => e.target.select()}
              className={`otp-input ${error ? "input-erro" : ""}`}
            />
          ))}
        </div>

        {error && <p className="input-error-text">{error}</p>}

        <div className="resend-section">
          <p>Didn't receive the OTP?</p>
          <button className="resend-link-btn" onClick={handleResend}>
            Resend OTP
          </button>
        </div>

        <AppButton label="Verify" className="verify-button" onClick={handleVerify} />
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;