"use client";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Topic } from "@/lib/content";
import { NotesPanel } from "./NotesPanel";

const SECTION_COLORS: Record<string, string> = {
  "Medicine الباطنه": "#c0392b",
  "Surgery الجراحه": "#2980b9",
  "Pediatric الاطفال": "#e67e22",
  "OBGYN النساء": "#e91e8c",
  "ENT انف واذن": "#27ae60",
  "Ophthalmology عيون": "#795548",
  "Dermatology جلديه": "#8e44ad",
  "Toxicology سموم": "#7f8c8d",
};

interface ContentViewProps {
  topic: Topic;
  breadcrumb: { section: string; subsection: string } | null;
}

// ── Dedent helper ──────────────────────────────────────────────────────────
// Removes the common leading whitespace from every non-blank line, while
// preserving *relative* indentation between lines. This prevents 4+ space
// indented content (e.g. under ### headings) from being misread by
// CommonMark as a code block, which was silently swallowing tables and
// bullet lists that appear under level-3 headings.
function dedent(text: string): string {
  const lines = text.split("\n");
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim() === "") continue;
    const match = line.match(/^( *)/);
    const indent = match ? match[1].length : 0;
    if (indent < minIndent) minIndent = indent;
  }
  if (minIndent === Infinity || minIndent === 0) return text;
  return lines.map((l) => (l.trim() === "" ? l : l.slice(minIndent))).join("\n");
}

// ── Collapsible Section Component ─────────────────────────────────────────
function CollapsibleSection({
  title, children, color, level = 2, defaultOpen = false,
}: {
  title: React.ReactNode; children: React.ReactNode;
  color: string; level?: number; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  if (level === 2) {
    return (
      <div style={{ marginTop: 20, marginBottom: 4 }}>
        <button onClick={() => setOpen(!open)} style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 10, background: "none", border: "none",
          cursor: "pointer", padding: "8px 0", textAlign: "left", direction: "ltr",
        }}>
          <span style={{
            fontSize: 11, color: color, transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block", flexShrink: 0,
          }}>▶</span>
          <div style={{ width: 4, height: 18, borderRadius: 2, background: color, flexShrink: 0 }} />
          <span style={{
            fontSize: 14, fontWeight: 800, color: color,
            letterSpacing: 0.3, textTransform: "uppercase", flex: 1, textAlign: "left",
          }}>{title}</span>
        </button>
        <div style={{ height: 1, background: `${color}22`, marginBottom: 8 }} />
        {open && <div style={{ paddingLeft: 22, paddingBottom: 8 }}>{children}</div>}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10, marginBottom: 2 }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: 8, background: "none", border: "none",
        cursor: "pointer", padding: "5px 0", textAlign: "left", direction: "ltr",
      }}>
        <span style={{
          fontSize: 10, color: `${color}99`, transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block", flexShrink: 0,
        }}>▶</span>
        <span style={{
          fontSize: 13, fontWeight: 700, color: "#374151", flex: 1, textAlign: "left",
          borderLeft: `2px solid ${color}44`, paddingLeft: 8,
        }}>{title}</span>
      </button>
      {open && <div style={{ paddingLeft: 20, marginTop: 2, direction: "ltr" }}>{children}</div>}
    </div>
  );
}

