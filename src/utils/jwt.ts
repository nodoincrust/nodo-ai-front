// utils/jwt.ts
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  role: string;
  exp?: number; // optional expiration
  user_id?: number;
  company_id?: number;
  department_id?: number;
}

export const getRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp < now) {
      // console.warn("Token expired");
      return null;
    }

    return decoded.role;
  } catch (err) {
    // console.error("JWT decode error:", err);
    return null;
  }
};


 
export const getUserFromToken = (): JwtPayload | null => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
 
    const decoded = jwtDecode<JwtPayload>(token);
    const now = Math.floor(Date.now() / 1000);
 
    if (decoded.exp && decoded.exp < now) {
      console.warn("Token expired");
      return null;
    }
 
    return decoded;
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
};
 