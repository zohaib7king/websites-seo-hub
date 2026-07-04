import { useState } from "react";
import Layout from "../components/Layout.jsx";
import { getEditorBundle, getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, bundle] = await Promise.all([getSite(), getEditorBundle()]);
  return {
    props: {
      theme: site?.theme || SITE.defaultTheme,
      brand: bundle.brand,
    },
  };
}

const fieldStyle = {
  width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
  borderRadius: 12, padding: "12px 14px", color: "var(--text)", fontSize: 14,
};

export default function Contact({ theme, brand }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", project_type: "YouTube", message: "",
  });
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });

  async function submit() {
    setStatus({ loading: true, ok: false, error: "" });
    try {
      const res = await fetch(`/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Failed to send");
      setStatus({ loading: false, ok: true, error: "" });
      setForm({ name: "", email: "", phone: "", project_type: "YouTube", message: "" });
    } catch (err) {
      setStatus({ loading: false, ok: false, error: err.message || "Failed to send" });
    }
  }

  return (
    <Layout
      title="Hire me"
      description={`Contact ${brand.name} for freelance video editing.`}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/contact`}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="hero-split">
        <div>
          <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", marginBottom: 10 }}>
            Let&apos;s edit your next video
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
            Tell me about the project, deadline, and style. I usually reply within 24 hours.
          </p>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 22 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Email</div>
              <a href={`mailto:${brand.email}`} style={{ fontWeight: 800, color: "var(--accent)" }}>{brand.email}</a>
            </div>
            {brand.phone && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Phone</div>
                <div style={{ fontWeight: 800 }}>{brand.phone}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Location</div>
              <div style={{ fontWeight: 800 }}>{brand.location}</div>
            </div>
            {brand.social?.whatsapp && (
              <a href={brand.social.whatsapp} target="_blank" rel="noreferrer" className="ff-btn ff-btn-soft" style={{ marginTop: 18, display: "inline-flex" }}>
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
          {[
            ["name", "Your name"],
            ["email", "Email"],
            ["phone", "Phone (optional)"],
          ].map(([key, label]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>{label}</label>
              <input
                style={fieldStyle}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Project type</label>
            <select
              style={fieldStyle}
              value={form.project_type}
              onChange={(e) => setForm((f) => ({ ...f, project_type: e.target.value }))}
            >
              {["YouTube", "Reels / Shorts", "Wedding", "Brand / Ads", "Event", "Other"].map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Project details</label>
            <textarea
              rows={5}
              style={{ ...fieldStyle, resize: "vertical" }}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Footage type, length, deadline, references…"
            />
          </div>
          {status.ok && <p style={{ color: "var(--accent2)", fontWeight: 700, marginBottom: 12 }}>Message sent — I will get back to you soon.</p>}
          {status.error && <p style={{ color: "#f87171", fontWeight: 700, marginBottom: 12 }}>{status.error}</p>}
          <button
            type="button"
            className="ff-btn ff-btn-primary"
            disabled={status.loading}
            onClick={submit}
            style={{ width: "100%", opacity: status.loading ? 0.7 : 1 }}
          >
            {status.loading ? "Sending…" : "Send inquiry"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
