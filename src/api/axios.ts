import axios from "axios";
import { config } from "../config";
import { notification } from "antd";
import { getLoaderControl } from "../CommonComponents/Loader/loader";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth tokens
axiosInstance.interceptors.request.use(
  (reqConfig) => {
    const localAuthData = localStorage.getItem("authData");
    const token = localAuthData ? JSON.parse(localAuthData)?.token : null;

    // Skip attaching token for login & OTP APIs
    const skipAuth = reqConfig.url?.includes("admin-login") ||
      reqConfig.url?.includes("otpverify");

    if (token && !skipAuth) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }

    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {

    // Optional: redirect to login if 401
    if (error.response?.status === 401) {
      getLoaderControl()?.hideLoader();
      localStorage.clear();
      await new Promise((res) => setTimeout(res, 300));
      // Show notification
      notification.error({
        message: "Session Expired",
        description: "Your session has expired. Please login again.",
        duration: 2,
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return new Promise(() => { });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;