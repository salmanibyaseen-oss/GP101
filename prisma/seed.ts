// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
