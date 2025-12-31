import axios from "../api/axios";

export const authService = {
  sendOtp: (email: string) => {
    return axios.post("/request-otp", null, {
      params: { email },
      // Make sure Axios does NOT attach Authorization header
      headers: { Authorization: undefined },
    });
  },
  verifyOtp: (email: string, otp: string) => {
    return axios.post("/verify-otp", { email, otp }, {
      // Skip token as well
      headers: { Authorization: undefined },
    });
  },
};
