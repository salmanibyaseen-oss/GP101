// src/app/content/layout.tsx
export const dynamic = 'force-dynamic';
import { Sidebar } from "@/components/Sidebar";
import { OnlineStatus } from "@/components/OnlineStatus";
import { getNavigationSections } from "@/lib/content";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function ContentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  let user = null;
  if (token) {
    try {
      user = await verifyToken(token);
    } catch {}
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Sidebar sections={getNavigationSections()} isAdmin={user?.isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header — نفس ثيم الداشبورد */}
        <header style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "10px 20px", flexShrink: 0 }}
          className="flex items-center justify-between">

          <OnlineStatus />

          <div className="flex items-center gap-3">
            {user?.email && (
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                👨‍⚕️ {user.email.split("@")[0]}
              </span>
            )}
            {user?.isAdmin && (
              <a
                href="/admin"
                style={{
                  background: "rgba(255,255,255,0.15)", color: "#fff",
                  borderRadius: 8, padding: "5px 12px", fontSize: 12,
                  textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                لوحة التحكم
              </a>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
