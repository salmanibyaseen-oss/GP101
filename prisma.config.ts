// prisma.config.ts
// من Prisma 7، إعدادات اتصال قاعدة البيانات (لأدوات الـ CLI زي prisma generate/migrate)
// بقت هنا بدل ما تكون جوه schema.prisma مباشرة.
// ملحوظة: ده بيأثر بس على أوامر الـ CLI (generate/migrate/studio)، مش على الـ Worker
// وقت التشغيل الفعلي على Cloudflare — ده بيستخدم Hyperdrive binding من src/lib/db.ts.
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
