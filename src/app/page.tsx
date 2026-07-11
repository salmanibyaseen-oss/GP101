"use client";
import { useState, useEffect } from "react";

const COLORS = {
  navy: "#0B1E3D",
  teal: "#0E7C86",
  tealLight: "#13A8B4",
  amber: "#F4A723",
  white: "#FFFFFF",
  offWhite: "#F6F9FC",
  gray: "#6B7A8D",
  grayLight: "#E8EDF3",
};

const STATS = [
  { num: "291", label: "موضوع طبي" },
  { num: "8", label: "تخصصات" },
  { num: "100%", label: "أوفلاين" },
];

const FEATURES = [
  { icon: "🔍", title: "بحث فوري", desc: "ابحث في أي موضوع في ثانية واحدة" },
  { icon: "📝", title: "تدوين ملاحظاتك ", desc: "أضف notes شخصية على أي موضوع" },
  { icon: "📵", title: "متاح بدون انترنت", desc: "بعد أول فتح — المحتوى محفوظ عندك" },
  { icon: "🔒", title: "حسابك الخاص", desc: "تسجيل دخول آمن وخاص بيك" },
  { icon: "📱", title: "موبايل + كمبيوتر", desc: "شغّاله على أي جهاز (جهازين لكل مستخدم)" },
  { icon: "⚡", title: "سريع وسهل الاستخدام", desc: "تصميم مُحسَّن للاستخدام السريع في الشغل" },
];

const STEPS = [
  { num: "١", text: "سجّل دخولك بالبريد وكلمة المرور" },
  { num: "٢", text: "اختر التخصص من القائمة الجانبية" },
  { num: "٣", text: "اختر الموضوع الذي تحتاجه" },
  { num: "٤", text: "أضف ملاحظاتك الشخصية" },
  { num: "٥", text: "متاح أوفلاين بعد أول استخدام  (كل المحتوى محفوظ)" },
];

const SPECIALTIES = [
  "Internal Medicine", "Surgery", "Pediatrics",
  "OB/GYN", "ENT", "Ophthalmology", "Dermatology", "Toxicology",
];

function BookCover() {
  return (
    <div style={{
      width: 140, height: 200, borderRadius: 10,
      background: "linear-gradient(160deg, #b8f0f9 0%, #7dd9ee 50%, #4fc3d9 100%)",
      boxShadow: "5px 5px 0 #0E7C86, 10px 10px 0 #0b5563",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "14px 10px", flexShrink: 0,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 3 }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#e53935",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 900, color: "#fff",
        }}>S</div>
        <span style={{ fontSize: 9, fontWeight: 900, color: "#1565c0", letterSpacing: 1 }}>SNIMPLY</span>
      </div>
      <div style={{ position: "absolute", top: 8, right: 8, fontSize: 14 }}>🧪</div>
      <div style={{ position: "absolute", top: 30, left: 6, fontSize: 12 }}>🩺</div>
      <div style={{ position: "absolute", top: 28, right: 6, fontSize: 11 }}>💉</div>
      <div style={{ textAlign: "center", marginTop: 24, fontWeight: 900, lineHeight: 1.1 }}>
        <div style={{ fontSize: 20, color: "#0d47a1", fontStyle: "italic" }}>Clinical</div>
        <div style={{ fontSize: 18, color: "#0d47a1", fontStyle: "italic" }}>Examination</div>
        <div style={{ fontSize: 14, color: "#e53935", fontWeight: 800, fontStyle: "italic", marginTop: 2 }}>E-guide</div>
      </div>
      <div style={{ fontSize: 28, marginTop: 10 }}>🩺</div>
      <div style={{ fontSize: 14, position: "absolute", bottom: 10 }}>💊💉</div>
    </div>
  );
}

