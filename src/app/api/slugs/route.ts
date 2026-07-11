import { NextResponse } from "next/server";
import { content } from "@/lib/content";

export async function GET() {
  const slugs = content.sections.flatMap((s) =>
    s.subsections.flatMap((sub) => sub.topics.map((t) => t.slug))
  );
  return NextResponse.json({ slugs });
}
