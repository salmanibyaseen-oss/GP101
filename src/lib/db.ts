// src/lib/db.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  // على Cloudflare Workers لازم نمر من Hyperdrive (مفيش TCP مباشر لقاعدة البيانات).
  // محليًا (next dev / npm run build) مفيش Hyperdrive context، فبنستخدم DATABASE_URL العادي.
  let connectionString = process.env.DATABASE_URL as string;

  try {
    const { env } = getCloudflareContext();
    // @ts-expect-error - HYPERDRIVE binding معرّف في wrangler.jsonc
    if (env?.HYPERDRIVE?.connectionString) {
      // @ts-expect-error
      connectionString = env.HYPERDRIVE.connectionString;
    }
  } catch {
    // مش شغالين جوه Cloudflare (مثلاً وقت الـ build أو dev عادي) - تجاهل
  }

  // مهم: PrismaPg بتاخد كائن { connectionString } وبتعمل الـ Pool بنفسها من جوّه.
  // تمرير Pool جاهزة مباشرة كان بيخلي الـ adapter ميتعرفش عليه صح جوه Prisma
  // فيرجع يحاول يستخدم الـ Query Engine الأصلي (اللي بيفشل على Workers).
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

// ملحوظة: على Workers كل Request بياخد instance جديد (مفيش long-lived global process
// زي Node)، فالـ cache دي بتفيد بس وقت next dev/الأنواع التانية من الاستضافة.
export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
