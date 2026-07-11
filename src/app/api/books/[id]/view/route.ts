// src/app/api/books/[id]/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "غير مسجل دخول" }, { status: 401 });

  const hasAccess = user.hasBooksAccess || user.isAdmin;
  if (!hasAccess) return NextResponse.json({ error: "هذا الكتاب يتطلب اشتراك" }, { status: 403 });

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book || !book.isActive) return NextResponse.json({ error: "الكتاب غير موجود" }, { status: 404 });

  const mode = req.nextUrl.searchParams.get("mode");

  // mode=info → يرجع معلومات الكتاب بس (للـ watermark والعنوان)
  if (mode === "info") {
    return NextResponse.json({
      title: book.title,
      watermark: `${user.email} — ${new Date().toLocaleDateString("ar-EG")}`,
    });
  }

  // mode=pdf → يعمل proxy للـ PDF مباشرة
  const filePath = book.fileUrl.includes("/storage/v1/object")
    ? book.fileUrl.split("/Books/")[1]
    : book.fileUrl;

  // جيب الـ signed URL
  const { data, error } = await supabase.storage
    .from("Books")
    .createSignedUrl(decodeURIComponent(filePath), 30); // 30 ثانية كافية للـ proxy

  if (error || !data) {
    return NextResponse.json({ error: "فشل توليد رابط الملف" }, { status: 500 });
  }

  // جيب الـ PDF من Supabase
  const pdfRes = await fetch(data.signedUrl);
  if (!pdfRes.ok) {
    return NextResponse.json({ error: "فشل تحميل الملف" }, { status: 500 });
  }

  const pdfBuffer = await pdfRes.arrayBuffer();

  // ارجع الـ PDF كـ stream بدون أي header يسمح بالتنزيل
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline", // عرض بس مش تنزيل
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      // منع التنزيل
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