// ── Notion-style Toggle ───────────────────────────────────────────────────
function NotionToggle({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      marginBottom: 6, borderRadius: 10,
      border: `1px solid ${color}22`, overflow: "hidden",
      background: open ? `${color}06` : "#fafafa", transition: "background 0.2s",
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: 10, background: "none", border: "none",
        cursor: "pointer", padding: "12px 14px", textAlign: "left", direction: "ltr",
      }}>
        <span style={{
          fontSize: 12, color: color, transition: "transform 0.2s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          display: "inline-block", flexShrink: 0,
        }}>▶</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0B1E3D", flex: 1, textAlign: "left", unicodeBidi: "plaintext" }}>
          {title.replace(/%%/g, "")}
        </span>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, opacity: 0.7 }} />
      </button>
      {open && (
        <div style={{
          borderTop: `1px solid ${color}18`, padding: "12px 18px 14px",
          background: "#fff", direction: "ltr", textAlign: "left",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Parse top-level bullet list into toggle items ─────────────────────────
function parseTopLevelToggles(content: string): Array<{ title: string; body: string }> | null {
  const lines = content.split("\n");
  const firstMeaningful = lines.find((l) => l.trim());
  if (!firstMeaningful || !firstMeaningful.trim().match(/^- %%/)) return null;

  const items: Array<{ title: string; body: string[] }> = [];
  let current: { title: string; body: string[] } | null = null;

  for (const line of lines) {
    const topMatch = line.trim().match(/^- %%(.+?)?%%(.*)$/);
    if (topMatch) {
      if (current) items.push(current);
      const rest = topMatch[2]?.trim() || "";
      current = { title: topMatch[1], body: rest ? [rest] : [] };
    } else {
      if (current) current.body.push(line.replace(/^\s{1,4}/, ""));
    }
  }
  if (current) items.push(current);
  return items.length > 0 ? items.map((i) => ({ title: i.title, body: i.body.join("\n") })) : null;
}

// ── Mini Markdown renderer ────────────────────────────────────────────────
function MiniMarkdown({ content, color }: { content: string; color: string }) {
  const normalized = dedent(content);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: () => null,
        h2: () => null,
        h3: () => null,

        strong: ({ children }) => (
          <strong style={{ fontWeight: 800, color: "#111827", unicodeBidi: "plaintext" }}>{children}</strong>
        ),

        ul: ({ children }) => (
          <ul style={{ listStyle: "none", padding: 0, margin: "4px 0" }}>{children}</ul>
        ),

        ol: ({ children }) => (
          <ol style={{ listStyle: "none", padding: 0, margin: "4px 0" }}>{children}</ol>
        ),

        li: ({ children }) => {
          const childArray = Array.isArray(children) ? children : [children];
          const first: React.ReactNode[] = [];
          const rest: React.ReactNode[] = [];
          let seenSub = false;
          childArray.forEach((child) => {
            if (!seenSub) {
              if (child && typeof child === "object" && "type" in (child as any) &&
                ((child as any).type === "ul" || (child as any).type === "ol")) {
                seenSub = true; rest.push(child);
              } else { first.push(child); }
            } else { rest.push(child); }
          });
          return (
            <li style={{ marginBottom: 5, listStyle: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, direction: "ltr" }}>
                <span style={{
                  marginTop: 6, width: 6, height: 6, borderRadius: "50%",
                  flexShrink: 0, background: color, opacity: 0.7,
                }} />
                <span style={{ fontSize: 13, color: "#1f2937", lineHeight: 1.7, flex: 1, textAlign: "left", unicodeBidi: "plaintext" }}>
                  {first}
                </span>
              </div>
              {rest.length > 0 && (
                <div style={{ paddingLeft: 22, marginTop: 3 }}>{rest}</div>
              )}
            </li>
          );
        },

        p: ({ children }) => (
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, marginBottom: 6, unicodeBidi: "plaintext" }}>{children}</p>
        ),

        blockquote: ({ children }) => (
          <blockquote style={{
            borderLeft: `4px solid ${color}`, background: `${color}0d`,
            paddingLeft: 14, paddingRight: 10, paddingTop: 8, paddingBottom: 8,
            margin: "10px 0", borderRadius: "8px 0 0 8px", fontSize: 13, color: "#374151",
            unicodeBidi: "plaintext",
          }}>{children}</blockquote>
        ),

        table: ({ children }) => (
          <div style={{ overflowX: "auto", margin: "10px 0" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th style={{ background: color, color: "#fff", padding: "7px 10px", textAlign: "left", fontWeight: 700, fontSize: 12, unicodeBidi: "plaintext" }}>{children}</th>
        ),
        td: ({ children }) => (
          <td style={{ border: "1px solid #e5e7eb", padding: "6px 10px", color: "#374151", fontSize: 12, unicodeBidi: "plaintext" }}>{children}</td>
        ),

        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <pre style={{ background: "#1f2937", color: "#f9fafb", borderRadius: 8, padding: 14, overflowX: "auto", fontSize: 12, margin: "10px 0" }}>
              <code>{children}</code>
            </pre>
          ) : (
            <code style={{ color: color, background: `${color}12`, padding: "1px 5px", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}>{children}</code>
          );
        },
      }}
    >
      {normalized}
    </ReactMarkdown>
  );
}

// ── Parse Markdown into sections ──────────────────────────────────────────
function parseIntoSections(content: string) {
  const lines = content.split("\n");
  const result: Array<{ type: "h1" | "h2" | "h3" | "text"; text: string; children: string[] }> = [];
  let current: { type: "h1" | "h2" | "h3" | "text"; text: string; children: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (current) result.push(current);
      current = { type: "h1", text: line.slice(2), children: [] };
    } else if (line.startsWith("## ")) {
      if (current) result.push(current);
      current = { type: "h2", text: line.slice(3), children: [] };
    } else if (line.startsWith("### ")) {
      if (current) result.push(current);
      current = { type: "h3", text: line.slice(4), children: [] };
    } else {
      if (!current) current = { type: "text", text: "", children: [] };
      current.children.push(line);
    }
  }
  if (current) result.push(current);
  return result;
}

