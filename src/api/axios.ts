import axios from "axios";
import { config } from "../config";

export const api = axios.create({
  baseURL: config.apiBaseUrl,
  // Do NOT force a global Content-Type here – it can trigger CORS preflight (OPTIONS)
  // unnecessarily. Axios will set the appropriate header automatically when we send a body.
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token added to request:", config.url);
  } else {
    console.warn("No token found for request:", config.url);
  }
  return config;
});

// Handle unauthorized globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);
