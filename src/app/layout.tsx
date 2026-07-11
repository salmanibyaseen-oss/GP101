import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GP101 - مرجع الطبيب العام",
  description: "دليل العلاج للممارس العام وطبيب الامتياز",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
