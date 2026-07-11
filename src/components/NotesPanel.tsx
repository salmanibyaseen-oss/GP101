"use client";
// src/components/NotesPanel.tsx
import { useState, useEffect } from "react";

interface NotesPanelProps {
  slug: string;
  onNoteChange: (hasNote: boolean) => void;
  onClose: () => void;
}

export function NotesPanel({ slug, onNoteChange, onClose }: NotesPanelProps) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/notes?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setNote(d.note?.content || "");
        onNoteChange(!!d.note?.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, content: note }),
      });
      setSaved(true);
      onNoteChange(!!note.trim());
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("خطأ في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("مسح الملاحظة؟")) return;
    await fetch(`/api/notes?slug=${slug}`, { method: "DELETE" });
    setNote("");
    onNoteChange(false);
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-yellow-50 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-200 bg-yellow-100">
        <span className="font-semibold text-yellow-800 text-sm">📝 ملاحظاتي الشخصية</span>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-900 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-yellow-600 text-sm">
          جاري التحميل...
        </div>
      ) : (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="اكتب ملاحظاتك هنا..."
            className="flex-1 p-4 bg-transparent text-gray-800 text-sm resize-none focus:outline-none placeholder-yellow-400"
            dir="rtl"
          />

          {/* Actions */}
          <div className="p-3 border-t border-yellow-200 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-[#1e3a5f] text-white text-sm py-2 rounded-lg hover:bg-[#2d5a9e] disabled:opacity-60"
            >
              {saving ? "..." : saved ? "✓ تم الحفظ" : "حفظ"}
            </button>
            {note && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
              >
                🗑
              </button>
            )}
          </div>

          <p className="text-xs text-yellow-600 text-center pb-2 px-3">
            ملاحظاتك خاصة بك فقط ولا يراها أحد
          </p>
        </>
      )}
    </div>
  );
}
