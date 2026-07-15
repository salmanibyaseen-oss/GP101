// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// هنا بيتشغّل محليًا بس (سكربت seeding يدوي)، فبيستخدم DATABASE_URL من .env مباشرة
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@gp101.com" },
    update: {},
    create: {
      email: "admin@gp101.com",
      password: adminPassword,
      name: "Admin",
      isAdmin: true,
      isActive: true,
    },
  });

  console.log("✅ Admin user created: admin@gp101.com / admin123");
  console.log("⚠️  Change the password after first login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
