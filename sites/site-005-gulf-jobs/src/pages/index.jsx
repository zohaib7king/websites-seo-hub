import Layout from "../components/Layout.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles, catSlug } from "../lib/data";
import { readingTime, fmtDate } from "../lib/seed";
import { SITE } from "../site.config";

export async function getServerSideProps() {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  return { props: { articles, theme: site?.theme || "midnight" } };
}

function Eyebrow({ children }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
      {children}
    </span>
  );
}

export default function Home({ articles, theme }) {
  const featured = articles[0];
  const grid = articles.slice(1, 7);
  const recent = articles.slice(0, 6);

  return (
    <Layout title={`${SITE.accent} News & Guides`} theme={theme}>
      {/* Featured lead story */}
      {featured && (
        <section style={{ marginBottom: 40 }}>
          <Link href={`/article/${featured.slug}`} className="card-hover" style={{
            display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 0, alignItems: "stretch",
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden",
          }}>
            <div className="feature-split" style={{
              minHeight: 300,
              background: featured.image_url ? `url(${featured.image_url}) center/cover` : "var(--hero)",
            }} />
            <div style={{ padding: "30px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Eyebrow>{featured.category || "Featured"}</Eyebrow>
              <h1 className="hero-title" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.02em", margin: "12px 0 12px" }}>
                {featured.title}
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>{featured.meta_desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--muted)", fontSize: 13 }}>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{featured.author || "Editorial Team"}</span>
                <span>·</span><span>{fmtDate(featured.published_at)}</span>
                <span>·</span><span>{readingTime(featured.content)} min read</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Latest + sidebar */}
      <div className="news-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
        {/* Main column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>Latest News</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          {grid.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
              {grid.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 40, textAlign: "center", color: "var(--muted)" }}>
              More stories coming soon.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)", marginBottom: 14 }}>Most Recent</div>
            {recent.map((a, i) => (
              <Link key={a.id} href={`/article/${a.slug}`} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)", width: 22, flexShrink: 0 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11.5, marginTop: 4 }}>{a.category} · {fmtDate(a.published_at)}</div>
                </div>
              </Link>
            ))}
          </div>
          <div className="ad-slot" style={{ minHeight: 250 }}>[ Ad Unit 300×250 ]</div>
          <div style={{ background: "var(--hero)", borderRadius: 14, padding: 22 }}>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Stay in the loop</div>
            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, marginBottom: 0 }}>New {SITE.accent} stories, every week. Subscribe below.</p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
