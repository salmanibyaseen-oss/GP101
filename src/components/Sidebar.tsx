"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Section } from "@/lib/content";

const SECTION_ICONS: Record<string, string> = {
  "Medicine الباطنه": "🩺",
  "Surgery الجراحه": "🔪",
  "Pediatric الاطفال": "👶",
  "OBGYN النساء": "🤰",
  "ENT انف واذن": "👂",
  "Ophthalmology عيون": "👁",
  "Dermatology جلديه": "🩹",
  "Toxicology سموم": "☠️",
};

const SECTION_COLORS: Record<string, string> = {
  "Medicine الباطنه": "#e53935",
  "Surgery الجراحه": "#1e88e5",
  "Pediatric الاطفال": "#8e24aa",
  "OBGYN النساء": "#d81b60",
  "ENT انف واذن": "#fb8c00",
  "Ophthalmology عيون": "#00acc1",
  "Dermatology جلديه": "#43a047",
  "Toxicology سموم": "#6d4c41",
};

interface SidebarProps {
  sections: Section[];
  isAdmin?: boolean;
}

export function Sidebar({ sections, isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([sections[0]?.name])
  );
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSlug = pathname.split("/content/")[1];

  useEffect(() => {
    if (!currentSlug) return;
    for (const section of sections) {
      for (const sub of section.subsections) {
        if (sub.topics.some((t) => t.slug === currentSlug)) {
          setOpenSections((s) => { const n = new Set(s); n.add(section.name); return n; });
          setOpenSubs((s) => { const n = new Set(s); n.add(sub.name + section.name); return n; });
        }
      }
    }
  }, [currentSlug]);

  const toggleSection = (name: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleSub = (key: string) => {
    setOpenSubs((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = search.trim()
    ? sections
        .map((s) => ({
          ...s,
          subsections: s.subsections
            .map((sub) => ({
              ...sub,
              topics: sub.topics.filter((t) =>
                t.title.toLowerCase().includes(search.toLowerCase())
              ),
            }))
            .filter((sub) => sub.topics.length > 0),
        }))
        .filter((s) => s.subsections.length > 0)
    : sections;

  const sidebarContent = (
    <div
      className="flex flex-col h-full text-white"
      style={{ background: "linear-gradient(180deg, #0E7C86 0%, #0a3d4a 40%, #0B1E3D 100%)" }}
    >
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 13, letterSpacing: 0.5,
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ color: "#F4A723" }}>GP</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>GP101</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>مرجع الممارس العام</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المواضيع..."
            style={{
              width: "100%", padding: "9px 36px 9px 12px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, color: "#fff", fontSize: 12,
              outline: "none", boxSizing: "border-box",
            }}
          />
          <span style={{
            position: "absolute", right: 10, top: "50%",
            transform: "translateY(-50%)", fontSize: 14, opacity: 0.5,
          }}>🔍</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {filtered.map((section) => {
          const color = SECTION_COLORS[section.name] || "#0E7C86";
          const isOpen = openSections.has(section.name);
          return (
            <div key={section.name}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.name)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 10, padding: "10px 14px",
                  background: isOpen ? "rgba(255,255,255,0.07)" : "transparent",
                  border: "none", cursor: "pointer",
                  borderRight: isOpen ? `3px solid ${color}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: isOpen ? color : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, flexShrink: 0,
                  transition: "background 0.15s",
                }}>
                  {SECTION_ICONS[section.name] || "📋"}
                </span>
                <span style={{
                  flex: 1, textAlign: "right", fontSize: 13,
                  fontWeight: 700, color: isOpen ? "#fff" : "rgba(255,255,255,0.75)",
                }}>
                  {section.name}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Subsections */}
              {isOpen && (
                <div style={{ background: "rgba(0,0,0,0.15)" }}>
                  {section.subsections.map((sub) => {
                    const subKey = sub.name + section.name;
                    const subOpen = openSubs.has(subKey);
                    return (
                      <div key={sub.name}>
                        <button
                          onClick={() => toggleSub(subKey)}
                          style={{
                            width: "100%", display: "flex", alignItems: "center",
                            gap: 6, padding: "7px 14px 7px 28px",
                            background: "transparent", border: "none", cursor: "pointer",
                          }}
                        >
                          <span style={{
                            flex: 1, textAlign: "right", fontSize: 11,
                            fontWeight: 600, color: color,
                          }}>
                            {sub.name}
                          </span>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
                            {subOpen ? "▲" : "▼"}
                          </span>
                        </button>

                        {subOpen && (
                          <div>
                            {sub.topics.map((topic) => {
                              const active = currentSlug === topic.slug;
                              return (
                                <Link
                                  key={topic.slug}
                                  href={`/content/${topic.slug}`}
                                  onClick={() => setSidebarOpen(false)}
                                  style={{
                                    display: "block", padding: "6px 14px 6px 36px",
                                    fontSize: 11, textDecoration: "none",
                                    color: active ? "#fff" : "rgba(255,255,255,0.6)",
                                    background: active ? `${color}25` : "transparent",
                                    borderRight: active ? `2px solid ${color}` : "2px solid transparent",
                                    transition: "all 0.1s",
                                  }}
                                >
                                  {topic.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "12px", borderTop: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <a
          href="/dashboard"
          style={{
            display: "block", textAlign: "center", textDecoration: "none",
            fontSize: 12, color: "rgba(255,255,255,0.8)",
            padding: "8px", borderRadius: 8,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          🏠 الرئيسية
        </a>
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          style={{
            fontSize: 12, color: "rgba(255,255,255,0.5)",
            padding: "7px", borderRadius: 8,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
          }}
        >
          خروج
        </button>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          GP101 © 2026
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        style={{ background: "#0B1E3D" }}
        className="lg:hidden fixed top-3 right-3 z-50 text-white p-2 rounded-lg"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-72 z-50 transition-transform ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>

      <div className="hidden lg:flex w-72 flex-shrink-0 h-full">
        {sidebarContent}
      </div>
    </>
  );
}
