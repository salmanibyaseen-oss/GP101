/** @type {import('next').NextConfig} */
const nextConfig = {
  // ملحوظة: output "standalone" اتشالت لأنها غير مطلوبة/غير مدعومة مع
  // opennextjs-cloudflare (الأداة دي بتاخد مخرجات next build العادية وتحوّلها بنفسها لـ Worker).
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Cache-Control", value: "no-cache" },
      ],
    },
  ],
};

module.exports = nextConfig;

// يفعّل bindings الخاصة بـ Cloudflare (زي Hyperdrive) أثناء `next dev` محليًا
// (بدون تأثير على أي بيئة تشغيل تانية زي Vercel/Node عادي)
const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
