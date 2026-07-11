// src/app/api/admin/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

async function adminOnly() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  return null;
}

export async function GET() {
  const err = await adminOnly(); if (err) return err;
  const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ books });
}

export async function POST(req: NextRequest) {
  const err = await adminOnly(); if (err) return err;
  const { title, description, fileUrl, coverUrl, price } = await req.json();
  if (!title || !fileUrl) return NextResponse.json({ error: "العنوان والرابط مطلوبان" }, { status: 400 });
  const book = await prisma.book.create({
    data: { title, description: description || null, fileUrl, coverUrl: coverUrl || null, price: price || null },
  });
  return NextResponse.json({ book });
}

export async function PATCH(req: NextRequest) {
  const err = await adminOnly(); if (err) return err;
  const { bookId, action, value } = await req.json();
  if (action === "toggleActive") {
    await prisma.book.update({ where: { id: bookId }, data: { isActive: value } });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const err = await adminOnly(); if (err) return err;
  const bookId = req.nextUrl.searchParams.get("bookId");
  if (!bookId) return NextResponse.json({ error: "bookId مطلوب" }, { status: 400 });
  await prisma.book.delete({ where: { id: bookId } });
  return NextResponse.json({ success: true });
}
