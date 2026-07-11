"use client";
// src/app/login/page.tsx
import { useState } from "react";

async function getFingerprint(): Promise<string> {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const lang = navigator.language;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const raw = `${ua}|${screen}|${lang}|${tz}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const fingerprint = await getFingerprint();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fingerprint, userAgent: navigator.userAgent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
      } else {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register("/sw.js").catch(console.error);
        }
        window.location.href = data.user.isAdmin ? "/admin" : "/dashboard";
      }
    } catch {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0B1E3D 0%, #0a3d4a 60%, #0E7C86 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "40px 36px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #0E7C86, #0B1E3D)",
              border: "2px solid rgba(255,255,255,0.2)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 8px 24px rgba(14,124,134,0.4)",
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 900, color: "#F4A723", letterSpacing: 1 }}>GP</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>
            GP<span style={{ color: "#F4A723" }}>101</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
            مرجع الطبيب العام وطبيب الامتياز
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              dir="ltr"
              style={{
                width: "100%", padding: "12px 16px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12, color: "#fff", fontSize: 14,
                outline: "none", boxSizing: "border-box",
                transition: "border 0.2s",
              }}
              onFocus={(e) => { e.target.style.border = "1px solid #0E7C86"; e.target.style.background = "rgba(255,255,255,0.12)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>
              كلمة المرور
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%", padding: "12px 44px 12px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12, color: "#fff", fontSize: 14,
                  outline: "none", boxSizing: "border-box",
                  transition: "border 0.2s",
                }}
                onFocus={(e) => { e.target.style.border = "1px solid #0E7C86"; e.target.style.background = "rgba(255,255,255,0.12)"; }}
                onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.15)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 16, opacity: 0.5, color: "#fff",
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#fca5a5",
                marginBottom: 16, textAlign: "center",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? "rgba(14,124,134,0.5)"
                : "linear-gradient(135deg, #0E7C86, #0a5f68)",
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(14,124,134,0.4)",
              transition: "all 0.2s",
              letterSpacing: 0.5,
            }}
          >
            {loading ? (
              <span style={{ opacity: 0.7 }}>جاري الدخول...</span>
            ) : (
              "دخول →"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <a href="/register" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
            ليس لديك حساب؟ اطلب اشتراك
          </a>
        </div>
      </div>
    </div>
  );
}
