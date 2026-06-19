import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { THEMES } from "../themes.js";

const NICHES = ["artificial-intelligence", "personal-finance", "pet-care", "health-wellness", "technology"];

const inputStyle = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "9px 12px", color: "var(--text)", fontSize: 13
};

// Module-scope (stable identity) so inputs don't remount and lose focus.
function Field({ label, field, placeholder, type = "text", form, setForm }) {
  const set = (val) => setForm(p => ({ ...p, [field]: val }));
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: "var(--muted)", fontSize: 11, marginBottom: 5 }}>{label}</label>
      {field === "niche"
        ? <select value={form[field]} onChange={e => set(e.target.value)} style={inputStyle}>
            {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        : <input type={type} value={form[field]} placeholder={placeholder}
            onChange={e => set(e.target.value)} style={inputStyle} />
      }
    </div>
  );
}

// Visual preview of a single theme.
function ThemeSwatch({ theme, selected, onClick }) {
  return (
    <div onClick={onClick} title={theme.label} style={{ cursor: "pointer", width: 84 }}>
      <div style={{
        borderRadius: 10, overflow: "hidden", background: theme.bg,
        border: selected ? "2px solid var(--accent)" : "2px solid var(--border)",
        boxShadow: selected ? "var(--glow)" : "none", transition: "all 0.15s"
      }}>
        <div style={{ height: 34, background: theme.hero }} />
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: theme.accent, border: "1px solid rgba(255,255,255,0.25)" }} />
        </div>
      </div>
      <div style={{ fontSize: 11, marginTop: 6, textAlign: "center", color: selected ? "var(--accent)" : "var(--muted)", fontWeight: 600 }}>
        {theme.label}
      </div>
    </div>
  );
}

