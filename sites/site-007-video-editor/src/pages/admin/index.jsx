import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";

const TABS = [
  { id: "settings", label: "Site text & name" },
  { id: "portfolio", label: "Portfolio" },
  { id: "services", label: "Services" },
  { id: "testimonials", label: "Reviews" },
  { id: "inquiries", label: "Messages" },
];

const inputStyle = {
  width: "100%", background: "#0b0614", border: "1px solid #3b2458",
  borderRadius: 12, padding: "11px 12px", color: "#fff7fb", fontSize: 14,
};
const labelStyle = {
  display: "block", color: "#c4b0d8", fontSize: 11, fontWeight: 700,
  marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase",
};
const btnPrimary = {
  background: "linear-gradient(125deg,#ff4d9a,#a855f7,#38bdf8)",
  color: "#fff", border: "none", borderRadius: 999, padding: "10px 18px",
  fontWeight: 800, fontSize: 13, cursor: "pointer",
};
const btnGhost = {
  background: "transparent", color: "#c4b0d8", border: "1px solid #3b2458",
  borderRadius: 999, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer",
};
const btnDanger = {
  background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.4)",
  borderRadius: 999, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer",
};
const card = {
  background: "#161022", border: "1px solid #3b2458", borderRadius: 18, padding: 20,
};

