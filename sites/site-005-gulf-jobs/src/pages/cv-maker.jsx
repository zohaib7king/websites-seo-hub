import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import { getSite } from "../lib/data";
import { getAuth, requireLogin } from "../lib/authClient";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "royal" } };
}

const templates = {
  modern: { label: "Modern Gulf", accent: "#6d28d9", sidebar: false, tier: "free" },
  executive: { label: "Executive", accent: "#1e1b4b", sidebar: true, tier: "free" },
  clean: { label: "Clean ATS", accent: "#0ea5e9", sidebar: false, tier: "free" },
  premium: { label: "Premium Pro", accent: "#be123c", sidebar: true, tier: "paid" },
  corporate: { label: "Corporate", accent: "#0f766e", sidebar: false, tier: "paid" },
  hospitality: { label: "Hospitality", accent: "#c2410c", sidebar: true, tier: "paid" },
  technical: { label: "Technical", accent: "#2563eb", sidebar: false, tier: "paid" },
  leadership: { label: "Leadership", accent: "#7c2d12", sidebar: true, tier: "paid" },
};

const initialCv = {
  name: "Muhammad Ali",
  title: "Sales Executive",
  phone: "+971 50 000 0000",
  email: "name@email.com",
  location: "Dubai, UAE",
  linkedin: "linkedin.com/in/yourname",
  summary: "Results-driven professional with experience in customer service, sales operations and team coordination. Seeking a Gulf role where I can support business growth, communicate clearly and deliver reliable daily execution.",
  skills: "Customer service\nSales coordination\nMS Office\nCRM systems\nEnglish communication\nTeam support",
  experience: "Sales Executive - ABC Trading, Dubai\nJan 2023 - Present\n- Managed daily customer inquiries and prepared quotations.\n- Coordinated with operations teams to improve order follow-up.\n- Maintained accurate customer records in CRM.\n\nCustomer Service Officer - XYZ Services\nMar 2020 - Dec 2022\n- Resolved customer issues by phone, email and walk-in support.\n- Prepared weekly service reports for management.",
  education: "Bachelor of Commerce - University Name\n2019",
  languages: "English - Professional\nArabic - Basic\nUrdu/Hindi - Native",
  certifications: "UAE driving license\nMS Office Certificate",
};

function Field({ label, value, onChange, multiline = false, placeholder }) {
  const common = {
    value,
    onChange: (event) => onChange(event.target.value),
    placeholder,
    style: {
      width: "100%", border: "1px solid var(--border)", borderRadius: 14,
      padding: "12px 14px", font: "inherit", color: "var(--text)", background: "#fff",
      outlineColor: "var(--accent)",
    },
  };

  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 7 }}>{label}</span>
      {multiline ? <textarea {...common} rows={5} /> : <input {...common} />}
    </label>
  );
}

function Lines({ text }) {
  return String(text || "")
    .split("\n")
    .filter(Boolean)
    .map((line, index) => <div className="cv-line" key={`${line}-${index}`}>{line}</div>);
}

function Section({ title, children }) {
  return (
    <section className="cv-section" style={{ marginTop: 22 }}>
      <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".12em", color: "inherit", borderBottom: "1px solid rgba(148,163,184,.35)", paddingBottom: 6, marginBottom: 10 }}>{title}</h3>
      <div className="cv-section-content" style={{ fontSize: 13.5, lineHeight: 1.65 }}>{children}</div>
    </section>
  );
}

function Watermark({ show }) {
  if (!show) return null;
  return (
    <div className="cv-watermark" style={{
      position: "absolute",
      right: 18,
      bottom: 12,
      color: "rgba(15,23,42,.35)",
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: ".08em",
      textTransform: "uppercase",
      transform: "rotate(-90deg)",
      transformOrigin: "right bottom",
      pointerEvents: "none",
    }}>
      Created with {SITE.domain}
    </div>
  );
}