function PhoneMockup() {
  const [page, setPage] = useState(0);
  const pages = [
    { bg: "#c62828", title: "CARDIAC", sub: "All People Eat Turkey Meat", sections: ["Hands", "Pulse & BP", "Neck", "Chest", "Legs"] },
    { bg: "#4a148c", title: "NEURO: CN", sub: "GCS · Cranial Nerves", sections: ["Olfactory", "Optic", "Oculomotor", "Facial", "Vagus"] },
    { bg: "#1b5e20", title: "HISTORY", sub: "SOCRATES · Systemic Review", sections: ["Introduction", "Personal Hx", "PC", "HPC", "Past Hx"] },
    { bg: "#0d47a1", title: "RESPIRATORY", sub: "Inspection · Percussion", sections: ["Observation", "Hands", "Chest & Back", "Percussion", "Auscultation"] },
    { bg: "#e65100", title: "SHOULDER", sub: "Special Tests", sections: ["Drop Arm", "Empty Can", "Push-off Wall", "Infraspinatus", "Yergason's"] },
  ];

  useEffect(() => {
    const t = setInterval(() => setPage((p) => (p + 1) % pages.length), 2200);
    return () => clearInterval(t);
  }, [pages.length]);

  const p = pages[page];

  return (
    <div style={{
      width: 150, height: 270, borderRadius: 22, background: "#111827",
      boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 2px #374151",
      overflow: "hidden", flexShrink: 0, display: "flex", flexDirection: "column",
    }}>
      <div style={{ background: "#000", height: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 5, borderRadius: 3, background: "#1f2937" }} />
      </div>
      <div style={{ flex: 1, background: p.bg, padding: "12px 10px", display: "flex", flexDirection: "column", transition: "background 0.6s ease" }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "2px 8px", alignSelf: "flex-start", fontSize: 8, color: "rgba(255,255,255,0.8)", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
          SNIMPLY • Clinical Exam E-Guide
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: 3 }}>{p.title}</div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>{p.sub}</div>
        {p.sections.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.6)", flexShrink: 0 }} />
            <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.25)", width: `${55 + i * 10}%` }} />
            <span style={{ fontSize: 6, color: "rgba(255,255,255,0.5)" }}>{s}</span>
          </div>
        ))}
        <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", gap: 4 }}>
          {pages.map((_, i) => (
            <div key={i} style={{ width: i === page ? 12 : 4, height: 4, borderRadius: 2, background: i === page ? "#fff" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);

  const scrollToBook = () => {
    document.getElementById("book-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToInstagram = () => {
    window.open("https://www.instagram.com/snimply", "_blank");
  };

  const primaryBtn: React.CSSProperties = {
    padding: "14px 28px", borderRadius: 12, fontWeight: 700,
    fontSize: 15, cursor: "pointer", border: "none",
    background: COLORS.amber, color: COLORS.navy, letterSpacing: 0.3,
  };

  const outlineBtn: React.CSSProperties = {
    ...primaryBtn,
    background: "transparent", color: COLORS.white,
    border: "2px solid rgba(255,255,255,0.4)",
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: COLORS.offWhite, minHeight: "100vh", color: COLORS.navy }}>

      {/* HERO */}
      <section style={{
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, #142a50 60%, #0E7C86 100%)`,
        color: COLORS.white, padding: "60px 24px 80px",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(14,124,134,0.15)", pointerEvents: "none" }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.tealLight }}>🏥 GP101</span>
          <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>للطبيب العام وطبيب الامتياز</span>
        </div>

        <h1 style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 16px" }}>
          مرجعك الطبي الشامل<br />
          <span style={{ color: COLORS.amber }}>في جيبك دايماً</span>
        </h1>

        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>
          291 موضوع طبي شامل، 8 تخصصات، يشتغل أوفلاين — صُمِّم خصيصاً للمقيمين وأطباء الامتياز 
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={primaryBtn} onClick={goToLogin}>ابدأ الاستخدام الان →</button>
          <button style={outlineBtn} onClick={scrollToBook}>تعرف على الكتاب 📖</button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 52, flexWrap: "wrap" }}>
          {STATS.map((s) => (
            <div key={s.num} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.amber, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIALTIES BAR */}
      <div style={{ background: COLORS.teal, color: COLORS.white, padding: "12px 0", display: "flex" }}>
        <div style={{ display: "flex", gap: 32, padding: "0 20px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          {SPECIALTIES.map((s) => (
            <span key={s} style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>● {s}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ padding: "64px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase" }}>ليه GP101؟</span>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: "10px 0 0" }}>كل اللي محتاجه في مكان واحد</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(`feat-${i}`)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: COLORS.white, borderRadius: 16, padding: "24px 20px",
                boxShadow: hovered === `feat-${i}` ? "0 8px 32px rgba(14,124,134,0.15)" : "0 2px 12px rgba(0,0,0,0.06)",
                transform: hovered === `feat-${i}` ? "translateY(-4px)" : "none",
                transition: "all 0.2s",
                borderTop: `3px solid ${i % 2 === 0 ? COLORS.teal : COLORS.amber}`,
              }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: COLORS.gray, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO USE */}
      <section style={{ background: COLORS.navy, color: COLORS.white, padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: COLORS.tealLight }}>خطوات بسيطة</span>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: "10px 0 0" }}>كيف تستخدم GP101؟</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,0.05)", borderRadius: 14, padding: "16px 20px", borderRight: `3px solid ${COLORS.teal}` }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.teal, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{s.num}</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOK SECTION */}
      <section id="book-section" style={{ padding: "64px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg, #e0f7fa, #f0fdfa)", borderRadius: 24, padding: "40px 32px", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap", border: `1px solid ${COLORS.grayLight}` }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexShrink: 0 }}>
            <BookCover />
            <PhoneMockup />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: COLORS.teal, textTransform: "uppercase" }}>📚 كتيب مجاني مرفق لفتره محدوده</span>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 8px", color: COLORS.navy }}>Clinical Examination E-guide</h2>
            <p style={{ fontSize: 14, color: "#0d47a1", fontWeight: 600, background: "#e3f2fd", borderRadius: 8, padding: "6px 12px", display: "inline-block", marginBottom: 12 }}>
              بقلم: د. سلمان إبراهيم ياسين
            </p>
            <p style={{ fontSize: 14, color: COLORS.gray, lineHeight: 1.7, marginBottom: 16 }}>
              ملف PDF مُصمَّم باحترافية يضم أكثر من <strong>10 فحوصات إكلينيكية</strong> مختصرة ومنهجية — تقدر تطبقها في المستشفى أو أثناء الامتحانات العملية. يشمل: Cardiac، Respiratory، Abdominal، Neurological (CN/UL/LL)، Musculoskeletal، GYN، Obstetrics، Pediatrics وغيرها.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {["إكلينيكية منظمة", "سهلة التطبيق", "للامتحانات العملية", "مرجع سريع بالمستشفى"].map((tag) => (
                <span key={tag} style={{ background: COLORS.teal, color: COLORS.white, borderRadius: 100, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#795548", lineHeight: 1.6, marginBottom: 16 }}>
              ⚠️ الكتاب للاستخدام الشخصي فقط — لا يُنسخ أو يُوزَّع بدون إذن SNIMPLY
            </div>
            <div
              onClick={goToInstagram}
              style={{ background: COLORS.white, borderRadius: 12, padding: "16px 20px", fontSize: 13, color: COLORS.navy, lineHeight: 1.9, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>📲 للتواصل والحصول على الكتاب:</div>
              <div style={{ color: COLORS.teal, fontWeight: 600 }}>Instagram / Facebook: @snimply 🔗</div>
              <div style={{ color: COLORS.gray, fontSize: 11, marginTop: 4 }}>اضغط هنا للتواصل معنا</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.navy})`, color: COLORS.white, textAlign: "center", padding: "60px 24px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px" }}>جاهز تبدأ؟</h2>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 32, fontSize: 15 }}>سجّل دلوقتي واستخدم GP101</p>
        <button onClick={goToLogin} style={{ ...primaryBtn, fontSize: 16, padding: "16px 40px", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          ابدأ الاستخدام →
        </button>
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.15)", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          GP101 © 2025 — SNIMPLY · Dr. Salman Ibrahim Yassin · Delta University
        </div>
      </section>
    </div>
  );
}
