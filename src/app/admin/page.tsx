"use client";
// src/app/admin/page.tsx
import { useState, useEffect } from "react";

interface User {
  id: string; email: string; name: string; isActive: boolean;
  expiresAt: string | null; createdAt: string; lastLogin: string | null;
  hasWebAccess: boolean; hasBooksAccess: boolean;
  devices: { id: string; label: string; userAgent: string; lastSeen: string }[];
}
interface Stats {
  totalUsers: number; activeUsers: number; expiredUsers: number;
  recentLogins: { name: string; email: string; lastLogin: string }[];
}
interface Request {
  id: string; name: string; email: string; status: string; createdAt: string;
}
interface Book {
  id: string; title: string; description: string | null;
  fileUrl: string; coverUrl: string | null;
  isActive: boolean; price: number | null; createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<"stats" | "users" | "requests" | "add" | "books">("stats");
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "", expiresAt: "", hasWebAccess: true, hasBooksAccess: false });
  const [newBook, setNewBook] = useState({ title: "", description: "", fileUrl: "", coverUrl: "", price: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, statsRes, reqRes, booksRes] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/requests").then((r) => r.json()),
      fetch("/api/admin/books").then((r) => r.json()),
    ]);
    setUsers(usersRes.users || []);
    setStats(statsRes);
    setRequests(reqRes.requests || []);
    setBooks(booksRes.books || []);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ تم إضافة المستخدم");
      setNewUser({ email: "", name: "", password: "", expiresAt: "", hasWebAccess: true, hasBooksAccess: false });
      fetchData(); setActiveTab("users");
    } else { alert("❌ " + data.error); }
  };

  // ✅ Optimistic update - يتغير فوراً في الـ UI
  const handleAction = async (userId: string, action: string, value?: any) => {
    if (action === "toggleWebAccess") {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, hasWebAccess: value } : u
      ));
    }
    if (action === "toggleBooksAccess") {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, hasBooksAccess: value } : u
      ));
    }
    if (action === "toggleActive") {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isActive: value } : u
      ));
    }

    const res = await fetch("/api/admin/users", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, value }),
    });
    if (res.ok) fetchData();
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`حذف ${email}؟`)) return;
    await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
    fetchData();
  };

  const handleRequest = async (requestId: string, action: "approve" | "reject", expiresAt?: string) => {
    const res = await fetch("/api/admin/requests", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action, expiresAt }),
    });
    if (res.ok) fetchData();
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/books", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newBook, price: newBook.price ? parseFloat(newBook.price) : null }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ تم إضافة الكتاب");
      setNewBook({ title: "", description: "", fileUrl: "", coverUrl: "", price: "" });
      fetchData();
    } else { alert("❌ " + data.error); }
  };

  const handleToggleBook = async (bookId: string, isActive: boolean) => {
    await fetch("/api/admin/books", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, action: "toggleActive", value: !isActive }),
    });
    fetchData();
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`حذف كتاب "${title}"؟`)) return;
    await fetch(`/api/admin/books?bookId=${bookId}`, { method: "DELETE" });
    fetchData();
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const tabs = [
    { key: "stats", label: "إحصائيات", icon: "📊" },
    { key: "users", label: `المستخدمون (${users.length})`, icon: "👥" },
    { key: "requests", label: `طلبات التسجيل${pendingCount > 0 ? ` (${pendingCount})` : ""}`, icon: "📋" },
    { key: "books", label: `الكتب (${books.length})`, icon: "📚" },
    { key: "add", label: "إضافة مستخدم", icon: "➕" },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f6f9fc", fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0a3d4a 60%, #0E7C86 100%)", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, border: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ color: "#F4A723" }}>GP</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>لوحة تحكم GP101</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>إدارة المشتركين والأجهزة</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/dashboard" style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", textDecoration: "none" }}>🏠 الموقع</a>
            <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); window.location.href = "/login"; }}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", padding: "6px 14px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
              خروج
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 16, flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              style={{ padding: "8px 14px", borderRadius: "8px 8px 0 0", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s", position: "relative",
                background: activeTab === tab.key ? "#fff" : "rgba(255,255,255,0.1)",
                color: activeTab === tab.key ? "#0B1E3D" : "rgba(255,255,255,0.7)" }}>
              {tab.icon} {tab.label}
              {tab.key === "requests" && pendingCount > 0 && (
                <span style={{ position: "absolute", top: -6, left: -6, background: "#e53935", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9e9e9e" }}>جاري التحميل...</div>
        ) : (
          <>
            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                  <StatCard label="إجمالي المشتركين" value={stats.totalUsers} color="#0E7C86" icon="👥" />
                  <StatCard label="مشتركون نشطون" value={stats.activeUsers} color="#27ae60" icon="✅" />
                  <StatCard label="منتهي الاشتراك" value={stats.expiredUsers} color="#e53935" icon="⏰" />
                </div>
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0B1E3D", marginBottom: 16 }}>آخر عمليات الدخول</div>
                  {stats.recentLogins.length === 0 ? <p style={{ color: "#9e9e9e", fontSize: 13 }}>لا يوجد</p> : (
                    stats.recentLogins.map((u, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < stats.recentLogins.length - 1 ? "1px solid #f0f4f8" : "none" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: "#9e9e9e" }}>{u.email}</div>
                        </div>
                        <div style={{ fontSize: 11, color: "#9e9e9e" }}>{new Date(u.lastLogin).toLocaleString("ar-EG")}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {users.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#9e9e9e" }}>لا يوجد مستخدمون</div> : (
                  users.map((user) => {
                    const isExpired = user.expiresAt && new Date(user.expiresAt) < new Date();
                    const isHealthy = user.isActive && !isExpired;
                    return (
                      <div key={user.id} style={{
                        background: "#fff", borderRadius: 14,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden",
                        // ✅ لون البوردر يتغير حسب حالة الموقع والكتب
                        border: !user.hasWebAccess && !user.hasBooksAccess
                          ? "1.5px solid #e5393540"
                          : !user.hasWebAccess || !user.hasBooksAccess
                          ? "1.5px solid #fb8c0040"
                          : "1px solid #f0f4f8"
                      }}>
                        <div onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: isHealthy ? "#e8f5e9" : "#ffebee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                            {isHealthy ? "👨‍⚕️" : "⚠️"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#0B1E3D" }}>{user.name}</div>
                            <div style={{ fontSize: 11, color: "#9e9e9e" }}>{user.email}</div>

                            {/* ✅ Badges واضحة مع مؤشر موقوف/مفعل */}
                            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                              <span style={{
                                fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700,
                                background: user.hasWebAccess ? "#e8f5e9" : "#ffebee",
                                color: user.hasWebAccess ? "#27ae60" : "#e53935",
                                border: `1px solid ${user.hasWebAccess ? "#27ae60" : "#e53935"}40`
                              }}>
                                🌐 {user.hasWebAccess ? "موقع ✓" : "موقع ✗"}
                              </span>
                              <span style={{
                                fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 700,
                                background: user.hasBooksAccess ? "#fff8e1" : "#ffebee",
                                color: user.hasBooksAccess ? "#f59e0b" : "#e53935",
                                border: `1px solid ${user.hasBooksAccess ? "#f59e0b" : "#e53935"}40`
                              }}>
                                📚 {user.hasBooksAccess ? "كتب ✓" : "كتب ✗"}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, color: "#6B7A8D" }}>
                            <span>📱 {user.devices.length}/2</span>
                            {user.expiresAt && <span style={{ color: isExpired ? "#e53935" : "#27ae60" }}>⏰ {new Date(user.expiresAt).toLocaleDateString("ar-EG")}</span>}
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: isHealthy ? "#27ae60" : "#e53935" }} />
                          </div>
                          <span style={{ color: "#9e9e9e", fontSize: 11 }}>{expandedUser === user.id ? "▲" : "▼"}</span>
                        </div>

                        {expandedUser === user.id && (
                          <div style={{ borderTop: "1px solid #f0f4f8", padding: 16, background: "#fafbfc" }}>

                            {/* ✅ Status summary واضح */}
                            <div style={{ display: "flex", gap: 8, marginBottom: 14, padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #e8edf3" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7A8D" }}>الحالة:</div>
                              <span style={{
                                fontSize: 11, fontWeight: 700,
                                color: user.isActive ? "#27ae60" : "#e53935"
                              }}>
                                {user.isActive ? "✅ الحساب مفعل" : "⏸ الحساب موقوف"}
                              </span>
                              <span style={{ color: "#ddd" }}>|</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: user.hasWebAccess ? "#27ae60" : "#e53935" }}>
                                {user.hasWebAccess ? "🌐 الموقع مفعل" : "🌐 الموقع موقوف"}
                              </span>
                              <span style={{ color: "#ddd" }}>|</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: user.hasBooksAccess ? "#f59e0b" : "#e53935" }}>
                                {user.hasBooksAccess ? "📚 الكتب مفعلة" : "📚 الكتب موقوفة"}
                              </span>
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7A8D", marginBottom: 8 }}>الأجهزة المسجلة ({user.devices.length}/2)</div>
                              {user.devices.length === 0 ? <p style={{ fontSize: 11, color: "#9e9e9e" }}>لا أجهزة مسجلة</p> : (
                                user.devices.map((d) => (
                                  <div key={d.id} style={{ fontSize: 11, background: "#fff", borderRadius: 8, padding: "6px 10px", marginBottom: 4, border: "1px solid #e8edf3" }}>
                                    <span style={{ fontWeight: 600 }}>{d.label}</span>
                                    <span style={{ color: "#9e9e9e", marginRight: 8 }}>• {new Date(d.lastSeen).toLocaleDateString("ar-EG")}</span>
                                  </div>
                                ))
                              )}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              <ActionBtn label={user.isActive ? "⏸ إيقاف" : "▶ تفعيل"} color={user.isActive ? "#e53935" : "#27ae60"} onClick={() => handleAction(user.id, "toggleActive", !user.isActive)} />
                              <ActionBtn label="📱 مسح الأجهزة" color="#fb8c00" onClick={() => handleAction(user.id, "resetDevices")} />
                              <ActionBtn label="⏰ تجديد" color="#0E7C86" onClick={() => { const d = prompt("تاريخ الانتهاء (YYYY-MM-DD):"); if (d) handleAction(user.id, "updateExpiry", d); }} />
                              <ActionBtn label="🔑 كلمة مرور" color="#8e24aa" onClick={() => { const pw = prompt("كلمة المرور الجديدة:"); if (pw) handleAction(user.id, "resetPassword", pw); }} />
                              <ActionBtn
                                label={user.hasWebAccess ? "🌐 إيقاف الموقع" : "🌐 تفعيل الموقع"}
                                color={user.hasWebAccess ? "#e65100" : "#0277bd"}
                                onClick={() => handleAction(user.id, "toggleWebAccess", !user.hasWebAccess)}
                              />
                              <ActionBtn
                                label={user.hasBooksAccess ? "📚 إيقاف الكتب" : "📚 تفعيل الكتب"}
                                color={user.hasBooksAccess ? "#e65100" : "#F4A723"}
                                onClick={() => handleAction(user.id, "toggleBooksAccess", !user.hasBooksAccess)}
                              />
                              <ActionBtn label="🗑 حذف" color="#e53935" onClick={() => handleDelete(user.id, user.email)} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === "requests" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {requests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 60, color: "#9e9e9e" }}>لا توجد طلبات تسجيل</div>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #f0f4f8", display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: req.status === "pending" ? "#fff8e1" : req.status === "approved" ? "#e8f5e9" : "#ffebee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                        {req.status === "pending" ? "⏳" : req.status === "approved" ? "✅" : "❌"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0B1E3D" }}>{req.name}</div>
                        <div style={{ fontSize: 11, color: "#9e9e9e" }}>{req.email}</div>
                        <div style={{ fontSize: 10, color: "#bbb", marginTop: 2 }}>{new Date(req.createdAt).toLocaleString("ar-EG")}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: req.status === "pending" ? "#fff8e1" : req.status === "approved" ? "#e8f5e9" : "#ffebee", color: req.status === "pending" ? "#f59e0b" : req.status === "approved" ? "#27ae60" : "#e53935" }}>
                        {req.status === "pending" ? "معلق" : req.status === "approved" ? "مقبول" : "مرفوض"}
                      </span>
                      {req.status === "pending" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { const d = prompt("تاريخ انتهاء الاشتراك (YYYY-MM-DD) — اتركه فارغاً بدون انتهاء:"); handleRequest(req.id, "approve", d || undefined); }}
                            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "none", background: "#27ae60", color: "#fff", cursor: "pointer", fontWeight: 700 }}>✅ قبول</button>
                          <button onClick={() => handleRequest(req.id, "reject")}
                            style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: "none", background: "#e53935", color: "#fff", cursor: "pointer", fontWeight: 700 }}>❌ رفض</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Books Tab */}
            {activeTab === "books" && (
              <div>
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#0B1E3D", marginBottom: 16 }}>📚 إضافة كتاب جديد</div>
                  <form onSubmit={handleAddBook}>
                    <Field label="عنوان الكتاب" value={newBook.title} onChange={(v) => setNewBook({ ...newBook, title: v })} placeholder="مرجع الطبيب العام" />
                    <Field label="وصف مختصر (اختياري)" value={newBook.description} onChange={(v) => setNewBook({ ...newBook, description: v })} placeholder="وصف الكتاب..." />
                    <Field label="رابط ملف PDF (Supabase Storage)" value={newBook.fileUrl} onChange={(v) => setNewBook({ ...newBook, fileUrl: v })} placeholder="https://..." />
                    <Field label="رابط صورة الغلاف (اختياري)" value={newBook.coverUrl} onChange={(v) => setNewBook({ ...newBook, coverUrl: v })} placeholder="https://..." />
                    <Field label="السعر بالجنيه (اختياري)" value={newBook.price} onChange={(v) => setNewBook({ ...newBook, price: v })} placeholder="150" />
                    <button type="submit" style={{ padding: "10px 24px", background: "linear-gradient(135deg, #0B1E3D, #0E7C86)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      إضافة الكتاب
                    </button>
                  </form>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {books.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "#9e9e9e", fontSize: 13 }}>لا توجد كتب مضافة</div>
                  ) : (
                    books.map((book) => (
                      <div key={book.id} style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #f0f4f8", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: book.isActive ? "#fff8e1" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          📚
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#0B1E3D" }}>{book.title}</div>
                          {book.description && <div style={{ fontSize: 11, color: "#6B7A8D", marginTop: 2 }}>{book.description}</div>}
                          {book.price && <div style={{ fontSize: 11, color: "#F4A723", marginTop: 2, fontWeight: 600 }}>{book.price} جنيه</div>}
                        </div>
                        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, background: book.isActive ? "#e8f5e9" : "#ffebee", color: book.isActive ? "#27ae60" : "#e53935" }}>
                          {book.isActive ? "✅ مفعّل" : "⏸ موقوف"}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <ActionBtn
                            label={book.isActive ? "⏸ إيقاف" : "▶ تفعيل"}
                            color={book.isActive ? "#e53935" : "#27ae60"}
                            onClick={() => handleToggleBook(book.id, book.isActive)}
                          />
                          <ActionBtn label="🗑 حذف" color="#e53935" onClick={() => handleDeleteBook(book.id, book.title)} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Add User Tab */}
            {activeTab === "add" && (
              <div style={{ maxWidth: 460 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0B1E3D", marginBottom: 20 }}>➕ إضافة مستخدم جديد</div>
                  <form onSubmit={handleAddUser}>
                    <Field label="الاسم" value={newUser.name} onChange={(v) => setNewUser({ ...newUser, name: v })} placeholder="د. أحمد محمد" />
                    <Field label="البريد الإلكتروني" type="email" value={newUser.email} onChange={(v) => setNewUser({ ...newUser, email: v })} placeholder="doctor@email.com" />
                    <Field label="كلمة المرور" type="password" value={newUser.password} onChange={(v) => setNewUser({ ...newUser, password: v })} placeholder="••••••••" />
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>تاريخ انتهاء الاشتراك (اختياري)</label>
                      <input type="date" value={newUser.expiresAt} onChange={(e) => setNewUser({ ...newUser, expiresAt: e.target.value })}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div style={{ marginBottom: 16, background: "#f8fafc", borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>نوع الاشتراك</div>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={newUser.hasWebAccess} onChange={(e) => setNewUser({ ...newUser, hasWebAccess: e.target.checked })} />
                        <span style={{ fontSize: 13 }}>🌐 الوصول للموقع (GP101)</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input type="checkbox" checked={newUser.hasBooksAccess} onChange={(e) => setNewUser({ ...newUser, hasBooksAccess: e.target.checked })} />
                        <span style={{ fontSize: 13 }}>📚 الوصول للكتب</span>
                      </label>
                    </div>
                    <button type="submit" style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #0B1E3D, #0E7C86)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      إضافة المستخدم
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6B7A8D", marginTop: 4 }}>{icon} {label}</div>
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 8, border: `1px solid ${color}30`, background: `${color}12`, color, cursor: "pointer", fontWeight: 600 }}>
      {label}
    </button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        dir={type === "email" || type === "password" ? "ltr" : "rtl"}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