function CvPreview({ cv, template, showWatermark }) {
  const config = templates[template] || templates.modern;
  const skillList = String(cv.skills || "").split("\n").filter(Boolean);
  const content = (
    <>
      <div className="cv-header" style={{ borderBottom: `4px solid ${config.accent}`, paddingBottom: 18, marginBottom: 20 }}>
        <h2 style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: "-0.04em", color: "#111827", marginBottom: 6 }}>{cv.name}</h2>
        <div style={{ fontSize: 16, color: config.accent, fontWeight: 800, marginBottom: 10 }}>{cv.title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", color: "#475569", fontSize: 12.5 }}>
          <span>{cv.phone}</span><span>{cv.email}</span><span>{cv.location}</span><span>{cv.linkedin}</span>
        </div>
      </div>
      <Section title="Professional Summary">{cv.summary}</Section>
      <Section title="Core Skills">
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {skillList.map(skill => (
            <span key={skill} style={{ border: `1px solid ${config.accent}33`, background: `${config.accent}10`, color: "#1f2937", borderRadius: 999, padding: "4px 9px" }}>{skill}</span>
          ))}
        </div>
      </Section>
      <Section title="Experience"><Lines text={cv.experience} /></Section>
      <Section title="Education"><Lines text={cv.education} /></Section>
      <Section title="Languages"><Lines text={cv.languages} /></Section>
      <Section title="Certifications"><Lines text={cv.certifications} /></Section>
    </>
  );

  if (config.sidebar) {
    return (
      <div id="cv-preview" className="cv-preview cv-preview-sidebar" style={{ position: "relative", background: "#fff", color: "#111827", minHeight: 980, boxShadow: "0 25px 70px rgba(15,23,42,.14)", borderRadius: 18, overflow: "hidden", display: "grid", gridTemplateColumns: "230px 1fr" }}>
        <aside style={{ background: config.accent, color: "#fff", padding: 24 }}>
          <h2 style={{ fontSize: 27, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 10 }}>{cv.name}</h2>
          <p style={{ opacity: .9, fontWeight: 800, marginBottom: 24 }}>{cv.title}</p>
          <Section title="Contact">
            <Lines text={`${cv.phone}\n${cv.email}\n${cv.location}\n${cv.linkedin}`} />
          </Section>
          <Section title="Skills"><Lines text={cv.skills} /></Section>
          <Section title="Languages"><Lines text={cv.languages} /></Section>
        </aside>
        <div style={{ padding: 30 }}>
          <Section title="Professional Summary">{cv.summary}</Section>
          <Section title="Experience"><Lines text={cv.experience} /></Section>
          <Section title="Education"><Lines text={cv.education} /></Section>
          <Section title="Certifications"><Lines text={cv.certifications} /></Section>
        </div>
        <Watermark show={showWatermark} />
      </div>
    );
  }

  return (
    <div id="cv-preview" className="cv-preview" style={{ position: "relative", background: "#fff", color: "#111827", minHeight: 980, boxShadow: "0 25px 70px rgba(15,23,42,.14)", borderRadius: 18, padding: 34 }}>
      {content}
      <Watermark show={showWatermark} />
    </div>
  );
}

