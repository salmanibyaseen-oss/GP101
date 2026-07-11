"use client";
import { useState, useEffect } from "react";

export function OnlineStatus() {
  const [online, setOnline] = useState(true);
  const [caching, setCaching] = useState(false);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    // Register SW and start caching
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        // Wait for SW to be active
        await navigator.serviceWorker.ready;

        // Get all slugs from the page
        const res = await fetch("/api/slugs");
        if (res.ok) {
          const { slugs } = await res.json();
          setCaching(true);
          navigator.serviceWorker.controller?.postMessage({
            type: "CACHE_ALL_CONTENT",
            slugs,
          });
        }
      });

      // Listen for cache done message
      navigator.serviceWorker.addEventListener("message", (e) => {
        if (e.data?.type === "CACHE_DONE") {
          setCaching(false);
          setCached(true);
        }
      });
    }

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
          online ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
        }`}
      >
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            online ? "bg-green-500" : "bg-orange-500"
          }`}
        />
        <span>{online ? "متصل" : "بدون إنترنت"}</span>
      </div>

      {caching && (
        <div className="text-xs text-blue-600 animate-pulse">
          ⏳ جاري تحميل المحتوى...
        </div>
      )}

      {cached && !caching && (
        <div className="text-xs text-green-600">✅ متاح أوفلاين</div>
      )}
    </div>
  );
}
