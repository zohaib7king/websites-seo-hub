import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Sites from "./pages/Sites.jsx";
import Articles from "./pages/Articles.jsx";
import AIGenerator from "./pages/AIGenerator.jsx";
import Revenue from "./pages/Revenue.jsx";
import Topbar from "./components/Topbar.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard",   icon: "▦" },
  { to: "/sites",     label: "Sites",        icon: "🌐" },
  { to: "/articles",  label: "Articles",     icon: "📝" },
  { to: "/ai",        label: "AI Generator", icon: "✨" },
  { to: "/revenue",   label: "Revenue",      icon: "💰" },
];

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: 230, background: "var(--grad-surface)", borderRight: "1px solid var(--border)",
        padding: "22px 0", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0,
        position: "sticky", top: 0, height: "100vh"
      }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, background: "var(--grad-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, color: "#fff", fontSize: 17, boxShadow: "var(--glow)"
          }}>Z</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", lineHeight: 1.1 }}>
              <span style={{
                background: "var(--grad-accent)", WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>ZoyZoy</span> Hub
            </div>
            <div style={{ color: "var(--muted)", fontSize: 10.5, marginTop: 2 }}>Content CRM</div>
          </div>
        </div>

        <nav style={{ padding: "16px 12px 0" }}>
          <div style={{ color: "var(--muted)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "0 12px 8px", textTransform: "uppercase" }}>
            Menu
          </div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px", borderRadius: "var(--radius)",
              color: isActive ? "#fff" : "var(--muted)",
              background: isActive ? "var(--grad-accent)" : "transparent",
              boxShadow: isActive ? "var(--glow)" : "none",
              fontWeight: isActive ? 600 : 500, fontSize: 13.5,
              marginBottom: 3, transition: "all 0.15s"
            })}>
              <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: "auto", padding: "18px 20px 0", borderTop: "1px solid var(--border)", marginLeft: 0 }}>
          <div style={{ color: "var(--muted)", fontSize: 11 }}>v1.4 · zoyzoy-hub</div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100vh", overflow: "auto" }}>
        <Topbar nav={NAV} />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/ai" element={<AIGenerator />} />
            <Route path="/revenue" element={<Revenue />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
