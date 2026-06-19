import React from "react";
import { Badge } from "@zoyzoy/ui";

export const Tones = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: 24 }}>
    <Badge tone="success">active</Badge>
    <Badge tone="muted">inactive</Badge>
    <Badge tone="warning">draft</Badge>
    <Badge tone="danger">failed</Badge>
    <Badge tone="accent">scheduled</Badge>
  </div>
);

export const InContext = () => (
  <div style={{ padding: 24 }}>
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "14px 18px",
        color: "var(--text)",
        fontFamily: "var(--font)",
      }}
    >
      <span style={{ fontWeight: 600 }}>AI Insider Daily</span>
      <Badge tone="success">active</Badge>
    </div>
  </div>
);
