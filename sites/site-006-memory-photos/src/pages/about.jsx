import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

export default function About({ theme }) {
  return (
    <Layout title="About Us" description={`Learn about ${SITE.name} and our childhood photo remake tool.`} theme={theme} canonical={`https://${SITE.domain}/about`}>
      <section className="glass-panel" style={{ borderRadius: 28, padding: "40px 28px", marginBottom: 28 }}>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>About Us</span>
        <h1 className="hero-title" style={{ fontSize: 42, fontWeight: 950, letterSpacing: "-0.04em", margin: "10px 0 14px" }}>
          We help families see old memories with today's faces.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.85, maxWidth: 760 }}>
          {SITE.name} is built for parents, siblings and relatives who want to recreate childhood photos without losing the original scene. Upload an old picture, add current portraits, and generate a warm updated version you can share privately.
        </p>
      </section>

      <div className="feature-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
        {[
          ["Our mission", "Make photo remakes simple, respectful and family-friendly — no complicated editing software required."],
          ["How we work", "AI keeps the scene stable while swapping faces using your reference photos. You stay in control of every upload."],
        ].map(([title, text]) => (
          <div key={title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 24 }}>
            <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 8 }}>{title}</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>{text}</p>
          </div>
        ))}
      </div>

      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 22, padding: 26 }}>
        <h2 style={{ fontSize: 24, fontWeight: 950, marginBottom: 14 }}>What you can do here</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {["View demo before/after pairs", "Follow the how-it-works guide", "Remake your own childhood photo", "Download results for printing"].map(item => (
            <div key={item} style={{ border: "1px solid var(--border)", borderRadius: 14, padding: 14, fontWeight: 800, fontSize: 14 }}>{item}</div>
          ))}
        </div>
        <Link href="/photo-remake" className="memory-btn memory-btn-primary" style={{ marginTop: 20, display: "inline-flex" }}>Try Photo Remake</Link>
      </section>
    </Layout>
  );
}
