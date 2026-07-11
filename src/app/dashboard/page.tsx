"use client";
// src/app/dashboard/page.tsx
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

const SECTION_ICONS: Record<string, string> = {
  "Medicine الباطنه": "🩺",
  "Surgery الجراحه": "🔪",
  "Pediatric الاطفال": "👶",
  "OBGYN النساء": "🤰",
  "ENT انف واذن": "👂",
  "Ophthalmology عيون": "👁️",
  "Dermatology جلديه": "🩹",
  "Toxicology سموم": "☠️",
};

const SECTION_COLORS: Record<string, string> = {
  "Medicine الباطنه": "#c62828",
  "Surgery الجراحه": "#1565c0",
  "Pediatric الاطفال": "#6a1b9a",
  "OBGYN النساء": "#00695c",
  "ENT انف واذن": "#e65100",
  "Ophthalmology عيون": "#0277bd",
  "Dermatology جلديه": "#558b2f",
  "Toxicology سموم": "#4e342e",
};

interface FlatTopic {
  slug: string;
  title: string;
  section: string;
}

interface UserInfo {
  hasWebAccess: boolean;
  hasBooksAccess: boolean;
  isAdmin: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showPWA, setShowPWA] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<FlatTopic[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({ hasWebAccess: true, hasBooksAccess: false, isAdmin: false });
  const [showNoBooks, setShowNoBooks] = useState(false);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => setSections(d.sections || []))
      .catch(() => {});

    // جيب بيانات اليوزر
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserInfo(d.user);
      })
      .catch(() => {});

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => setOfflineReady(true)).catch(() => {});
    }

    const timer = setTimeout(() => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!isStandalone) setShowPWA(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const allTopics: FlatTopic[] = useMemo(() => {
    return sections.flatMap((s: any) =>
      s.subsections.flatMap((sub: any) =>
        sub.topics.map((t: any) => ({
          slug: t.slug,
          title: t.title,
          section: s.name,
        }))
      )
    );
  }, [sections]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const q = search.toLowerCase();
    const results = allTopics.filter((t) => t.title.toLowerCase().includes(q));
    setSearchResults(results.slice(0, 8));
    setShowResults(true);
  }, [search, allTopics]);

  const getFirstSlug = (sectionName: string): string | null => {
    const sec = sections.find((s: any) => s.name === sectionName);
    return sec?.subsections?.[0]?.topics?.[0]?.slug ?? null;
  };

  const handleSpecialtyClick = (sectionName: string) => {
    if (!userInfo.hasWebAccess && !userInfo.isAdmin) {
      alert("🔒 هذه الخدمة تتطلب اشتراك الموقع. تواصل مع الإدارة للاشتراك.");
      return;
    }
    const slug = getFirstSlug(sectionName);
    if (slug) router.push("/content/" + encodeURIComponent(slug));
  };

  const handleBooksClick = () => {
    if (!userInfo.hasBooksAccess && !userInfo.isAdmin) {
      setShowNoBooks(true);
      return;
    }
    router.push("/books");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push("/content/" + encodeURIComponent(searchResults[0].slug));
    }
  };

  return (
    <div
      dir="rtl"
      style={{ minHeight: "100vh", background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif" }}
      onClick={() => { setShowResults(false); setShowNoBooks(false); }}
    >
      {/* رسالة لا يوجد اشتراك كتب */}
      {showNoBooks && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setShowNoBooks(false)}
        >
          <div
            style={{
              background: "#fff", borderRadius: 20, padding: 28,
              maxWidth: 320, width: "100%", textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0B1E3D", marginBottom: 8 }}>
              اشتراك الكتب
            </h3>
            <p style={{ fontSize: 13, color: "#6B7A8D", lineHeight: 1.7, marginBottom: 20 }}>
              الكتب متاحة باشتراك منفصل. تواصل مع الإدارة للاشتراك والحصول على وصول فوري.
            </p>
            <button
              onClick={() => setShowNoBooks(false)}
              style={{
                background: "linear-gradient(135deg, #0B1E3D, #0E7C86)",
                color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 24px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", width: "100%",
              }}
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "24px 20px 40px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 900 }}>
            <span style={{ color: "#F4A723" }}>GP</span>101
          </div>
          <button
            onClick={() => router.push("/admin")}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}
          >
            خروج
          </button>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>مرحباً بك 👋</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>
          مرجع الطبيب العام وطبيب الامتياز
        </p>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} onClick={(e) => e.stopPropagation()}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="ابحث عن موضوع... مثال: Syncope، ECG، Sepsis"
              style={{
                width: "100%", padding: "14px 48px 14px 16px",
                borderRadius: 14, border: "none", fontSize: 14,
                outline: "none", boxSizing: "border-box",
                background: "#fff", color: "#0B1E3D",
              }}
            />
            <button
              type="submit"
              style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                background: "#0E7C86", border: "none", borderRadius: 8,
                width: 32, height: 32, cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              🔍
            </button>

            {showResults && searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, left: 0,
                background: "#fff", borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 100, overflow: "hidden",
              }}>
                {searchResults.map((topic) => (
                  <button
                    key={topic.slug}
                    onClick={() => router.push("/content/" + encodeURIComponent(topic.slug))}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 14px",
                      background: "none", border: "none", cursor: "pointer",
                      textAlign: "right", borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{SECTION_ICONS[topic.section] || "📋"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#0B1E3D" }}>{topic.title}</div>
                      <div style={{ fontSize: 11, color: "#6B7A8D" }}>{topic.section}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#0E7C86" }}>←</span>
                  </button>
                ))}
              </div>
            )}

            {showResults && search.trim() && searchResults.length === 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, left: 0,
                background: "#fff", borderRadius: 12, padding: "14px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)", zIndex: 100,
                fontSize: 13, color: "#9e9e9e", textAlign: "center",
              }}>
                لا توجد نتائج لـ "{search}"
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Tips */}
      <div style={{ padding: "0 16px", marginTop: -16 }}>
        <div style={{
          background: offlineReady ? "#e8f5e9" : "#fff8e1",
          border: "1px solid " + (offlineReady ? "#a5d6a7" : "#ffe082"),
          borderRadius: 12, padding: "10px 14px",
          fontSize: 12, color: offlineReady ? "#2e7d32" : "#795548",
          marginBottom: 10, lineHeight: 1.6,
        }}>
          {offlineReady
            ? "✅ المحتوى محفوظ أوفلاين — تقدر تستخدم الموقع بدون نت"
            : "📶 تلميح: افتح الموقع مرة وأنت متصل بالنت — بعدها كل المحتوى هيتحفظ تلقائياً"}
        </div>

        {showPWA && (
          <div style={{
            background: "#e3f2fd", border: "1px solid #90caf9",
            borderRadius: 12, padding: "10px 14px",
            fontSize: 12, color: "#0d47a1",
            marginBottom: 10, lineHeight: 1.7, position: "relative",
          }}>
            <button
              onClick={() => setShowPWA(false)}
              style={{ position: "absolute", top: 8, left: 10, background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#0d47a1" }}
            >
              ✕
            </button>
            {"📱 أضف GP101 لشاشة جوالك زي تطبيق: "}
            {isIOS
              ? "اضغط على زرار Share ⬆️ في Safari ← ثم Add to Home Screen"
              : "افتح قائمة المتصفح ⋮ ← ثم Add to Home Screen أو Install App"}
          </div>
        )}
      </div>

      {/* كتب */}
      <div style={{ padding: "8px 16px 0" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D", marginBottom: 12 }}>المكتبة</h2>
        <button
          onClick={handleBooksClick}
          style={{
            width: "100%", background: "#fff", border: "none", borderRadius: 16,
            padding: "18px 16px", textAlign: "right", cursor: "pointer",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            borderRight: "4px solid #F4A723",
            display: "flex", alignItems: "center", gap: 14,
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.01)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <div style={{ fontSize: 32 }}>📚</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D" }}>E-guides </div>
            <div style={{ fontSize: 11, color: "#6B7A8D", marginTop: 2 }}>
              {userInfo.hasBooksAccess || userInfo.isAdmin ? "اضغط للوصول للكتب" : "🔒 يتطلب اشتراك منفصل"}
            </div>
          </div>
          <span style={{ fontSize: 18, color: userInfo.hasBooksAccess || userInfo.isAdmin ? "#F4A723" : "#ccc" }}>
            {userInfo.hasBooksAccess || userInfo.isAdmin ? "←" : "🔒"}
          </span>
        </button>
      </div>

      {/* Specialties Grid */}
      <div style={{ padding: "16px 16px 32px" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D", marginBottom: 14 }}>التخصصات</h2>

        {sections.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9e9e9e", padding: "40px 0", fontSize: 13 }}>
            جاري التحميل...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {sections.map((sec: any) => (
              <button
                key={sec.name}
                onClick={() => handleSpecialtyClick(sec.name)}
                style={{
                  background: "#fff", border: "none", borderRadius: 16,
                  padding: "20px 16px", textAlign: "right", cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  borderRight: "4px solid " + (SECTION_COLORS[sec.name] || "#1e3a5f"),
                  transition: "transform 0.15s",
                  opacity: userInfo.hasWebAccess || userInfo.isAdmin ? 1 : 0.5,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{SECTION_ICONS[sec.name] || "📋"}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D" }}>{sec.name.split(" ")[0]}</div>
                <div style={{ fontSize: 11, color: "#6B7A8D", marginTop: 2 }}>
                  {sec.subsections?.reduce((acc: number, sub: any) => acc + sub.topics.length, 0)} موضوع
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px", fontSize: 11, color: "#9e9e9e", borderTop: "1px solid #e8edf3" }}>
        GP101 © 2026 — SNIMPLY
      </div>
    </div>
  );
}
