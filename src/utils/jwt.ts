// utils/jwt.ts
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  role: string;
}

export const getRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role;
  } catch {
    return null;
  }
};
