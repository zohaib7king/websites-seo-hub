import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

function Pill({ children }) {
  return (
    <span style={{
      display: "inline-flex", padding: "7px 12px", borderRadius: 999,
      background: "color-mix(in srgb,var(--accent) 12%,transparent)",
      border: "1px solid color-mix(in srgb,var(--accent) 28%,transparent)",
      color: "var(--accent2)", fontSize: 13, fontWeight: 800,
    }}>
      {children}
    </span>
  );
}

export default function Home({ theme }) {
  const featured = SITE.demoPairs[0];

  return (
    <Layout
      title="Childhood Photo Remake — Same Scene, Updated Faces"
      description="Remake Memory helps you recreate old family photos with today's faces. Upload childhood pictures, map current portraits, and download your updated memory."
      theme={theme}
      canonical={`https://${SITE.domain}`}
    >
      <section className="hero-split glass-panel" style={{
        borderRadius: 34, padding: "48px 32px", display: "grid",
        gridTemplateColumns: "1.05fr .95fr", gap: 32, alignItems: "center",
      }}>
        <div>
          <Pill>Same memory · new faces</Pill>
          <h1 className="hero-title" style={{ fontSize: 54, lineHeight: 1.04, letterSpacing: "-0.05em", fontWeight: 950, margin: "16px 0 18px" }}>
            {SITE.lead} <span style={{ background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{SITE.accent}</span>
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 18, lineHeight: 1.8, marginBottom: 24, maxWidth: 620 }}>
            {SITE.tagline}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <Link href="/photo-remake" className="memory-btn memory-btn-primary">Start Photo Remake</Link>
            <Link href="/demo" className="memory-btn memory-btn-soft">See Demo Gallery</Link>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Upload old photo", "Add current faces", "Download remake"].map(item => <Pill key={item}>{item}</Pill>)}
          </div>
        </div>

        <div className="hide-mobile">
          <div style={{ borderRadius: 28, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--glow)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", background: "var(--surface)", color: "var(--muted)" }}>Before</div>
                <img src={featured.before} alt="Before demo" className="before-shot" style={{ width: "100%", height: 220, objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", background: "var(--accent)", color: "#fff" }}>After</div>
                <img src={featured.after} alt="After demo" style={{ width: "100%", height: 220, objectFit: "cover" }} />
              </div>
            </div>
            <div style={{ padding: 16, background: "var(--surface)" }}>
              <strong>{featured.title}</strong>
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{featured.caption}</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {[
          ["Demo Gallery", "Browse before/after examples", "/demo"],
          ["How It Works", "Step-by-step visual guide", "/how-it-works"],
          ["Photo Remake", "Upload and generate your own", "/photo-remake"],
        ].map(([title, text, href]) => (
          <Link key={title} href={href} className="card-hover" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 22 }}>
            <div style={{ color: "var(--accent)", fontWeight: 950, marginBottom: 6 }}>{title}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{text}</div>
          </Link>
        ))}
      </section>

      <section style={{ marginTop: 42, borderRadius: 30, padding: 28, background: "var(--surface)", border: "1px solid var(--border)" }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Why families use it</span>
        <h2 style={{ fontSize: 30, fontWeight: 950, letterSpacing: "-0.04em", margin: "10px 0 18px" }}>Keep the moment. Refresh the faces.</h2>
        <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            ["Same composition", "Background, pose and framing stay familiar — only the people are updated."],
            ["Two-child support", "Map left and right faces in group photos to each person's current portrait."],
            ["Private uploads", "Photos are processed for your remake and not published on the site."],
          ].map(([title, text]) => (
            <div key={title} style={{ border: "1px solid var(--border)", borderRadius: 18, padding: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 8 }}>{title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
