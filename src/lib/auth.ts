// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
const MAX_DEVICES = parseInt(process.env.NEXT_PUBLIC_MAX_DEVICES || "2");

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  deviceId: string;
  hasWebAccess: boolean;
  hasBooksAccess: boolean;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get("auth_token")?.value || null;
}

export function getCurrentUser(): TokenPayload | null {
  const token = getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export { MAX_DEVICES };
