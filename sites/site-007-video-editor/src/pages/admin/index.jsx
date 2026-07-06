import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import MediaUpload from "../../components/MediaUpload.jsx";
import { isYoutubeUrl } from "../../lib/upload";

const TABS = [
  { id: "settings", label: "Site text & name" },
  { id: "thumbnails", label: "Thumbnails (images)" },
  { id: "portfolio", label: "My Work (videos)" },
  { id: "team", label: "Team" },
  { id: "services", label: "Services" },
  { id: "testimonials", label: "Reviews" },
  { id: "inquiries", label: "Messages" },
];

const inputStyle = {
  width: "100%", background: "#fff", border: "1px solid #cbd5e1",
  borderRadius: 10, padding: "11px 12px", color: "#0f172a", fontSize: 14,
};
const labelStyle = {
  display: "block", color: "#475569", fontSize: 11, fontWeight: 700,
  marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase",
};
const btnPrimary = {
  background: "linear-gradient(135deg,#0d9488,#0284c7)",
  color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px",
  fontWeight: 700, fontSize: 13, cursor: "pointer",
};
const btnGhost = {
  background: "#fff", color: "#475569", border: "1px solid #cbd5e1",
  borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer",
};
const btnDanger = {
  background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
  borderRadius: 8, padding: "8px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer",
};
const card = {
  background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20,
  boxShadow: "0 4px 20px rgba(15,23,42,.04)",
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
  const [thumbnails, setThumbnails] = useState([]);
  const [team, setTeam] = useState([]);
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
    const [s, th, tm, p, sv, t, i] = await Promise.all([
      cms("settings"),
      cms("thumbnails?all=1"),
      cms("team?all=1"),
      cms("portfolio?all=1"),
      cms("services?all=1"),
      cms("testimonials?all=1"),
      cms("inquiries"),
    ]);
    setSettings(s || {
      brand_name: "ibtihajForage", tagline: "", eyebrow: "", hero_lead: "", hero_accent: "",
      hero_cta: "Hire me", about_title: "", about_body: "", contact_title: "", contact_body: "",
      email: "", phone: "", location: "", notify_email: "", whatsapp_message: "",
      social_instagram: "", social_youtube: "", social_vimeo: "", social_whatsapp: "", footer_note: "",
    });
    setPortfolio(p);
    setThumbnails(th);
    setTeam(tm);
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

  async function saveThumbnail(form) {
    try {
      const payload = { ...form, video_url: null };
      if (form.id) await cms(`thumbnails/${form.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await cms("thumbnails", { method: "POST", body: JSON.stringify(payload) });
      setEditing(null);
      await load();
      flash("Thumbnail saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function saveTeamMember(form) {
    try {
      if (form.id) await cms(`team/${form.id}`, { method: "PATCH", body: JSON.stringify(form) });
      else await cms("team", { method: "POST", body: JSON.stringify(form) });
      setEditing(null);
      await load();
      flash("Team member saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function savePortfolio(form) {
    try {
      const payload = { ...form };
      if (form.video_source === "youtube" && !form.video_url) {
        flash("YouTube / Vimeo link required", true);
        return;
      }
      if (form.video_source === "upload" && !form.video_url?.startsWith("/api/media/")) {
        flash("Please upload a video file", true);
        return;
      }
      delete payload.video_source;
      if (form.id) await cms(`portfolio/${form.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      else await cms("portfolio", { method: "POST", body: JSON.stringify(payload) });
      setEditing(null);
      await load();
      flash("Work item saved");
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
        <title>Admin | ibtihajForage</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: `
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Outfit,Inter,system-ui,sans-serif;background:linear-gradient(180deg,#f0fdf9,#eff6ff);color:#0f172a;min-height:100vh}
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
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
            Website name, hero, About page, Contact page, email notifications, and WhatsApp — sab yahan se.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["brand_name", "Website / brand name"],
              ["eyebrow", "Top bar text"],
              ["hero_lead", "Hero lead text"],
              ["hero_accent", "Hero colorful word"],
              ["hero_cta", "Button text (Hire me)"],
              ["email", "Public email (shown on site)"],
              ["notify_email", "Inquiry emails sent to (leave blank = public email)"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["social_instagram", "Instagram URL"],
              ["social_youtube", "YouTube URL"],
              ["social_vimeo", "Vimeo URL"],
              ["social_whatsapp", "WhatsApp link (wa.me/...)"],
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
          <Field label="About page — title">
            <input style={inputStyle} value={settings.about_title || ""} onChange={(e) => setSettings((s) => ({ ...s, about_title: e.target.value }))} />
          </Field>
          <Field label="About page — text">
            <textarea rows={5} style={{ ...inputStyle, resize: "vertical" }} value={settings.about_body || ""} onChange={(e) => setSettings((s) => ({ ...s, about_body: e.target.value }))} />
          </Field>
          <Field label="Contact page — title">
            <input style={inputStyle} value={settings.contact_title || ""} onChange={(e) => setSettings((s) => ({ ...s, contact_title: e.target.value }))} />
          </Field>
          <Field label="Contact page — intro text">
            <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={settings.contact_body || ""} onChange={(e) => setSettings((s) => ({ ...s, contact_body: e.target.value }))} />
          </Field>
          <Field label="WhatsApp pre-filled message">
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={settings.whatsapp_message || ""} onChange={(e) => setSettings((s) => ({ ...s, whatsapp_message: e.target.value }))} placeholder="Hi! I would like to discuss a video project." />
          </Field>
          <Field label="Footer note">
            <textarea rows={2} style={{ ...inputStyle, resize: "vertical" }} value={settings.footer_note || ""} onChange={(e) => setSettings((s) => ({ ...s, footer_note: e.target.value }))} />
          </Field>
          <button type="button" style={btnPrimary} onClick={saveSettings}>Save website text</button>
        </div>
      )}

      {tab === "thumbnails" && (
        <CrudBlock
          items={thumbnails}
          empty="No thumbnails yet — add images for the homepage reel."
          onAdd={() => setEditing({
            title: "", thumbnail_url: "", category: "Gallery",
            sort_order: 0, status: "published",
          })}
          onEdit={setEditing}
          onDelete={async (item) => {
            if (!confirm("Delete this thumbnail?")) return;
            await cms(`thumbnails/${item.id}`, { method: "DELETE" });
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {item.thumbnail_url && (
                  <img src={item.thumbnail_url} alt="" style={{ width: 64, height: 36, objectFit: "cover", borderRadius: 6 }} />
                )}
                <div>
                  <strong>{item.title}</strong>
                  <div style={{ color: "#c4b0d8", fontSize: 12, marginTop: 4 }}>
                    {item.category || "—"} · {item.status}
                  </div>
                </div>
              </div>
            </>
          )}
          form={editing && tab === "thumbnails" ? (
            <ThumbnailForm form={editing} setForm={setEditing} onSave={() => saveThumbnail(editing)} onCancel={() => setEditing(null)} />
          ) : null}
        />
      )}

      {tab === "team" && (
        <CrudBlock
          items={team}
          empty="No team members yet — add your team for the About page."
          onAdd={() => setEditing({
            name: "", role: "", bio: "", photo_url: "", social_url: "",
            sort_order: 0, status: "published",
          })}
          onEdit={setEditing}
          onDelete={async (item) => {
            if (!confirm("Delete this team member?")) return;
            await cms(`team/${item.id}`, { method: "DELETE" });
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {item.photo_url && (
                  <img src={item.photo_url} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: "50%" }} />
                )}
                <div>
                  <strong>{item.name}</strong>
                  <div style={{ color: "#c4b0d8", fontSize: 12, marginTop: 4 }}>
                    {item.role || "—"} · {item.status}
                  </div>
                </div>
              </div>
            </>
          )}
          form={editing && tab === "team" ? (
            <TeamForm form={editing} setForm={setEditing} onSave={() => saveTeamMember(editing)} onCancel={() => setEditing(null)} />
          ) : null}
        />
      )}

      {tab === "portfolio" && (
        <CrudBlock
          items={portfolio}
          empty="No portfolio projects yet."
          onAdd={() => setEditing({
            title: "", slug: "", description: "", category: "YouTube",
            video_source: "youtube", video_url: "", thumbnail_url: "", client_name: "", featured: true,
            sort_order: 0, status: "published",
          })}
          onEdit={(item) => setEditing({
            ...item,
            video_source: isYoutubeUrl(item.video_url) || !item.video_url?.startsWith("/api/media/")
              ? "youtube" : "upload",
          })}
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

function ThumbnailForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 12, fontSize: 17 }}>{form.id ? "Edit thumbnail" : "New thumbnail"}</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
        Homepage gallery — <strong>image only</strong> (upload file or paste URL).
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input style={inputStyle} value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Category">
          <input style={inputStyle} value={form.category || ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        </Field>
        <Field label="Sort order">
          <input style={inputStyle} value={form.sort_order ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
        </Field>
        <Field label="Status">
          <input style={inputStyle} value={form.status || "published"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </Field>
      </div>
      <MediaUpload
        label="Thumbnail image"
        accept="image/jpeg,image/png,image/webp,image/gif"
        value={form.thumbnail_url}
        onChange={(url) => setForm((f) => ({ ...f, thumbnail_url: url }))}
        hint="Upload from computer or paste image URL"
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function TeamForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 12, fontSize: 17 }}>{form.id ? "Edit team member" : "New team member"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Name">
          <input style={inputStyle} value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="Role">
          <input style={inputStyle} value={form.role || ""} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
        </Field>
        <Field label="Social URL">
          <input style={inputStyle} value={form.social_url || ""} onChange={(e) => setForm((f) => ({ ...f, social_url: e.target.value }))} />
        </Field>
        <Field label="Sort order">
          <input style={inputStyle} value={form.sort_order ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
        </Field>
        <Field label="Status">
          <input style={inputStyle} value={form.status || "published"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </Field>
      </div>
      <Field label="Bio">
        <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.bio || ""} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
      </Field>
      <MediaUpload
        label="Photo"
        accept="image/jpeg,image/png,image/webp,image/gif"
        value={form.photo_url}
        onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function PortfolioForm({ form, setForm, onSave, onCancel }) {
  const source = form.video_source || "youtube";
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 12, fontSize: 17 }}>{form.id ? "Edit work" : "New work item"}</h3>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>
        <strong>My Work</strong> — video projects with YouTube link or uploaded video file.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input style={inputStyle} value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="URL slug (optional)">
          <input style={inputStyle} value={form.slug || ""} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </Field>
        <Field label="Category">
          <input style={inputStyle} value={form.category || ""} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        </Field>
        <Field label="Client name">
          <input style={inputStyle} value={form.client_name || ""} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
        </Field>
        <Field label="Sort order">
          <input style={inputStyle} value={form.sort_order ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
        </Field>
        <Field label="Status">
          <input style={inputStyle} value={form.status || "published"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </Field>
      </div>
      <Field label="Description">
        <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </Field>

      <Field label="Video source">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            ["youtube", "YouTube / Vimeo link"],
            ["upload", "Upload video file"],
          ].map(([val, lab]) => (
            <label key={val} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13, cursor: "pointer" }}>
              <input
                type="radio"
                name="video_source"
                checked={source === val}
                onChange={() => setForm((f) => ({ ...f, video_source: val, video_url: val === "youtube" ? f.video_url : "" }))}
              />
              {lab}
            </label>
          ))}
        </div>
      </Field>

      {source === "youtube" ? (
        <Field label="YouTube or Vimeo URL">
          <input
            style={inputStyle}
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.video_url || ""}
            onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
          />
        </Field>
      ) : (
        <MediaUpload
          label="Video file"
          accept="video/mp4,video/webm,video/quicktime"
          value={form.video_url?.startsWith("/api/media/") ? form.video_url : ""}
          onChange={(url) => setForm((f) => ({ ...f, video_url: url }))}
          hint="Upload MP4 or WebM (max 100MB)"
          previewType="video"
        />
      )}

      <MediaUpload
        label="Cover / thumbnail image"
        accept="image/jpeg,image/png,image/webp,image/gif"
        value={form.thumbnail_url}
        onChange={(url) => setForm((f) => ({ ...f, thumbnail_url: url }))}
      />

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