function AccessModal({ mode, templateLabel, onClose, onLogin, onSignup, onPayment }) {
  if (!mode) return null;
  const isPayment = mode === "payment";

  return (
    <div className="no-print" style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(15,23,42,.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 30px 90px rgba(15,23,42,.28)" }}>
        <button
          type="button"
          onClick={onClose}
          style={{ float: "right", border: "1px solid var(--border)", background: "#fff", borderRadius: 999, width: 32, height: 32, cursor: "pointer", color: "var(--muted)", fontWeight: 900 }}
        >
          x
        </button>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
          {isPayment ? "Payment required" : "Account required"}
        </span>
        <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 10px" }}>
          {isPayment ? `Unlock ${templateLabel}` : "Login or sign up to download"}
        </h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.75, marginBottom: 18 }}>
          {isPayment
            ? "This is a paid CV template. Complete payment first, then the download button will be enabled."
            : "Downloads are available after a quick login or signup. Free templates include a small site watermark."}
        </p>

        {!isPayment && (
          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            <input placeholder="Email address" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
            <input placeholder="Password" type="password" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "12px 14px", font: "inherit" }} />
          </div>
        )}

        {isPayment && (
          <div style={{ border: "1px solid var(--border)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, marginBottom: 8 }}>
              <span>{templateLabel}</span>
              <span>$4.99</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
              Demo payment flow. Connect this button to Stripe, PayPal, or your payment gateway before production.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isPayment ? (
            <button type="button" onClick={onPayment} className="career-btn career-btn-primary">Mark Payment Complete</button>
          ) : (
            <>
              <button type="button" onClick={onLogin} className="career-btn career-btn-primary">Login</button>
              <button type="button" onClick={onSignup} className="career-btn career-btn-soft">Create Account</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CvMaker({ theme }) {
  const [cv, setCv] = useState(initialCv);
  const [template, setTemplate] = useState("modern");
  const [auth, setAuth] = useState(null);
  const [paidAccess, setPaidAccess] = useState({});
  const [modal, setModal] = useState(null);
  const selectedTemplate = templates[template] || templates.modern;
  const isPaidTemplate = selectedTemplate.tier === "paid";
  const hasPaidAccess = Boolean(paidAccess[template]);
  const isAuthenticated = Boolean(auth?.token);
  const canDownload = isAuthenticated && (!isPaidTemplate || hasPaidAccess);
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Gulf Jobs CV Maker",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `https://${SITE.domain}/cv-maker`,
    description: "Create a printable Gulf job CV with professional templates.",
  }), []);

  const update = (key) => (value) => setCv(current => ({ ...current, [key]: value }));
  const closeModal = () => setModal(null);
  const finishPayment = () => {
    setPaidAccess(current => ({ ...current, [template]: true }));
    setModal(null);
  };
  const downloadCv = () => {
    if (!isAuthenticated) {
      requireLogin();
      return;
    }
    if (isPaidTemplate && !hasPaidAccess) {
      setModal("payment");
      return;
    }
    window.print();
  };

  useEffect(() => {
    const refresh = () => setAuth(getAuth());
    refresh();
    window.addEventListener("gulf-auth-changed", refresh);
    return () => window.removeEventListener("gulf-auth-changed", refresh);
  }, []);

  return (
    <Layout
      title="Free Gulf CV Maker"
      description="Create a professional Gulf job CV online with modern, executive and ATS-friendly templates. Fill details, preview and print as PDF."
      theme={theme}
      canonical={`https://${SITE.domain}/cv-maker`}
      schema={schema}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .cv-preview{overflow-wrap:anywhere;word-break:break-word;}
        .cv-section-content{overflow-wrap:anywhere;word-break:break-word;}
        .cv-line{min-height:1.2em;}
        @media(max-width:980px){.cv-grid{grid-template-columns:1fr !important;}.cv-preview-wrap{position:static !important;}}
        @page{size:A4;margin:12mm;}
        @media print{
          html,body{background:#fff !important;}
          #__next{background:#fff !important;}
          .cv-preview,.cv-preview *{
            -webkit-print-color-adjust:exact !important;
            print-color-adjust:exact !important;
            color-adjust:exact !important;
          }
          .cv-print-shell{display:block !important;width:100% !important;margin:0 !important;padding:0 !important;}
          #cv-preview{
            box-shadow:none !important;
            border-radius:18px !important;
            min-height:auto !important;
            width:186mm !important;
            max-width:186mm !important;
            margin:0 auto !important;
            overflow:visible !important;
            break-inside:auto !important;
            page-break-inside:auto !important;
          }
          .cv-section{
            break-inside:auto;
            page-break-inside:auto;
          }
          .cv-section h3{
            break-after:avoid;
            page-break-after:avoid;
          }
          .cv-line{
            break-inside:avoid;
            page-break-inside:avoid;
          }
          .cv-watermark{position:fixed !important;right:6mm !important;bottom:8mm !important;}
        }
      `}} />

      <section className="no-print" style={{ textAlign: "center", maxWidth: 820, margin: "0 auto 30px" }}>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Free CV Builder</span>
        <h1 className="hero-title" style={{ fontSize: 46, lineHeight: 1.08, letterSpacing: "-0.05em", fontWeight: 950, margin: "8px 0 12px" }}>Create a Gulf-ready CV in minutes</h1>
        <p style={{ color: "var(--muted)", fontSize: 17 }}>Choose a professional template, add your details, then use your browser print option to save as PDF.</p>
      </section>

      <div className="cv-grid" style={{ display: "grid", gridTemplateColumns: "430px 1fr", gap: 26, alignItems: "start" }}>
        <div className="no-print glass-panel" style={{ borderRadius: 24, padding: 22 }}>
          <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 16 }}>Your Details</h2>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Full Name" value={cv.name} onChange={update("name")} />
            <Field label="Target Job Title" value={cv.title} onChange={update("title")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Phone" value={cv.phone} onChange={update("phone")} />
              <Field label="Email" value={cv.email} onChange={update("email")} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Location" value={cv.location} onChange={update("location")} />
              <Field label="LinkedIn" value={cv.linkedin} onChange={update("linkedin")} />
            </div>
            <Field label="Professional Summary" value={cv.summary} onChange={update("summary")} multiline />
            <Field label="Skills, one per line" value={cv.skills} onChange={update("skills")} multiline />
            <Field label="Experience" value={cv.experience} onChange={update("experience")} multiline />
            <Field label="Education" value={cv.education} onChange={update("education")} multiline />
            <Field label="Languages" value={cv.languages} onChange={update("languages")} multiline />
            <Field label="Certifications" value={cv.certifications} onChange={update("certifications")} multiline />
          </div>
        </div>

        <div className="cv-preview-wrap" style={{ position: "sticky", top: 90 }}>
          <div className="no-print" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(templates).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  style={{
                    border: `1px solid ${template === key ? item.accent : "var(--border)"}`,
                    background: template === key ? `${item.accent}12` : "#fff",
                    color: template === key ? item.accent : "var(--muted)",
                    borderRadius: 999,
                    padding: "9px 13px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {item.label} <span style={{ opacity: .72, marginLeft: 4 }}>({item.tier === "free" ? "Free" : "Paid"})</span>
                </button>
              ))}
            </div>
            <button onClick={downloadCv} className="career-btn career-btn-primary">
              {canDownload ? "Download / Save PDF" : isPaidTemplate ? "Pay & Download" : "Login to Download"}
            </button>
          </div>
          <div className="no-print" style={{ marginBottom: 14, background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: 14, color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: "var(--text)" }}>{selectedTemplate.label}</strong> is a {selectedTemplate.tier} template.
            {selectedTemplate.tier === "free"
              ? " Free downloads include a small Gulf Jobs Guide watermark on the bottom-right of the CV."
              : " Paid templates unlock after payment and download without the free watermark."}
          </div>
          <div className="cv-print-shell">
            <CvPreview cv={cv} template={template} showWatermark={selectedTemplate.tier === "free"} />
          </div>
        </div>
      </div>
      <AccessModal
        mode={modal}
        templateLabel={selectedTemplate.label}
        onClose={closeModal}
        onLogin={requireLogin}
        onSignup={requireLogin}
        onPayment={finishPayment}
      />
    </Layout>
  );
}
