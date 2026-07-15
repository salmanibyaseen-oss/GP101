// src/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const MAX_DEVICES = parseInt(process.env.NEXT_PUBLIC_MAX_DEVICES || "2");

export interface TokenPayload {
  userId: string;
  email: string;
  isAdmin: boolean;
  deviceId: string;
  hasWebAccess: boolean;
  hasBooksAccess: boolean;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(): string | null {
  const cookieStore = cookies();
  return cookieStore.get("auth_token")?.value || null;
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export { MAX_DEVICES };
