// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      userId: user.userId,
      email: user.email,
      isAdmin: user.isAdmin,
      hasWebAccess: user.hasWebAccess ?? true,
      hasBooksAccess: user.hasBooksAccess ?? false,
    },
  });
}
