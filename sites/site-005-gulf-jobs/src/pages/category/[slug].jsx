import Layout from "../../components/Layout.jsx";
import ArticleCard from "../../components/ArticleCard.jsx";
import { getSite, getPublishedArticles, catSlug } from "../../lib/data";
import { SITE } from "../../site.config";

export async function getServerSideProps({ params }) {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  const filtered = articles.filter(a => catSlug(a.category) === params.slug);
  const label = String(params.slug).replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return { props: { articles: filtered, label, theme: site?.theme || "midnight" } };
}

export default function Category({ articles, label, theme }) {
  const description = `Read practical ${label} guides for Gulf job seekers targeting the UAE, Saudi Arabia, Oman, Qatar, Kuwait and Bahrain.`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} guides`,
    description,
    url: `https://${SITE.domain}/category/${catSlug(label)}`,
  };

  return (
    <Layout title={`${label} Guides`} description={description} theme={theme} canonical={`https://${SITE.domain}/category/${catSlug(label)}`} schema={schema}>
      <section style={{ marginBottom: 32 }}>
        <span style={{
          display: "inline-block", padding: "4px 12px", borderRadius: 999,
          background: "color-mix(in srgb, var(--accent) 14%, transparent)",
          color: "var(--accent)", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 14
        }}>
          CATEGORY
        </span>
        <h1 className="hero-title" style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
          <span style={{ background: "var(--hero)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{label}</span>
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {articles.length} article{articles.length === 1 ? "" : "s"} in this category
        </p>
      </section>

      {articles.length === 0 ? (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 48, textAlign: "center", color: "var(--muted)" }}>
          No articles in “{label}” yet. Check back soon!
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20 }}>
          {articles.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </Layout>
  );
}
