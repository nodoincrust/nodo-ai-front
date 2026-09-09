import axios from "axios";
import { config } from "../config";
import {
  getSessionAbortSignal,
  isRequestAborted,
  teardownSession,
} from "../utils/sessionTeardown";
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
    const skipAuth =
      reqConfig.url?.includes("admin-login") ||
      reqConfig.url?.includes("otpverify");

    if (token && !skipAuth) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }

    // Tie request to session AbortController (logout / 401 aborts in-flight calls)
    if (!reqConfig.signal) {
      reqConfig.signal = getSessionAbortSignal();
    }

    return reqConfig;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isRequestAborted(error)) {
      return Promise.reject(error);
    }

    // Optional: redirect to login if 401
    if (error.response?.status === 401) {
      getLoaderControl()?.hideLoader();
      teardownSession({ showSessionExpiredToast: true });
      await new Promise((res) => setTimeout(res, 300));
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
