// src/lib/db.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function createPrismaClient(): Promise<PrismaClient> {
  // على Cloudflare Workers لازم نمر من Hyperdrive (مفيش TCP مباشر لقاعدة البيانات).
  // محليًا (next dev / npm run build) مفيش Hyperdrive context، فبنستخدم DATABASE_URL العادي.
  let connectionString = process.env.DATABASE_URL as string;

  try {
    // مهم: { async: true } هنا إجباري. النسخة المتزامنة العادية من
    // getCloudflareContext() بتشتغل بس لو اتنادت قبل أي await في نفس الطلب.
    // كود تسجيل الدخول بيعمل await request.json() قبل ما يستخدم Prisma، فلو
    // استخدمنا النسخة المتزامنة هنا هتفشل بصمت وترجع لـ DATABASE_URL (مش موصول
    // فعليًا على Workers) بدل Hyperdrive - وده كان سبب الخطأ الغامض اللي حصل.
    const { env } = await getCloudflareContext({ async: true });
    // @ts-expect-error - HYPERDRIVE binding معرّف في wrangler.jsonc
    if (env?.HYPERDRIVE?.connectionString) {
      // @ts-expect-error
      connectionString = env.HYPERDRIVE.connectionString;
    }
  } catch {
    // مش شغالين جوه Cloudflare (مثلاً وقت الـ build أو dev عادي) - تجاهل
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

// نفس فكرة الـ singleton الكسول لكن دلوقتي async بالكامل، وبنأجل حتى استخدامه
// لحد آخر لحظة ممكنة (وقت نداء الميثود الفعلي زي findUnique/create) عشان نضمن
// إننا جوه الـ request context الصح مهما كان عدد الـ awaits قبلها.
let clientPromise: Promise<PrismaClient> | null = null;

function getClientPromise(): Promise<PrismaClient> {
  if (!clientPromise) clientPromise = createPrismaClient();
  return clientPromise;
}

function callTopLevel(prop: string) {
  return async (...args: unknown[]) => {
    const client = await getClientPromise();
    const fn = (client as unknown as Record<string, (...a: unknown[]) => unknown>)[prop];
    return fn.apply(client, args);
  };
}

function callModelMethod(model: string, method: string) {
  return async (...args: unknown[]) => {
    const client = await getClientPromise();
    const modelObj = (client as unknown as Record<string, Record<string, (...a: unknown[]) => unknown>>)[model];
    const fn = modelObj[method];
    return fn.apply(modelObj, args);
  };
}

// prisma.user.findUnique(...) وأمثالها بتشتغل زي ما هي بالظبط من غير أي تعديل
// في باقي الملفات (كل النداءات أصلاً بتستخدم await، فرجوع Promise هنا طبيعي
// ومتوافق 100% مع الكود الموجود).
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (typeof prop !== "string") return undefined;
    if (prop.startsWith("$")) return callTopLevel(prop);
    return new Proxy(
      {},
      {
        get(_t, method) {
          if (typeof method !== "string") return undefined;
          return callModelMethod(prop, method);
        },
      }
    );
  },
});
