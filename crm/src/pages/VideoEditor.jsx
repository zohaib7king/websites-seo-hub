import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

const SITE_ID = "site-007-video-editor";

const TABS = [
  { id: "settings", label: "Site settings" },
  { id: "portfolio", label: "Portfolio" },
  { id: "services", label: "Services" },
  { id: "testimonials", label: "Testimonials" },
  { id: "inquiries", label: "Inquiries" },
];

const inputStyle = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: "10px 12px", color: "var(--text)", fontSize: 13,
};
const labelStyle = { display: "block", color: "var(--muted)", fontSize: 11, fontWeight: 600, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" };
const btnPrimary = {
  background: "var(--grad-accent)", color: "#fff", border: "none", borderRadius: 999,
  padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "var(--glow)",
};
const btnGhost = {
  background: "transparent", color: "var(--muted)", border: "1px solid var(--border)",
  borderRadius: 999, padding: "8px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer",
};
const btnDanger = {
  background: "rgba(239,68,68,0.12)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.35)",
  borderRadius: 999, padding: "8px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer",
};
const card = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20,
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Empty({ children }) {
  return <div style={{ color: "var(--muted)", padding: 24, textAlign: "center" }}>{children}</div>;
}

export default function VideoEditor() {
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
    try {
      const [s, p, sv, t, i] = await Promise.all([
        api.editorGetSettings(SITE_ID),
        api.editorGetPortfolio(SITE_ID),
        api.editorGetServices(SITE_ID),
        api.editorGetTestimonials(SITE_ID),
        api.editorGetInquiries(SITE_ID),
      ]);
      setSettings(s || {
        brand_name: "ibtihajForage", tagline: "", eyebrow: "", hero_lead: "", hero_accent: "",
        hero_cta: "Hire me", about_title: "", about_body: "", email: "", phone: "", location: "",
        social_instagram: "", social_youtube: "", social_vimeo: "", social_whatsapp: "", footer_note: "",
      });
      setPortfolio(p);
      setServices(sv);
      setTestimonials(t);
      setInquiries(i);
    } catch (e) {
      flash(e.message || "Failed to load", true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveSettings() {
    try {
      const saved = await api.editorSaveSettings(SITE_ID, settings);
      setSettings(saved);
      flash("Settings saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function savePortfolio(form) {
    try {
      if (form.id) {
        await api.editorUpdatePortfolio(SITE_ID, form.id, form);
      } else {
        await api.editorCreatePortfolio(SITE_ID, form);
      }
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
      if (form.id) await api.editorUpdateService(SITE_ID, form.id, payload);
      else await api.editorCreateService(SITE_ID, payload);
      setEditing(null);
      await load();
      flash("Service saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  async function saveTestimonial(form) {
    try {
      if (form.id) await api.editorUpdateTestimonial(SITE_ID, form.id, form);
      else await api.editorCreateTestimonial(SITE_ID, form);
      setEditing(null);
      await load();
      flash("Testimonial saved");
    } catch (e) {
      flash(e.message, true);
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Video Editor Site</h1>
          <p style={{ color: "var(--muted)", marginTop: 4 }}>
            Manage ibtihajForage pages — settings, portfolio, services, testimonials, and hire inquiries.
          </p>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12, alignSelf: "center" }}>site-007-video-editor · port 3008</div>
      </div>

      {(msg || err) && (
        <div style={{
          marginBottom: 16, padding: "10px 14px", borderRadius: "var(--radius)",
          background: err ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.12)",
          color: err ? "var(--danger)" : "var(--success)", fontSize: 13, fontWeight: 600,
        }}>
          {err || msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setEditing(null); }}
            style={{
              ...btnGhost,
              color: tab === t.id ? "#fff" : "var(--muted)",
              background: tab === t.id ? "var(--grad-accent)" : "transparent",
              borderColor: tab === t.id ? "transparent" : "var(--border)",
            }}
          >
            {t.label}
            {t.id === "inquiries" && inquiries.filter((i) => i.status === "new").length > 0
              ? ` (${inquiries.filter((i) => i.status === "new").length})`
              : ""}
          </button>
        ))}
      </div>

      {tab === "settings" && settings && (
        <div style={card}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              ["brand_name", "Brand name"],
              ["eyebrow", "Top bar / eyebrow"],
              ["hero_lead", "Hero lead"],
              ["hero_accent", "Hero accent word"],
              ["hero_cta", "Hero CTA button"],
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
            <textarea
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              value={settings.tagline || ""}
              onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
            />
          </Field>
          <Field label="About title">
            <input
              style={inputStyle}
              value={settings.about_title || ""}
              onChange={(e) => setSettings((s) => ({ ...s, about_title: e.target.value }))}
            />
          </Field>
          <Field label="About body">
            <textarea
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
              value={settings.about_body || ""}
              onChange={(e) => setSettings((s) => ({ ...s, about_body: e.target.value }))}
            />
          </Field>
          <Field label="Footer note">
            <textarea
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
              value={settings.footer_note || ""}
              onChange={(e) => setSettings((s) => ({ ...s, footer_note: e.target.value }))}
            />
          </Field>
          <button type="button" onClick={saveSettings} style={btnPrimary}>Save settings</button>
        </div>
      )}

      {tab === "portfolio" && (
        <CrudList
          items={portfolio}
          empty="No portfolio items yet."
          onAdd={() => setEditing({
            title: "", slug: "", description: "", category: "YouTube",
            video_url: "", thumbnail_url: "", client_name: "", featured: false,
            sort_order: 0, status: "published",
          })}
          onEdit={setEditing}
          onDelete={async (item) => {
            if (!confirm("Delete this project?")) return;
            await api.editorDeletePortfolio(SITE_ID, item.id);
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <strong>{item.title}</strong>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                {item.category} · {item.status}{item.featured ? " · featured" : ""}
              </div>
            </>
          )}
          form={editing && tab === "portfolio" ? (
            <PortfolioForm
              form={editing}
              setForm={setEditing}
              onSave={() => savePortfolio(editing)}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        />
      )}

      {tab === "services" && (
        <CrudList
          items={services}
          empty="No services yet."
          onAdd={() => setEditing({
            title: "", description: "", price_label: "", features: "",
            sort_order: 0, status: "published",
          })}
          onEdit={(item) => setEditing({
            ...item,
            features: Array.isArray(item.features) ? item.features.join("\n") : (item.features || ""),
          })}
          onDelete={async (item) => {
            if (!confirm("Delete this service?")) return;
            await api.editorDeleteService(SITE_ID, item.id);
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <strong>{item.title}</strong>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                {item.price_label || "No price"} · {item.status}
              </div>
            </>
          )}
          form={editing && tab === "services" ? (
            <ServiceForm
              form={editing}
              setForm={setEditing}
              onSave={() => saveService(editing)}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        />
      )}

      {tab === "testimonials" && (
        <CrudList
          items={testimonials}
          empty="No testimonials yet."
          onAdd={() => setEditing({
            client_name: "", client_role: "", quote: "", rating: 5,
            avatar_url: "", sort_order: 0, status: "published",
          })}
          onEdit={setEditing}
          onDelete={async (item) => {
            if (!confirm("Delete this testimonial?")) return;
            await api.editorDeleteTestimonial(SITE_ID, item.id);
            await load();
            flash("Deleted");
          }}
          renderRow={(item) => (
            <>
              <strong>{item.client_name}</strong>
              <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                {item.client_role} · {"★".repeat(item.rating || 5)}
              </div>
            </>
          )}
          form={editing && tab === "testimonials" ? (
            <TestimonialForm
              form={editing}
              setForm={setEditing}
              onSave={() => saveTestimonial(editing)}
              onCancel={() => setEditing(null)}
            />
          ) : null}
        />
      )}

      {tab === "inquiries" && (
        <div style={card}>
          {inquiries.length === 0 ? (
            <Empty>No hire inquiries yet. They appear when someone submits the contact form.</Empty>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {inquiries.map((item) => (
                <div key={item.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>{item.name}</strong>
                      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                        {item.email}{item.phone ? ` · ${item.phone}` : ""} · {item.project_type || "General"}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999,
                      background: item.status === "new" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.12)",
                      color: item.status === "new" ? "var(--warning)" : "var(--success)",
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>{item.message}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    {item.status === "new" && (
                      <button
                        type="button"
                        style={btnGhost}
                        onClick={async () => {
                          await api.editorUpdateInquiry(SITE_ID, item.id, { status: "read" });
                          await load();
                        }}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      style={btnGhost}
                      onClick={async () => {
                        await api.editorUpdateInquiry(SITE_ID, item.id, { status: "replied" });
                        await load();
                      }}
                    >
                      Mark replied
                    </button>
                    <button
                      type="button"
                      style={btnDanger}
                      onClick={async () => {
                        if (!confirm("Delete inquiry?")) return;
                        await api.editorDeleteInquiry(SITE_ID, item.id);
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CrudList({ items, empty, onAdd, onEdit, onDelete, renderRow, form }) {
  return (
    <div>
      {form}
      <div style={{ ...card, marginTop: form ? 16 : 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ color: "var(--muted)", fontSize: 13 }}>{items.length} items</div>
          <button type="button" style={btnPrimary} onClick={onAdd}>Add new</button>
        </div>
        {items.length === 0 ? <Empty>{empty}</Empty> : (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((item) => (
              <div key={item.id} style={{
                display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center",
                border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px",
              }}>
                <div style={{ minWidth: 0 }}>{renderRow(item)}</div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button type="button" style={btnGhost} onClick={() => onEdit(item)}>Edit</button>
                  <button type="button" style={btnDanger} onClick={() => onDelete(item)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 14, fontSize: 16 }}>{form.id ? "Edit project" : "New project"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          ["title", "Title"],
          ["slug", "Slug (optional)"],
          ["category", "Category"],
          ["client_name", "Client"],
          ["video_url", "Video URL (YouTube/Vimeo)"],
          ["thumbnail_url", "Thumbnail URL"],
          ["sort_order", "Sort order"],
          ["status", "Status (published/draft)"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <input
              style={inputStyle}
              value={form[key] ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            />
          </Field>
        ))}
      </div>
      <Field label="Description">
        <textarea
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
          value={form.description || ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
      </Field>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={!!form.featured}
          onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
        />
        Featured on homepage
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
      <h3 style={{ marginBottom: 14, fontSize: 16 }}>{form.id ? "Edit service" : "New service"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Title">
          <input style={inputStyle} value={form.title || ""} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </Field>
        <Field label="Price label">
          <input style={inputStyle} value={form.price_label || ""} onChange={(e) => setForm((f) => ({ ...f, price_label: e.target.value }))} />
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
      <Field label="Features (one per line)">
        <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.features || ""} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function TestimonialForm({ form, setForm, onSave, onCancel }) {
  return (
    <div style={card}>
      <h3 style={{ marginBottom: 14, fontSize: 16 }}>{form.id ? "Edit testimonial" : "New testimonial"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Client name">
          <input style={inputStyle} value={form.client_name || ""} onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))} />
        </Field>
        <Field label="Role">
          <input style={inputStyle} value={form.client_role || ""} onChange={(e) => setForm((f) => ({ ...f, client_role: e.target.value }))} />
        </Field>
        <Field label="Rating (1-5)">
          <input style={inputStyle} value={form.rating ?? 5} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} />
        </Field>
        <Field label="Avatar URL">
          <input style={inputStyle} value={form.avatar_url || ""} onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))} />
        </Field>
        <Field label="Sort order">
          <input style={inputStyle} value={form.sort_order ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
        </Field>
        <Field label="Status">
          <input style={inputStyle} value={form.status || "published"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        </Field>
      </div>
      <Field label="Quote">
        <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.quote || ""} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={btnPrimary} onClick={onSave}>Save</button>
        <button type="button" style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
