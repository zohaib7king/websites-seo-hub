import Layout from "../components/Layout.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles, catSlug } from "../lib/data";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  return { props: { articles, theme: site?.theme || SITE.defaultTheme || "royal" } };
}

function groupByCategory(articles) {
  return articles.reduce((groups, article) => {
    const category = article.category || "Guides";
    return { ...groups, [category]: [...(groups[category] || []), article] };
  }, {});
}

export default function Articles({ articles, theme }) {
  const grouped = groupByCategory(articles);
  const categoryNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE.name} Articles`,
    description: "All Gulf job guides grouped by category.",
    url: `https://${SITE.domain}/articles`,
  };

  return (
    <Layout title="Articles" description="Browse all Gulf job articles by category, including CV, visas, interviews, job portals, and recruitment guides." theme={theme} canonical={`https://${SITE.domain}/articles`} schema={schema}>
      <section style={{ marginBottom: 30 }}>
        <span style={{ color: "var(--accent)", fontWeight: 900, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Articles</span>
        <h1 className="hero-title" style={{ fontSize: 44, lineHeight: 1.08, letterSpacing: "-0.05em", fontWeight: 950, margin: "8px 0 10px" }}>
          All Gulf career articles by category.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 760 }}>
          Click any category to open a dedicated category page, or browse the latest guides below.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 16, marginBottom: 36 }}>
        {categoryNames.map(category => (
          <Link key={category} href={`/category/${catSlug(category)}`} className="card-hover" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
              {grouped[category].length} article{grouped[category].length === 1 ? "" : "s"}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 950, marginBottom: 10 }}>{category}</h2>
            <div style={{ display: "grid", gap: 7 }}>
              {grouped[category].slice(0, 3).map(article => (
                <span key={article.slug} style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>{article.title}</span>
              ))}
            </div>
          </Link>
        ))}
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <h2 style={{ fontSize: 28, fontWeight: 950, letterSpacing: "-0.04em" }}>All Articles</h2>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
          {articles.map(article => <ArticleCard key={article.id || article.slug} article={article} />)}
        </div>
      </section>
    </Layout>
  );
}
