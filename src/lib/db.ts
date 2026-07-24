// src/lib/db.ts
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getCloudflareContext } from "@opennextjs/cloudflare";

async function createPrismaClient(): Promise<PrismaClient> {
  let connectionString = process.env.DATABASE_URL as string;
  let debugInfo = "init";

  try {
    debugInfo = "before getCloudflareContext";
    const { env } = await getCloudflareContext({ async: true });
    debugInfo = "after getCloudflareContext, env keys: " + Object.keys(env || {}).join(",");
    // @ts-expect-error - HYPERDRIVE binding معرّف في wrangler.jsonc
    if (env?.HYPERDRIVE?.connectionString) {
      // @ts-expect-error
      connectionString = env.HYPERDRIVE.connectionString;
      debugInfo = "got hyperdrive connectionString, length=" + connectionString.length;
    } else {
      debugInfo = "no HYPERDRIVE binding found on env, falling back to DATABASE_URL (len=" + (connectionString?.length || 0) + ")";
    }
  } catch (e) {
    // مؤقتًا: بنطبع الخطأ الحقيقي بدل ما نبلعه، عشان نشخّص المشكلة بدقة
    console.error("[DEBUG] getCloudflareContext failed:", debugInfo, "| error:", e instanceof Error ? e.message : String(e));
  }

  console.log("[DEBUG] createPrismaClient final state:", debugInfo, "| connectionString present:", !!connectionString, "| length:", connectionString?.length || 0);

  if (!connectionString) {
    throw new Error("[DEBUG] connectionString is empty/undefined - cannot create Prisma client. debugInfo=" + debugInfo);
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

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
