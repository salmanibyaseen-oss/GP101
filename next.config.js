const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ملحوظة: output "standalone" اتشالت لأنها غير مطلوبة/غير مدعومة مع
  // opennextjs-cloudflare (الأداة دي بتاخد مخرجات next build العادية وتحوّلها بنفسها لـ Worker).
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // إعداد احتياطي عشان Webpack (اللي بيستخدمه Next.js) يقدر يتعامل مع أي ملف
  // .wasm ممكن الـ Prisma client الجديد يستورده (query compiler)
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
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

// مهم جدًا: الدالة دي بتتفعّل بس وقت `next dev` (PHASE_DEVELOPMENT_SERVER).
// next.config.js بيتحمّل حتى وقت `next build`، ولو نفّذناها هناك من غير شرط،
// هتحاول تجيب Hyperdrive local connection string مش موجود على سيرفر الـ CI
// وتوقف الـ build بالظبط زي الخطأ اللي ظهر عندك.
module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
    initOpenNextCloudflareForDev();
  }
  return nextConfig;
};
