import axios from "../api/axios";
import { API_URL } from "../utils/API";

export const authService = {
  sendOtp: (email: string) => {
    return axios.post(API_URL.login, null, {
      params: { email },
      // Make sure Axios does NOT attach Authorization header
      headers: { Authorization: undefined },
    });
  },
  verifyOtp: (email: string, otp: string) => {
    return axios.post(API_URL.verifyOTP, { email, otp }, {
      // Skip token as well
      headers: { Authorization: undefined },
    });
  },
};
