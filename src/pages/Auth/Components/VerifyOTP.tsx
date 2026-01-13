import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import "./Styles/VerifyOtp.scss";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { authService } from "../../../services/auth.service";
import { setToken } from "../../../utils/storage";
import { getRoleFromToken } from "../../../utils/jwt";
import AppButton from "../../../components/common/AppButton";
import { VerifyOtpResponse } from "../../../types/common";
import { MESSAGES } from "../../../utils/Messages";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  // create a ref for the first OTP input
  const firstOtpRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!email) navigate("/", { replace: true });
    // Focus the first input after the component renders
    const timer = setTimeout(() => {
      firstOtpRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
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
      setError(MESSAGES.ERRORS.INVALID_OTP);
      return;
    }

    try {
      getLoaderControl()?.showLoader();
      setError("");
      notification.destroy();

      const res = await authService.verifyOtp(email, code);
      const data = res.data.data as VerifyOtpResponse;

      const { token, sidebar, is_department_head, department_id, user } = data;

      if (!token) {
        setError(MESSAGES.ERRORS.TOKEN_NOT_FOUND);
        return;
      }

      localStorage.setItem("accessToken", token);

      // Store full auth data in localStorage
      const authData = {
        token,
        sidebar,
        is_department_head,
        department_id,
        user,
      };
      localStorage.setItem("authData", JSON.stringify(authData));

      // Also store token separately if needed
      setToken(token);

      notification.success({
        message: res.data.message || "Login Successful",
      });

      // Decode token and check role
      const role = getRoleFromToken(token);
      if (!role) {
        setError(MESSAGES.ERRORS.INVALID_TOKEN);
        return;
      }

      // Navigate based on role
      if (role === "SYSTEM_ADMIN") {
        navigate("/companies", { replace: true });
      } else if (role === "COMPANY_ADMIN") {
        navigate("/departments", { replace: true });
      } else if (role === "EMPLOYEE" || role === "employee") {
        navigate("/documents", { replace: true });
      } else if (role === "USER") {
        navigate("/user", { replace: true });
      } else {
        // Default: redirect to first sidebar item or documents
        if (sidebar && sidebar.length > 0) {
          navigate(sidebar[0].path, { replace: true });
        } else {
          navigate("/documents", { replace: true });
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || MESSAGES.ERRORS.OTP_VERIFICATION_FAILED);
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  const handleResend = async () => {
    try {
      getLoaderControl()?.showLoader();
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
      getLoaderControl()?.hideLoader();
    }
  };

  return (
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
            className={`otp-input ${error ? "input-error" : ""}`}
            ref={i === 0 ? firstOtpRef : null}
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
  );
};

export default VerifyOtp;