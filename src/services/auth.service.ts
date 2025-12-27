import { api } from "../api/axios";

export interface LoginRequest {
  email: string;

}

export interface LoginResponse {
  token: string;
}

export const authService = {
   sendOtp: (email: string) =>
    api.post("/request-otp", null, {
      params: { email },
    }),
  verifyOtp: (email: string, otp: string) =>
    api.post<{ token: string }>("/verify-otp", { email, otp }),
};