async function cms(path, options = {}) {
  const res = await fetch(`/api/admin/cms/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || body.detail || `Error ${res.status}`);
  return body;
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("settings");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [settings, setSettings] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [editing, setEditing] = useState(null);

  const flash = (text, isErr = false) => {
    setMsg(isErr ? "" : text);
    setErr(isErr ? text : "");
    setTimeout(() => { setMsg(""); setErr(""); }, 2800);
  };

  const load = useCallback(async () => {
    const [s, p, sv, t, i] = await Promise.all([
      cms("settings"),
      cms("portfolio?all=1"),
      cms("services?all=1"),
      cms("testimonials?all=1"),
      cms("inquiries"),
    ]);
    setSettings(s || {
      brand_name: "FrameForge", tagline: "", eyebrow: "", hero_lead: "", hero_accent: "",
      hero_cta: "Hire me", about_title: "", about_body: "", email: "", phone: "", location: "",
      social_instagram: "", social_youtube: "", social_vimeo: "", social_whatsapp: "", footer_note: "",
    });
    setPortfolio(p);
    setServices(sv);
    setTestimonials(t);
    setInquiries(i);
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then(async (d) => {
        setAuthed(!!d.ok);
        if (d.ok) await load();
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, [load]);

  async function login() {
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(body.error || "Login failed");
      return;
    }
    setAuthed(true);
    setPassword("");
    await load();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  async function saveSettings() {
    try {
      const saved = await cms("settings", { method: "PUT", body: JSON.stringify(settings) });
      setSettings(saved);
      flash("Saved — website updated");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function savePortfolio(form) {
    try {
      if (form.id) await cms(`portfolio/${form.id}`, { method: "PATCH", body: JSON.stringify(form) });
      else await cms("portfolio", { method: "POST", body: JSON.stringify(form) });
      setEditing(null);
      await load();
      flash("Portfolio saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function saveService(form) {
    try {
      const payload = {
        ...form,
        features: typeof form.features === "string"
          ? form.features.split("\n").map((s) => s.trim()).filter(Boolean)
          : form.features,
      };
      if (form.id) await cms(`services/${form.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await cms("services", { method: "POST", body: JSON.stringify(payload) });
      setEditing(null);
      await load();
      flash("Service saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function saveTestimonial(form) {
    try {
      if (form.id) await cms(`testimonials/${form.id}`, { method: "PATCH", body: JSON.stringify(form) });
      else await cms("testimonials", { method: "POST", body: JSON.stringify(form) });
      setEditing(null);
      await load();
      flash("Review saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  const shell = (children) => (
    <>
      <Head>
        <title>Admin | FrameForge</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Outfit,Inter,system-ui,sans-serif;background:
          radial-gradient(ellipse 100% 80% at 0% 0%,#4c1d95,transparent 50%),
          radial-gradient(ellipse 80% 60% at 100% 0%,#9d174d,transparent 45%),#0b0614;
          color:#fff7fb;min-height:100vh}
        input,textarea,select,button{font:inherit}
      `}} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 18px 60px" }}>
        {children}
      </div>
    </>
  );

  if (checking) {
    return shell(<p style={{ color: "#c4b0d8" }}>Loading admin…</p>);
  }

  if (!authed) {
    return shell(
      <div style={{ ...card, maxWidth: 420, margin: "60px auto" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>Website Admin</h1>
        <p style={{ color: "#c4b0d8", marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
          Same website — login to edit name, text, portfolio videos, images, services, and reviews.
        </p>
        <Field label="Password">
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
          />
        </Field>
        {err && <p style={{ color: "#fca5a5", marginBottom: 12, fontSize: 13 }}>{err}</p>}
        <button type="button" style={btnPrimary} onClick={login}>Open admin panel</button>
        <div style={{ marginTop: 18 }}>
          <Link href="/" style={{ color: "#45f0ff", fontSize: 13, fontWeight: 700 }}>← Back to website</Link>
        </div>
      </div>
    );
  }

  return shell(
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div>
          <h1 style={{
            fontSize: 28, fontWeight: 900,
            background: "linear-gradient(125deg,#ff4d9a,#a855f7,#38bdf8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Website Admin
          </h1>
          <p style={{ color: "#c4b0d8", fontSize: 13, marginTop: 4 }}>
            Changes save to the live website instantly.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" style={{ ...btnGhost, display: "inline-flex", alignItems: "center" }}>View website</Link>
          <button type="button" style={btnGhost} onClick={logout}>Logout</button>
        </div>
      </div>

      {(msg || err) && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 12,
          background: err ? "rgba(239,68,68,0.15)" : "rgba(52,211,153,0.15)",
          color: err ? "#fca5a5" : "#6ee7b7", fontWeight: 700, fontSize: 13,
        }}>
          {err || msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setEditing(null); }}
            style={{
              ...btnGhost,
              color: tab === t.id ? "#fff" : "#c4b0d8",
              background: tab === t.id ? "linear-gradient(125deg,#ff4d9a,#a855f7)" : "transparent",
              borderColor: tab === t.id ? "transparent" : "#3b2458",
            }}
          >
            {t.label}
            {t.id === "inquiries" && inquiries.filter((i) => i.status === "new").length
              ? ` (${inquiries.filter((i) => i.status === "new").length})`
              : ""}
          </button>
        ))}
      </div>

      {tab === "settings" && settings && (
        <div style={card}>
          <p style={{ color: "#c4b0d8", fontSize: 13, marginBottom: 16 }}>
            Website name, hero text, about, contact, and social links — sab yahan se change hota hai.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["brand_name", "Website / brand name"],
              ["eyebrow", "Top bar text"],
              ["hero_lead", "Hero lead text"],
              ["hero_accent", "Hero colorful word"],
              ["hero_cta", "Button text (Hire me)"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["social_instagram", "Instagram URL"],
              ["social_youtube", "YouTube URL"],
              ["social_vimeo", "Vimeo URL"],
              ["social_whatsapp", "WhatsApp URL"],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  style={inputStyle}
                  value={settings[key] || ""}
                  onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
                />
              </Field>
            ))}
          </div>
          <Field label="Tagline">
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={settings.tagline || ""} onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))} />
          </Field>
          <Field label="About title">
            <input style={inputStyle} value={settings.about_title || ""} onChange={(e) => setSettings((s) => ({ ...s, about_title: e.target.value }))} />
          </Field>
          <Field label="About text">
            <textarea rows={5} style={{ ...inputStyle, resize: "vertical" }} value={settings.about_body || ""} onChange={(e) => setSettings((s) => ({ ...s, about_body: e.target.value }))} />
          </Field>
          <Field label="Footer note">
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={settings.footer_note || ""} onChange={(e) => setSettings((s) => ({ ...s, footer_note: e.target.value }))} />
          </Field>
          <button type="button" style={btnPrimary} onClick={saveSettings}>Save website text</button>
        </div>
      )}

      {tab === "portfolio" && (
        <CrudBlock
          items={portfolio}
          empty="No portfolio projects yet."
          onAdd={() => setEditing({
            title: "", slug: "", description: "", category: "YouTube",
            video_url: "", thumbnail_url: "", client_name: "", featured: true,
            sort_order: 0, status: "published",
          })}
          onEdit={setEditing}
          onDelete={async (item) => {
            if (!confirm("Delete this project?")) return;
            await cms(`portfolio/${item.id}`, { method: "DELETE" });
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <strong>{item.title}</strong>
              <div style={{ color: "#c4b0d8", fontSize: 12, marginTop: 4 }}>
                {item.category} · {item.status}{item.featured ? " · featured" : ""}
              </div>
            </>
          )}
          form={editing && tab === "portfolio" ? (
            <PortfolioForm form={editing} setForm={setEditing} onSave={() => savePortfolio(editing)} onCancel={() => setEditing(null)} />
          ) : null}
        />
      )}

      {tab === "services" && (
        <CrudBlock
          items={services}
          empty="No services yet."
          onAdd={() => setEditing({ title: "", description: "", price_label: "", features: "", sort_order: 0, status: "published" })}
          onEdit={(item) => setEditing({
            ...item,
            features: Array.isArray(item.features) ? item.features.join("\n") : (item.features || ""),
          })}
          onDelete={async (item) => {
            if (!confirm("Delete this service?")) return;
            await cms(`services/${item.id}`, { method: "DELETE" });
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <strong>{item.title}</strong>
              <div style={{ color: "#c4b0d8", fontSize: 12, marginTop: 4 }}>{item.price_label || "No price"}</div>
            </>
          )}
          form={editing && tab === "services" ? (
            <ServiceForm form={editing} setForm={setEditing} onSave={() => saveService(editing)} onCancel={() => setEditing(null)} />
          ) : null}
        />
      )}

      {tab === "testimonials" && (
        <CrudBlock
          items={testimonials}
          empty="No reviews yet."
          onAdd={() => setEditing({ client_name: "", client_role: "", quote: "", rating: 5, avatar_url: "", sort_order: 0, status: "published" })}
          onEdit={setEditing}
          onDelete={async (item) => {
            if (!confirm("Delete this review?")) return;
            await cms(`testimonials/${item.id}`, { method: "DELETE" });
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <strong>{item.client_name}</strong>
              <div style={{ color: "#c4b0d8", fontSize: 12, marginTop: 4 }}>{item.client_role} · {"★".repeat(item.rating || 5)}</div>
            </>
          )}
          form={editing && tab === "testimonials" ? (
            <ReviewForm form={editing} setForm={setEditing} onSave={() => saveTestimonial(editing)} onCancel={() => setEditing(null)} />
          ) : null}
        />
      )}

      {tab === "inquiries" && (
        <div style={card}>
          {inquiries.length === 0 ? (
            <p style={{ color: "#c4b0d8", textAlign: "center", padding: 20 }}>No hire messages yet.</p>
          ) : inquiries.map((item) => (
            <div key={item.id} style={{ border: "1px solid #3b2458", borderRadius: 14, padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: "#c4b0d8", fontSize: 12, marginTop: 4 }}>
                    {item.email}{item.phone ? ` · ${item.phone}` : ""} · {item.project_type || "General"}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: item.status === "new" ? "#fcd34d" : "#6ee7b7" }}>{item.status}</span>
              </div>
              <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>{item.message}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button type="button" style={btnGhost} onClick={async () => { await cms(`inquiries/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: "read" }) }); await load(); }}>Mark read</button>
                <button type="button" style={btnGhost} onClick={async () => { await cms(`inquiries/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: "replied" }) }); await load(); }}>Mark replied</button>
                <button type="button" style={btnDanger} onClick={async () => { if (!confirm("Delete?")) return; await cms(`inquiries/${item.id}`, { method: "DELETE" }); await load(); }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function CrudBlock({ items, empty, onAdd, onEdit, onDelete, renderRow, form }) {
  return (
    <div>
      {form}
      <div style={{ ...card, marginTop: form ? 14 : 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ color: "#c4b0d8", fontSize: 13 }}>{items.length} items</div>
          <button type="button" style={btnPrimary} onClick={onAdd}>Add new</button>
        </div>
        {items.length === 0 ? (
          <p style={{ color: "#c4b0d8", textAlign: "center", padding: 16 }}>{empty}</p>
        ) : items.map((item) => (
          <div key={item.id} style={{
            display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center",
            border: "1px solid #3b2458", borderRadius: 12, padding: "12px 14px", marginBottom: 8,
          }}>
            <div style={{ minWidth: 0 }}>{renderRow(item)}</div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button type="button" style={btnGhost} onClick={() => onEdit(item)}>Edit</button>
              <button type="button" style={btnDanger} onClick={() => onDelete(item)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 12, fontSize: 17 }}>{form.id ? "Edit project" : "New project"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["title", "Title"],
          ["slug", "URL slug (optional)"],
          ["category", "Category"],
          ["client_name", "Client name"],
          ["video_url", "Video URL (YouTube / Vimeo)"],
          ["thumbnail_url", "Image / thumbnail URL"],
          ["sort_order", "Sort order"],
          ["status", "Status (published / draft)"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <input style={inputStyle} value={form[key] ?? ""} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
          </Field>
        ))}
      </div>
      <Field label="Description">
        <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </Field>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, fontSize: 13 }}>
        <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
        Show on homepage
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ServiceForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 12, fontSize: 17 }}>{form.id ? "Edit service" : "New service"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title"><input style={inputStyle} value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
        <Field label="Price label"><input style={inputStyle} value={form.price_label || ""} onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))} /></Field>
        <Field label="Sort order"><input style={inputStyle} value={form.sort_order ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} /></Field>
        <Field label="Status"><input style={inputStyle} value={form.status || "published"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} /></Field>
      </div>
      <Field label="Description"><textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
      <Field label="Features (one per line)"><textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.features || ""} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function ReviewForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 12, fontSize: 17 }}>{form.id ? "Edit review" : "New review"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Client name"><input style={inputStyle} value={form.client_name || ""} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} /></Field>
        <Field label="Role"><input style={inputStyle} value={form.client_role || ""} onChange={(e) => setForm((f) => ({ ...f, client_role: e.target.value }))} /></Field>
        <Field label="Rating (1-5)"><input style={inputStyle} value={form.rating ?? 5} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} /></Field>
        <Field label="Avatar image URL"><input style={inputStyle} value={form.avatar_url || ""} onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))} /></Field>
      </div>
      <Field label="Review text"><textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.quote || ""} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
