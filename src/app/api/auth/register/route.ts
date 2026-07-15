// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور أقل من 6 أحرف" }, { status: 400 });
    }

    // Check if email already exists in users or pending requests
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 400 });
    }

    const existingRequest = await prisma.registrationRequest.findUnique({ where: { email } });
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return NextResponse.json({ error: "طلبك قيد المراجعة بالفعل" }, { status: 400 });
      }
      if (existingRequest.status === "rejected") {
        return NextResponse.json({ error: "تم رفض طلبك من قبل. تواصل مع المسؤول" }, { status: 400 });
      }
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.registrationRequest.create({
      data: { name, email, password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "حدث خطأ في السيرفر" }, { status: 500 });
  }
}
