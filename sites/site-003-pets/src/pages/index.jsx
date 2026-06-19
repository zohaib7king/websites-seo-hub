import Layout from "../components/Layout.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  return { props: { articles, theme: site?.theme || "midnight" } };
}

export default function Home({ articles, theme }) {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <Layout title={`${SITE.accent} News & Guides`} theme={theme}>
      {/* Hero */}
      <section style={{ marginBottom: 44 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999,
          background: "color-mix(in srgb, var(--accent) 14%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
          color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: "0.03em", marginBottom: 18
        }}>
          ● {SITE.eyebrow}
        </span>
        <h1 className="hero-title" style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", maxWidth: 760 }}>
          {SITE.lead}{" "}
          <span style={{ background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {SITE.accent}
          </span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 16, maxWidth: 600, lineHeight: 1.7 }}>
          {SITE.tagline}
        </p>
        {featured && (
          <Link href={`/article/${featured.slug}`} style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 22, padding: "11px 22px", borderRadius: 999,
            background: "var(--hero)", color: "#fff", fontWeight: 700, fontSize: 14, boxShadow: "var(--glow)"
          }}>
            Read the latest →
          </Link>
        )}
      </section>

      {/* Featured + side rail */}
      <div className="article-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 52 }}>
        {featured ? (
          <ArticleCard article={featured} />
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 48, textAlign: "center", color: "var(--muted)" }}>
            No articles yet. Generate your first article in the CRM!
          </div>
        )}
        <div className="ad-slot" style={{ minHeight: 280 }}>[ Ad Unit 300×250 ]</div>
      </div>

      {/* Latest grid */}
      {rest.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>Latest Articles</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20 }}>
            {rest.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </>
      )}
    </Layout>
  );
}