function ThemePicker({ value, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {THEMES.map(t => (
        <ThemeSwatch key={t.name} theme={t} selected={value === t.name} onClick={() => onSelect(t.name)} />
      ))}
    </div>
  );
}

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", niche: "artificial-intelligence", domain: "", adsense_id: "", theme: "midnight" });
  const [savingTheme, setSavingTheme] = useState(null);
  const [provisioning, setProvisioning] = useState(null);
  const [provisionResult, setProvisionResult] = useState({});

  useEffect(() => { api.getSites().then(setSites).catch(() => {}); }, []);

  // Scaffold the site's files (folder + docker-compose + nginx) on the server.
  // Does NOT build — the operator runs the returned rebuild command on the host.
  async function provision(id) {
    setProvisioning(id);
    setProvisionResult(p => ({ ...p, [id]: null }));
    try {
      const res = await api.provisionSite(id);
      setProvisionResult(p => ({ ...p, [id]: { ok: true, ...res } }));
    } catch (e) {
      setProvisionResult(p => ({ ...p, [id]: { ok: false, error: e.message } }));
    } finally {
      setProvisioning(null);
    }
  }

  async function submit() {
    const site = await api.createSite(form);
    setSites(prev => [site, ...prev]);
    setShowForm(false);
    setForm({ id: "", name: "", niche: "artificial-intelligence", domain: "", adsense_id: "", theme: "midnight" });
  }

  async function applyTheme(id, theme) {
    setSavingTheme(id + theme);
    try {
      const updated = await api.updateSite(id, { theme });
      setSites(prev => prev.map(s => (s.id === id ? { ...s, theme: updated.theme } : s)));
    } catch { /* ignore */ }
    finally { setSavingTheme(null); }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Sites</h1>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>Manage all your websites</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: "var(--grad-accent)", color: "white", border: "none",
          borderRadius: "var(--radius)", padding: "10px 20px", fontWeight: 600, fontSize: 13, boxShadow: "var(--glow)"
        }}>+ Add Site</button>
      </div>

      {showForm && (
        <div style={{ background: "var(--grad-surface)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: 24, marginBottom: 24, boxShadow: "var(--glow)" }}>
          <h3 style={{ marginBottom: 16, fontWeight: 600 }}>New Site</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="SITE ID (no spaces)" field="id" placeholder="site-003-pets" form={form} setForm={setForm} />
            <Field label="DISPLAY NAME" field="name" placeholder="Pet Lovers Daily" form={form} setForm={setForm} />
            <Field label="NICHE" field="niche" form={form} setForm={setForm} />
            <Field label="DOMAIN" field="domain" placeholder="petlovers.com" form={form} setForm={setForm} />
            <Field label="ADSENSE ID (optional)" field="adsense_id" placeholder="ca-pub-XXXXXXXXXX" form={form} setForm={setForm} />
          </div>
          <div style={{ marginTop: 4, marginBottom: 18 }}>
            <label style={{ display: "block", color: "var(--muted)", fontSize: 11, marginBottom: 10 }}>THEME</label>
            <ThemePicker value={form.theme} onSelect={(name) => setForm(p => ({ ...p, theme: name }))} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={submit} style={{ background: "var(--grad-accent)", color: "white", border: "none", borderRadius: "var(--radius)", padding: "9px 20px", fontWeight: 600, fontSize: 13 }}>Create Site</button>
            <button onClick={() => setShowForm(false)} style={{ background: "var(--border)", color: "var(--text)", border: "none", borderRadius: "var(--radius)", padding: "9px 20px", fontWeight: 600, fontSize: 13 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {sites.map(s => (
          <div key={s.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 3 }}>
                  ID: {s.id} · Niche: {s.niche} · Domain: {s.domain || "—"} · Theme: <span style={{ color: "var(--accent2)" }}>{s.theme || "midnight"}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {s.domain && (
                  <a href={`https://${s.domain}`} target="_blank" rel="noreferrer" style={{ color: "var(--accent2)", fontSize: 12 }}>Visit →</a>
                )}
                <button onClick={() => provision(s.id)} disabled={provisioning === s.id} title="Generate site folder + docker-compose + nginx blocks (no build)" style={{
                  background: "var(--border)", color: "var(--text)", border: "1px solid var(--accent)",
                  borderRadius: "var(--radius)", padding: "5px 12px", fontWeight: 600, fontSize: 11,
                  cursor: provisioning === s.id ? "default" : "pointer", opacity: provisioning === s.id ? 0.6 : 1
                }}>{provisioning === s.id ? "Provisioning…" : "Provision files"}</button>
                <span style={{
                  padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                  background: s.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.15)",
                  color: s.status === "active" ? "var(--success)" : "var(--muted)"
                }}>{s.status}</span>
              </div>
            </div>

            {/* Provision result / next-step instructions */}
            {provisionResult[s.id] && (
              provisionResult[s.id].ok ? (
                <div style={{ marginTop: 14, padding: 14, background: "var(--bg)", border: "1px solid var(--success)", borderRadius: "var(--radius)", fontSize: 12 }}>
                  <div style={{ color: "var(--success)", fontWeight: 700, marginBottom: 6 }}>✓ Files generated · port {provisionResult[s.id].port}</div>
                  <div style={{ color: "var(--muted)" }}>Wrote <code>{provisionResult[s.id].siteDir}</code>, updated <code>docker-compose.yml</code> + <code>nginx.conf</code>. Now run on the host to build &amp; start it:</div>
                  <div style={{ marginTop: 8, padding: "8px 10px", background: "#000", color: "var(--accent2)", borderRadius: 6, fontFamily: "monospace", fontSize: 12 }}>{provisionResult[s.id].rebuildCommand}</div>
                  <div style={{ marginTop: 6, color: "var(--muted)" }}>Then open <a href={provisionResult[s.id].localUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent2)" }}>{provisionResult[s.id].localUrl}</a></div>
                </div>
              ) : (
                <div style={{ marginTop: 14, padding: 14, background: "var(--bg)", border: "1px solid var(--danger)", borderRadius: "var(--radius)", fontSize: 12, color: "var(--danger)" }}>
                  ✗ {provisionResult[s.id].error}
                </div>
              )
            )}

            {/* Theme picker per site — selecting saves immediately via PATCH */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <label style={{ display: "block", color: "var(--muted)", fontSize: 11, marginBottom: 10 }}>
                THEME {savingTheme && savingTheme.startsWith(s.id) ? "· saving…" : ""}
              </label>
              <ThemePicker value={s.theme || "midnight"} onSelect={(name) => applyTheme(s.id, name)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
