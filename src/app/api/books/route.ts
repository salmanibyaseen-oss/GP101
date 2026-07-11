import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });
  }

  const hasAccess = user.hasBooksAccess || user.isAdmin;

  const books = await prisma.book.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      coverUrl: true,
      price: true,
    },
  });

  return NextResponse.json({ books, hasAccess });
}
