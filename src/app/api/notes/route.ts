// src/app/api/notes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/notes?slug=xxx
export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    // Get all notes for user
    const notes = await prisma.note.findMany({ where: { userId: user.userId } });
    return NextResponse.json({ notes });
  }

  const note = await prisma.note.findUnique({
    where: { userId_topicSlug: { userId: user.userId, topicSlug: slug } },
  });

  return NextResponse.json({ note });
}

// POST /api/notes
export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { slug, content } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });

  const note = await prisma.note.upsert({
    where: { userId_topicSlug: { userId: user.userId, topicSlug: slug } },
    update: { content },
    create: { userId: user.userId, topicSlug: slug, content },
  });

  return NextResponse.json({ note });
}

// DELETE /api/notes?slug=xxx
export async function DELETE(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug مطلوب" }, { status: 400 });

  await prisma.note.deleteMany({
    where: { userId: user.userId, topicSlug: slug },
  });

  return NextResponse.json({ success: true });
}
