import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layoutes/AuthLayout/AuthLayout";
import AppInput from "../../components/common/AppInput";
import AppButton from "../../components/common/AppButton";
import "./login.scss";
import { authService } from "../../services/auth.service";
import { Spin } from "antd";
// import { notifySuccess, notifyError } from "../../utils/notify";
import { useAppNotification } from "../../hooks/useAppNotification";

const Login = () => {
  //   const TEST_EMAIL = "rahul123@gmail.com";
  // const TEST_OTP = "1234";
  const { notify, contextHolder } = useAppNotification();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError("");
      await authService.sendOtp(email);
      console.log(email);
      
        notify.success("OTP Sent", `OTP has been sent to ${email}`);
      navigate("/verify-otp", { state: { email } });
    } catch (err: any) {
        const msg = err.response?.data?.detail || "Failed to send OTP";

    notify.error("Error", msg);;
    } finally {
      setLoading(false);
    }
  };
  //   const handleSendOtp = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");

  //     // ✅ Mock API delay
  //     await new Promise((res) => setTimeout(res, 800));

  //     // ✅ Directly navigate with hardcoded values
  //     navigate("/verify-otp", {
  //       state: {
  //         email: TEST_EMAIL,
  //         otp: TEST_OTP, // pass mock otp
  //         isMock: true,
  //       },
  //     });
  //   } catch (err: any) {
  //     setError("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
      
    <AuthLayout>
        {contextHolder}
       <Spin spinning={loading} >
      <div className="login-page">
        <h2 className="brand-name">NODO AI</h2>
        <h3>Login to Your Account</h3>
        <p className="text-muted">
          Enter your email to receive a one-time password.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <AppInput
          label="Email"
          placeholder="olivia@untitledui.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

     
          <AppButton
            label="Send OTP"
            variant="primary"
            className="w-100 mt-3"
            onClick={handleSendOtp}
            disabled={loading}
          />
   
      </div>
      </Spin>
    </AuthLayout>

  );
};

export default Login;
