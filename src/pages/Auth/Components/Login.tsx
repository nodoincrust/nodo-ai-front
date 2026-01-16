import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/login.scss";
import { Input, notification } from "antd";
import { getLoaderControl } from "../../../CommonComponents/Loader/loader";
import { authService } from "../../../services/auth.service";
import AppButton from "../../../components/common/AppButton";
import { MESSAGES } from "../../../utils/Messages";
import { getRoleFromToken } from "../../../utils/jwt";

const Login = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  //Redirect if token exists in localStorage
  useEffect(() => {
    const authDataRaw = localStorage.getItem("authData");
    const authData = authDataRaw ? JSON.parse(authDataRaw) : null;
    const token = authData?.token || localStorage.getItem("accessToken");

    if (token) {
      const role = getRoleFromToken(token);
      const sidebar = authData?.sidebar;

      if (role === "SYSTEM_ADMIN") navigate("/companies", { replace: true });
      else if (role === "COMPANY_ADMIN") navigate("/departments", { replace: true });
      else if (role === "EMPLOYEE" || role === "employee")
        navigate(sidebar?.[0]?.path || "/documents", { replace: true });
      else if (role === "USER") navigate("/user", { replace: true });
      else navigate("/documents", { replace: true });
    }
  }, [navigate]);


  // Email validation
  const validateEmail = (value: string) => {
    if (!value) return MESSAGES.ERRORS.EMAIL_REQUIRED;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return MESSAGES.ERRORS.ENTER_VALID_EMAIL;
    return "";
  };

  const handleSendOtp = async () => {
    localStorage.removeItem("authData");
    localStorage.removeItem("accessToken");
    localStorage.clear();
    sessionStorage.clear();
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    try {
      getLoaderControl()?.showLoader();
      notification.destroy();

      const res = await authService.sendOtp(email);
      const data = res.data; // <-- API payload is here

      if (data?.statusCode === 200) {
        notification.success({
          message: data.message || `OTP has been sent to ${email}`,
        });
        navigate("/verify-otp", { state: { email } });
      } else {
        notification.error({
          message: data?.message || MESSAGES.ERRORS.FAILED_TO_SEND_OTP,
        });
      }
    } catch (err: any) {
      notification.destroy();
      const msg = err.response?.data?.message || MESSAGES.ERRORS.FAILED_TO_SEND_OTP;
      notification.error({ message: msg });
    } finally {
      getLoaderControl()?.hideLoader();
    }
  };

  return (
    <div className="login-page">
      <h2 className="brand-name">NODO AI</h2>
      <h3>Login to Your Account</h3>
      <p className="text-muted">
        Enter your email to receive a one-time password.
      </p>

      <label className="input-label">
        Email Address <span className="required">*</span>
      </label>
      <Input
        placeholder="Enter email address"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) setEmailError(validateEmail(e.target.value));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSendOtp();
          }
        }}
        size="large"
        suffix={<img src="/assets/email.svg" alt="email" />}
        className={emailError ? "input-error" : ""}
      />
      {emailError && <div className="input-error-text">{emailError}</div>}

      <AppButton
        label="Send OTP"
        variant="primary"
        className="send-otp-button"
        onClick={handleSendOtp}
      >
        <span>Send OTP</span>
        <img src="/assets/arrow-right.svg" alt="arrow" style={{ marginLeft: "4px", width: "20px", height: "20px", }} />
      </AppButton>
    </div>
  );
};

export default Login;