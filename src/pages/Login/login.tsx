import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layoutes/AuthLayout/AuthLayout";
import AppButton from "../../components/common/AppButton";
import "./login.scss";
import { authService } from "../../services/auth.service";
import { Input, Spin, notification } from "antd";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) return "Email ID is required";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) return "Enter a valid Email ID";
    return "";
  };

  const handleSendOtp = async () => {
    const error = validateEmail(email);
    setEmailError(error);

    if (error) return; // stop if invalid

    try {
      setLoading(true);
      notification.destroy();

      await authService.sendOtp(email);

      notification.success({
        message: `OTP has been sent to ${email}`,
      });

      navigate("/verify-otp", { state: { email } });
    } catch (err: any) {
      notification.destroy();
      const msg = err.response?.data?.detail || "Failed to send OTP";
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

      <div className="login-page">
        <h2 className="brand-name">NODO AI</h2>
        <h3>Login to Your Account</h3>
        <p className="text-muted">
          Enter your email to receive a one-time password.
        </p>

        <label className="input-label">
          Email ID <span className="required">*</span>
        </label>
        <Input
          placeholder="Enter Email ID"
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
          disabled={loading}
        >
          <span>Send OTP</span>
          <img src="/assets/arrow-right.svg" alt="arrow" style={{ marginLeft: "4px", width: "20px", height: "20px", }} />
        </AppButton>
      </div>
    </AuthLayout>
  );
};

export default Login;