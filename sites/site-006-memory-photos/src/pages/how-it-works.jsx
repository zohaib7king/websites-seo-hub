import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

export default function HowItWorks({ theme }) {
  return (
    <Layout
      title="How It Works"
      description="Learn how to remake childhood photos step by step — upload, map faces, and download."
      theme={theme}
      canonical={`https://${SITE.domain}/how-it-works`}
    >
      <section style={{ marginBottom: 32 }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>How it works</span>
        <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          Four steps from old photo to new memory
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 720 }}>
          Follow this visual guide to recreate a childhood picture with updated faces. The same flow works for one child or two children in a group photo.
        </p>
      </section>

      <div className="step-grid" style={{ display: "grid", gap: 24 }}>
        {SITE.howItWorksSteps.map(step => (
          <section key={step.step} className="glass-panel" style={{ borderRadius: 26, padding: 22, display: "grid", gridTemplateColumns: "280px 1fr", gap: 22, alignItems: "center" }}>
            <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
              <img src={step.image} alt={step.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
            </div>
            <div>
              <span style={{ display: "inline-flex", width: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", background: "var(--hero)", color: "#fff", fontWeight: 900, marginBottom: 10 }}>
                {step.step}
              </span>
              <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 8 }}>{step.title}</h2>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.75 }}>{step.text}</p>
            </div>
          </section>
        ))}
      </div>

      <section style={{ marginTop: 36, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, padding: 26 }}>
        <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 12 }}>Tips for better results</h2>
        <ul style={{ color: "var(--muted)", paddingLeft: 20, lineHeight: 1.9, fontSize: 15 }}>
          <li>Use a clear scan or photo of the old picture — avoid heavy glare.</li>
          <li>Current face photos should be front-facing with good light.</li>
          <li>For two children, map left and right faces carefully in the tool.</li>
          <li>Start with one person if the group photo is crowded or blurry.</li>
        </ul>
        <Link href="/photo-remake" className="memory-btn memory-btn-primary" style={{ marginTop: 18, display: "inline-flex" }}>Start Now</Link>
      </section>
    </Layout>
  );
}
