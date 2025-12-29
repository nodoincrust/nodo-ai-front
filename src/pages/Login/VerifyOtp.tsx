import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../layoutes/AuthLayout/AuthLayout";
import AppButton from "../../components/common/AppButton";
import { authService } from "../../services/auth.service";
import { setToken } from "../../utils/storage";
import "./VerifyOtp.scss";
import { getRoleFromToken } from "../../utils/jwt";
import { useAppNotification } from "../../hooks/useAppNotification";
const RESEND_TIME = 60; // seconds

const VerifyOtp = () => {
    const { notify, contextHolder } = useAppNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [timer, setTimer] = useState(RESEND_TIME);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  if (!email) {
    navigate("/login");
    return null;
  }

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.querySelector(
        `.otp-input-container input:nth-child(${index + 2})`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 4) {
      setError("Please enter a 4-digit code");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await authService.verifyOtp(email, code);

      // Extract token from response
      // res.data is the axios response data, which should be { token: string }
      const token = res.data?.token;
      console.log(token);

      if (!token) {
        setError("Token not received from server");
        setLoading(false);
        return;
      }

      setToken(token);

      const role = getRoleFromToken(token);

      if (role === "SYSTEM_ADMIN") {
        navigate("/dashboard", { replace: true });
      } else if (role === "COMPANY_ADMIN") {
        navigate("/comapnyDashboard", { replace: true });
      } else if (role === "USER") {
        navigate("/user/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
  const msg = err.response?.data?.detail || "Failed to send OTP";

     notify.error("Error", msg);;
    } finally {
      setLoading(false);
    }
  
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");
      await authService.sendOtp(email);
      setTimer(RESEND_TIME);
      setCanResend(false);
    } catch(err: any) {
      const msg = err.response?.data?.detail || "Failed to send OTP";

    notify.error("Error", msg);;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {contextHolder}
      <div className="verify-otp-page">
        <h2 className="brand-name">NODO AI</h2>
        <h3>Verify Your Email</h3>
        <p className="text-muted">
          We have sent a 4-digit code to{" "}
          <span className="email-highlight">{email}</span>
        </p>
        <p className="text-muted">
          Entered wrong email?{" "}
          <span className="go-back-link" onClick={() => navigate("/login")}>
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
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digit && i > 0) {
                  const prevInput = e.currentTarget
                    .previousElementSibling as HTMLInputElement;
                  prevInput?.focus();
                }
              }}
              onFocus={(e) => e.target.select()}
              className="otp-input"
            />
          ))}
        </div>

        <AppButton
          label="Verify"
          loading={loading}
          className="w-100 mb-3"
          onClick={handleVerify}
        />

        <div className="resend-section">
          <p className="text-muted">Didn't receive OTP?</p>
          {!canResend ? (
            <div className="resend-timer">
              <span className="resend-text">Resend Code</span>
              <span className="timer-separator">•</span>
              <span className="timer-text">
                {String(Math.floor(timer / 60)).padStart(2, "0")}:
                {String(timer % 60).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <button
              className="resend-link-btn"
              onClick={handleResend}
              disabled={loading}
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOtp;
