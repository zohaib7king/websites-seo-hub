import React from "react";
import { NavItem } from "@zoyzoy/ui";

export const Sidebar = () => (
  <div
    style={{
      width: 220,
      background: "var(--grad-surface)",
      borderRight: "1px solid var(--border)",
      padding: "16px 12px",
    }}
  >
    <NavItem icon="▦" label="Dashboard" active />
    <NavItem icon="🌐" label="Sites" />
    <NavItem icon="📝" label="Articles" />
    <NavItem icon="✨" label="AI Generator" />
    <NavItem icon="💰" label="Revenue" />
  </div>
);

export const States = () => (
  <div style={{ padding: 24 }}>
    <div
      style={{
        width: 220,
        background: "var(--grad-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 12,
      }}
    >
      <NavItem icon="🌐" label="Active item" active />
      <NavItem icon="📝" label="Inactive item" />
    </div>
  </div>
);
