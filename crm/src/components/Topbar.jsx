import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Sticky top bar: breadcrumb, global search, quick action + profile.
// Module scope (stable identity) so the search input never remounts.
export default function Topbar({ nav }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const current = nav.find((n) => location.pathname.startsWith(n.to));
  const label = current ? current.label : "Dashboard";

  const submit = () => {
    const term = q.trim();
    navigate(term ? `/articles?q=${encodeURIComponent(term)}` : "/articles");
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 32px",
        background: "rgba(13,15,20,0.72)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexShrink: 0 }}>
        <span style={{ color: "var(--muted)" }}>ZoyZoy Hub</span>
        <span style={{ color: "var(--border)" }}>/</span>
        <span style={{ color: "var(--text)", fontWeight: 600 }}>{label}</span>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 460, marginLeft: "auto", position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13, pointerEvents: "none" }}>
          ⌕
        </span>
        <input
          className="zz-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Search articles…"
          style={{
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            padding: "8px 14px 8px 30px",
            color: "var(--text)",
            fontSize: 13,
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button
          className="zz-btn"
          title="Notifications"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 10, width: 34, height: 34, fontSize: 14 }}
        >
          🔔
        </button>
        <div
          title="Account"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--grad-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "var(--glow)",
          }}
        >
          Z
        </div>
      </div>
    </header>
  );
}
