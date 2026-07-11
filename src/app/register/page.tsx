"use client";
// src/app/register/page.tsx
import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch {
      setError("تعذر الاتصال بالسيرفر");
      setStatus("error");
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B1E3D 0%, #0a3d4a 60%, #0E7C86 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      <div style={{
        width: "100%", maxWidth: 400,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 24, padding: "40px 36px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #0E7C86, #0B1E3D)",
            border: "2px solid rgba(255,255,255,0.2)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 14, boxShadow: "0 8px 24px rgba(14,124,134,0.4)",
          }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#F4A723" }}>GP</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>
            GP<span style={{ color: "#F4A723" }}>101</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
            طلب الاشتراك
          </div>
        </div>

        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              تم إرسال طلبك!
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              سيتم مراجعة طلبك من قبل المسؤول وإبلاغك بالقبول أو الرفض
            </div>
            <a
              href="/login"
              style={{
                display: "block", marginTop: 24,
                padding: "12px", borderRadius: 12,
                background: "linear-gradient(135deg, #0E7C86, #0a5f68)",
                color: "#fff", textDecoration: "none",
                fontSize: 14, fontWeight: 700, textAlign: "center",
              }}
            >
              العودة لتسجيل الدخول
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                الاسم الكامل
              </label>
              <input
                type="text" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="د. أحمد محمد"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                البريد الإلكتروني
              </label>
              <input
                type="email" required dir="ltr"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                كلمة المرور
              </label>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 6 }}>
                تأكيد كلمة المرور
              </label>
              <input
                type="password" required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#fca5a5",
                marginBottom: 16, textAlign: "center",
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #0E7C86, #0a5f68)",
                border: "none", borderRadius: 12,
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(14,124,134,0.4)",
              }}
            >
              {status === "loading" ? "جاري الإرسال..." : "إرسال طلب الاشتراك"}
            </button>

            <a
              href="/login"
              style={{
                display: "block", textAlign: "center", marginTop: 16,
                fontSize: 12, color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
              }}
            >
              عندك حساب؟ سجل دخول
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
