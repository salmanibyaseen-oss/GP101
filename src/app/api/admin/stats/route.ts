// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const [totalUsers, activeUsers, expiredUsers] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.user.count({
      where: {
        isAdmin: false,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    prisma.user.count({
      where: { isAdmin: false, expiresAt: { lt: new Date() } },
    }),
  ]);

  const recentLogins = await prisma.user.findMany({
    where: { isAdmin: false, lastLogin: { not: null } },
    orderBy: { lastLogin: "desc" },
    take: 5,
    select: { name: true, email: true, lastLogin: true },
  });

  return NextResponse.json({ totalUsers, activeUsers, expiredUsers, recentLogins });
}
