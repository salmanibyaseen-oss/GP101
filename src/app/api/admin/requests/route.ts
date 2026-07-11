// src/app/api/admin/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

function requireAdmin() {
  const user = getCurrentUser();
  if (!user?.isAdmin) return null;
  return user;
}

// GET all pending requests
export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const requests = await prisma.registrationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

// PATCH approve or reject
export async function PATCH(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { requestId, action, expiresAt } = await req.json();
  // action: "approve" | "reject"

  const request = await prisma.registrationRequest.findUnique({ where: { id: requestId } });
  if (!request) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

  if (action === "approve") {
    // Create user from request
    await prisma.user.create({
      data: {
        name: request.name,
        email: request.email,
        password: request.password,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "approved" },
    });
  } else if (action === "reject") {
    await prisma.registrationRequest.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });
  }

  return NextResponse.json({ success: true });
}