// ── Main ContentView ──────────────────────────────────────────────────────
export function ContentView({ topic, breadcrumb }: ContentViewProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [hasNote, setHasNote] = useState(false);

  const sectionColor = breadcrumb ? SECTION_COLORS[breadcrumb.section] || "#1e3a5f" : "#1e3a5f";

  useEffect(() => {
    fetch(`/api/notes?slug=${topic.slug}`)
      .then((r) => r.json())
      .then((d) => setHasNote(!!d.note?.content))
      .catch(() => {});
  }, [topic.slug]);

  const sections = parseIntoSections(topic.content ?? "");

  const renderContent = (bodyText: string) => {
    if (!bodyText.trim()) return null;
    const toggles = parseTopLevelToggles(bodyText);
    if (toggles) {
      return (
        <div>
          {toggles.map((item, idx) => (
            <NotionToggle key={idx} title={item.title} color={sectionColor}>
              <MiniMarkdown content={item.body} color={sectionColor} />
            </NotionToggle>
          ))}
        </div>
      );
    }
    return <MiniMarkdown content={bodyText} color={sectionColor} />;
  };

  const renderSections = () => {
    const output: React.ReactNode[] = [];
    let i = 0;

    while (i < sections.length) {
      const sec = sections[i];

      if (sec.type === "h1") {
        output.push(
          <h1 key={"h1-" + i} style={{
            color: sectionColor, fontSize: 22, fontWeight: 900,
            borderBottom: `3px solid ${sectionColor}`,
            paddingBottom: 10, marginBottom: 16, letterSpacing: 0.3,
            unicodeBidi: "plaintext",
          }}>{sec.text}</h1>
        );
        const h1Body = sec.children.join("\n");
        const h1BodyLines = h1Body.split("\n");
        const h1FirstToggleIdx = h1BodyLines.findIndex(l => l.trim().match(/^- %%/));
        const h1PreText = h1FirstToggleIdx > 0 ? h1BodyLines.slice(0, h1FirstToggleIdx).join("\n") : "";
        const h1ToggleText = h1FirstToggleIdx >= 0 ? h1BodyLines.slice(h1FirstToggleIdx).join("\n") : h1Body;
        if (h1PreText.trim()) output.push(<div key={"h1-pre-" + i}><MiniMarkdown content={h1PreText} color={sectionColor} /></div>);
        if (h1ToggleText.trim()) output.push(<div key={"h1-body-" + i}>{renderContent(h1ToggleText)}</div>);
        i++;
        continue;
      }

      if (sec.type === "h2") {
        const childContent: string[] = [...sec.children];
        let j = i + 1;
        while (j < sections.length && sections[j].type !== "h2" && sections[j].type !== "h1" && sections[j].type !== "h3") {
          const sub = sections[j];
          childContent.push(...sub.children);
          j++;
        }
        const bodyText = childContent.join("\n");
        // split body into pre-toggle text and toggle items
        const bodyLines = bodyText.split("\n");
        const firstToggleIdx = bodyLines.findIndex(l => l.trim().match(/^- %%/));
        const preText = firstToggleIdx > 0 ? bodyLines.slice(0, firstToggleIdx).join("\n") : "";
        const toggleText = firstToggleIdx >= 0 ? bodyLines.slice(firstToggleIdx).join("\n") : bodyText;
        output.push(
          <div key={i}>
            <h2 style={{
              color: sectionColor, fontSize: 17, fontWeight: 700,
              borderBottom: `2px solid ${sectionColor}33`,
              paddingBottom: 6, marginTop: 20, marginBottom: 10,
              unicodeBidi: "plaintext",
            }}>{sec.text}</h2>
            {preText.trim() && <MiniMarkdown content={preText} color={sectionColor} />}
            {renderContent(toggleText)}
          </div>
        );
        i = j;
        continue;
      }

      if (sec.type === "h3") {
        const bodyText = sec.children.join("\n");
        const bodyLines = bodyText.split("\n");
        const firstToggleIdx = bodyLines.findIndex(l => l.trim().match(/^- %%/));
        const preText = firstToggleIdx > 0 ? bodyLines.slice(0, firstToggleIdx).join("\n") : "";
        const toggleText = firstToggleIdx >= 0 ? bodyLines.slice(firstToggleIdx).join("\n") : bodyText;
        output.push(
          <div key={"h3-" + i}>
            <h3 style={{
              color: sectionColor, fontSize: 15, fontWeight: 700,
              marginTop: 16, marginBottom: 8,
              paddingLeft: 10,
              borderLeft: `3px solid ${sectionColor}66`,
              unicodeBidi: "plaintext",
            }}>{sec.text}</h3>
            {preText.trim() && <MiniMarkdown content={preText} color={sectionColor} />}
            {toggleText.trim() && renderContent(toggleText)}
          </div>
        );
        i++;
        continue;
      }

      const bodyText = sec.children.join("\n");
      if (bodyText.trim()) output.push(<div key={i}>{renderContent(bodyText)}</div>);
      i++;
    }

    return output;
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {breadcrumb && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
              <span style={{ color: sectionColor }}>{breadcrumb.section}</span>
              <span>›</span>
              <span>{breadcrumb.subsection}</span>
            </div>
          )}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" dir="ltr">
            {renderSections()}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showNotes ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : hasNote ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                : "bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700"
              }`}
            >
              <span>📝</span>
              <span>{showNotes ? "إخفاء الملاحظات" : hasNote ? "عرض ملاحظاتي" : "إضافة ملاحظة"}</span>
            </button>
          </div>
        </div>
      </div>
      {showNotes && (
        <NotesPanel slug={topic.slug} onNoteChange={setHasNote} onClose={() => setShowNotes(false)} />
      )}
    </div>
  );
}
