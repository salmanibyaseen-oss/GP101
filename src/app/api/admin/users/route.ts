// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

function requireAdmin() {
  const user = getCurrentUser();
  if (!user?.isAdmin) return null;
  return user;
}

export async function GET() {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: {
        id: true, email: true, name: true,
        isActive: true, expiresAt: true, createdAt: true, lastLogin: true,
        hasWebAccess: true,   // ✅ تم إضافته
        hasBooksAccess: true, // ✅ تم إضافته
        devices: { select: { id: true, label: true, userAgent: true, lastSeen: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "خطأ في السيرفر" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { email, name, password, expiresAt, hasWebAccess, hasBooksAccess } = await req.json();
  if (!email || !name || !password)
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "البريد الإلكتروني موجود بالفعل" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 12);

  const data: any = {
    email, name, password: hashed,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    hasWebAccess: hasWebAccess ?? true,
    hasBooksAccess: hasBooksAccess ?? false,
  };

  const user = await prisma.user.create({ data });
  return NextResponse.json({ success: true, userId: user.id });
}

export async function PATCH(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const { userId, action, value } = await req.json();

  try {
    if (action === "toggleActive") {
      await prisma.user.update({ where: { id: userId }, data: { isActive: value } });
    } else if (action === "resetDevices") {
      await prisma.device.deleteMany({ where: { userId } });
    } else if (action === "updateExpiry") {
      await prisma.user.update({ where: { id: userId }, data: { expiresAt: value ? new Date(value) : null } });
    } else if (action === "resetPassword") {
      const hashed = await bcrypt.hash(value, 12);
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    } else if (action === "toggleWebAccess") {
      await prisma.user.update({ where: { id: userId }, data: { hasWebAccess: value } });
    } else if (action === "toggleBooksAccess") {
      await prisma.user.update({ where: { id: userId }, data: { hasBooksAccess: value } });
    }
  } catch (e) {
    return NextResponse.json({ error: "خطأ - تأكد من تشغيل الـ migration" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!requireAdmin()) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId مطلوب" }, { status: 400 });

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
