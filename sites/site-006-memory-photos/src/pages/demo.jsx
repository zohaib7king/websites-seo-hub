import Layout from "../components/Layout.jsx";
import Link from "next/link";
import { getSite } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const site = await getSite();
  return { props: { theme: site?.theme || SITE.defaultTheme || "sunset" } };
}

function CompareCard({ pair }) {
  return (
    <article className="card-hover" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden" }}>
      <div className="compare-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>Before</div>
          <img src={pair.before} alt={`${pair.title} before`} className="before-shot" style={{ width: "100%", height: 200, objectFit: "cover" }} />
        </div>
        <div>
          <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase", color: "#fff", background: "var(--accent)", borderBottom: "1px solid var(--border)" }}>After</div>
          <img src={pair.after} alt={`${pair.title} after`} style={{ width: "100%", height: 200, objectFit: "cover" }} />
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 950, marginBottom: 6 }}>{pair.title}</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.65 }}>{pair.caption}</p>
      </div>
    </article>
  );
}

export default function Demo({ theme }) {
  return (
    <Layout
      title="Demo Gallery"
      description="See before and after examples of childhood photo remakes with updated faces."
      theme={theme}
      canonical={`https://${SITE.domain}/demo`}
    >
      <section style={{ marginBottom: 28 }}>
        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 900, letterSpacing: ".08em", textTransform: "uppercase" }}>Demo Gallery</span>
        <h1 className="hero-title" style={{ fontSize: 40, fontWeight: 950, letterSpacing: "-0.04em", margin: "8px 0 12px" }}>
          Before & after memory remakes
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 700 }}>
          These sample pairs show how an old scene can stay the same while faces are refreshed with current portraits. Your own results will depend on photo quality and lighting.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22, marginBottom: 32 }}>
        {SITE.demoPairs.map(pair => <CompareCard key={pair.id} pair={pair} />)}
      </div>

      <section className="glass-panel" style={{ borderRadius: 24, padding: 28, textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 950, marginBottom: 10 }}>Ready to remake your own photo?</h2>
        <p style={{ color: "var(--muted)", marginBottom: 18 }}>Upload your childhood image and today's face photos in the tool.</p>
        <Link href="/photo-remake" className="memory-btn memory-btn-primary">Open Photo Remake</Link>
      </section>
    </Layout>
  );
}
