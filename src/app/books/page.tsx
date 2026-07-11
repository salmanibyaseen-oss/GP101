"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  price: number | null;
}

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        setBooks(d.books || []);
        setHasAccess(!!d.hasAccess);
      })
      .catch(() => setError("حدث خطأ في تحميل الكتب"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0E7C86 100%)", padding: "20px 16px", color: "#fff", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/dashboard")} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" }}>
          → رجوع
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800 }}>📚 الكتب الطبية</h1>
      </div>

      <div style={{ padding: 16 }}>
        {loading && <div style={{ textAlign: "center", color: "#9e9e9e", padding: 40 }}>جاري التحميل...</div>}
        {!loading && error && (
          <div style={{ textAlign: "center", color: "#c62828", padding: 24, background: "#fff", borderRadius: 12 }}>{error}</div>
        )}
        {!loading && !error && books.length === 0 && (
          <div style={{ textAlign: "center", color: "#9e9e9e", padding: 40 }}>لا توجد كتب متاحة حالياً</div>
        )}

        {!loading && books.map((book) => (
          <div key={book.id} style={{
            background: "#fff", borderRadius: 16, padding: "16px",
            marginBottom: 12, display: "flex", alignItems: "center", gap: 14,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderRight: "4px solid #F4A723",
          }}>
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} style={{ width: 48, height: 64, objectFit: "cover", borderRadius: 6 }} />
            ) : (
              <div style={{ fontSize: 28 }}>📕</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "#0B1E3D", fontSize: 14 }}>{book.title}</div>
              {book.description && <div style={{ fontSize: 11, color: "#6B7A8D" }}>{book.description}</div>}
            </div>
            {hasAccess ? (
              <button onClick={() => router.push(`/books/${book.id}`)} style={{
                background: "#0E7C86", color: "#fff", borderRadius: 10,
                padding: "8px 14px", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer",
              }}>
                قراءة
              </button>
            ) : (
              <span style={{ fontSize: 12, color: "#ccc" }}>🔒</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
