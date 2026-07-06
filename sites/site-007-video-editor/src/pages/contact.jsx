import { useState } from "react";
import Layout from "../components/Layout.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import { getEditorBundle, getSite } from "../lib/data";
import { SITE } from "../site.config";
import { whatsappLink } from "../lib/whatsapp";

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
  width: "100%", background: "#fff", border: "1px solid var(--border)",
  borderRadius: 8, padding: "12px 14px", color: "var(--text)", fontSize: 14,
};

export default function Contact({ theme, brand }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", project_type: "YouTube", message: "",
  });
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });
  const waHref = whatsappLink(brand.social?.whatsapp, brand.whatsappMessage);

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ loading: false, ok: false, error: "Name, email, and message are required." });
      return;
    }
    setStatus({ loading: true, ok: false, error: "" });
    try {
      const res = await fetch("/api/inquiries", {
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
      title="Contact"
      description={brand.contactBody}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/contact`}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, paddingTop: 24 }} className="hero-grid">
        <ScrollReveal>
          <p className="pro-eyebrow" style={{ marginBottom: 10 }}>Contact us</p>
          <h1 style={{ fontSize: "clamp(32px,4vw,44px)", fontWeight: 800, marginBottom: 14, lineHeight: 1.15 }}>
            {brand.contactTitle || "Get in touch"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.75, marginBottom: 24, whiteSpace: "pre-wrap" }}>
            {brand.contactBody}
          </p>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: 22, boxShadow: "var(--shadow)",
          }}>
            <div style={{ marginBottom: 14 }}>
              <div className="pro-eyebrow" style={{ marginBottom: 4 }}>Email</div>
              <a href={`mailto:${brand.email}`} style={{ fontWeight: 700, color: "var(--accent)" }}>{brand.email}</a>
            </div>
            {brand.phone && (
              <div style={{ marginBottom: 14 }}>
                <div className="pro-eyebrow" style={{ marginBottom: 4 }}>Phone</div>
                <div style={{ fontWeight: 700 }}>{brand.phone}</div>
              </div>
            )}
            <div style={{ marginBottom: 18 }}>
              <div className="pro-eyebrow" style={{ marginBottom: 4 }}>Location</div>
              <div style={{ fontWeight: 700 }}>{brand.location}</div>
            </div>
            {waHref && (
              <a href={waHref} target="_blank" rel="noreferrer" className="sw-btn" style={{
                display: "inline-flex", background: "#25D366", color: "#fff", borderColor: "#25D366",
              }}>
                💬 Message on WhatsApp
              </a>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius)", padding: 24, boxShadow: "var(--shadow)",
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Send an inquiry</h2>
            {[
              ["name", "Your name", "text"],
              ["email", "Email", "email"],
              ["phone", "Phone (optional)", "text"],
            ].map(([key, label, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>{label}</label>
                <input
                  type={type}
                  style={fieldStyle}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>Project type</label>
              <select style={fieldStyle} value={form.project_type} onChange={(e) => setForm((f) => ({ ...f, project_type: e.target.value }))}>
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
            {status.ok && (
              <p style={{ color: "var(--accent)", fontWeight: 700, marginBottom: 12 }}>
                Inquiry sent! We will email you back soon.
              </p>
            )}
            {status.error && <p style={{ color: "#dc2626", fontWeight: 700, marginBottom: 12 }}>{status.error}</p>}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="sw-btn sw-btn-primary"
                disabled={status.loading}
                onClick={submit}
                style={{ flex: 1, minWidth: 140, opacity: status.loading ? 0.7 : 1 }}
              >
                {status.loading ? "Sending…" : "Send inquiry"}
              </button>
              {waHref && (
                <a href={waHref} target="_blank" rel="noreferrer" className="sw-btn sw-btn-ghost" style={{ flex: 1, minWidth: 140, textAlign: "center" }}>
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </Layout>
  );
}
