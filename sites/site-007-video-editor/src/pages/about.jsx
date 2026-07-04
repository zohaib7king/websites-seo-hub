import Link from "next/link";
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

export default function About({ theme, brand }) {
  return (
    <Layout
      title="About"
      description={brand.aboutBody}
      theme={theme}
      brand={brand}
      canonical={`https://${brand.domain}/about`}
    >
      <section className="glass-panel" style={{ borderRadius: 28, padding: "40px 28px", marginBottom: 28 }}>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>About</span>
        <h1 className="hero-title" style={{ fontSize: 42, fontWeight: 950, letterSpacing: "-0.04em", margin: "10px 0 14px" }}>
          {brand.aboutTitle}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.85, maxWidth: 760, whiteSpace: "pre-wrap" }}>
          {brand.aboutBody}
        </p>
      </section>

      <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }}>
        {[
          ["Fast turnaround", "Clear timelines and updates so you always know when the cut lands."],
          ["Platform-ready", "Exports for YouTube, Reels, TikTok, ads, and wedding films."],
          ["Revision-friendly", "Structured feedback rounds so the final cut matches your vision."],
        ].map(([title, text]) => (
          <div key={title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>{title}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14 }}>{text}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>{brand.location}</div>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>{brand.email}</div>
        {brand.phone && <div style={{ color: "var(--muted)", marginBottom: 16 }}>{brand.phone}</div>}
        <Link href="/contact" className="ff-btn ff-btn-primary" style={{ display: "inline-flex" }}>{brand.heroCta || "Hire me"}</Link>
      </div>
    </Layout>
  );
}
