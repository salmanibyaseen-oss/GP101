// src/app/api/content/route.ts
import { NextResponse } from "next/server";
import { content } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  // نرجع الـ sections بدون محتوى المواضيع عشان الـ response يكون خفيف
  const sections = content.sections.map((section) => ({
    name: section.name,
    subsections: section.subsections.map((sub) => ({
      name: sub.name,
      topics: sub.topics.map((topic) => ({
        slug: topic.slug,
        title: topic.title,
        // content متعمداً مش بنرجعه هنا عشان الحجم
      })),
    })),
  }));

  return NextResponse.json({ sections });
}
