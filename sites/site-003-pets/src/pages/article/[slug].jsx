import Layout from "../../components/Layout.jsx";
import ContentStats from "../../components/ContentStats.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles, catSlug } from "../../lib/data";
import { readingTime, fmtDate } from "../../lib/seed";
import { SITE } from "../../site.config";

export async function getServerSideProps({ params }) {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  const article = articles.find(a => a.slug === params.slug);
  if (!article) return { notFound: true };
  const related = articles.filter(a => a.slug !== article.slug).slice(0, 3);
  return { props: { article, related, theme: site?.theme || SITE.defaultTheme || "petportal" } };
}

const ARTICLE_CSS = `
.article-shell{max-width:760px;margin:0 auto;}
.article-h1{font-size:40px;font-weight:800;line-height:1.15;letter-spacing:-0.02em;margin-bottom:14px;color:#0f172a;}
.article-body{font-size:17px;line-height:1.8;color:#334155;}
.article-body > p:first-of-type{font-size:1.15em;line-height:1.7;font-weight:500;color:#1e293b;}
.article-body h2{font-size:1.5em;font-weight:800;line-height:1.3;margin:1.9em 0 .6em;color:#0f172a;}
.article-body h3{font-size:1.2em;font-weight:700;margin:1.5em 0 .5em;color:#1e293b;}
.article-body p{margin:0 0 1.25em;color:#334155;}
.article-body ul,.article-body ol{margin:0 0 1.3em 1.4em;color:#334155;}
.article-body li{margin:.45em 0;color:#334155;}
.article-body strong{font-weight:700;color:#1e293b;}
.article-body a{color:#ea580c;text-decoration:underline;}
.article-body blockquote{
  margin:1.7em 0;padding:18px 22px;border-left:4px solid #ea580c;
  background:#fff7ed;border-radius:0 12px 12px 0;font-size:1.05em;color:#334155;
}
.article-body blockquote::before{
  content:"Key Takeaway";display:block;font-size:.72em;font-weight:800;
  letter-spacing:.08em;text-transform:uppercase;color:#ea580c;margin-bottom:6px;
}
.article-body blockquote p:last-child{margin-bottom:0;}
@media(max-width:768px){.article-h1{font-size:28px;}.article-body{font-size:16px;}}
`;

function RelatedCard({ a }) {
  return (
    <Link href={`/article/${a.slug}`} className="card-hover" style={{ display: "block", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", height: "100%" }}>
      <div style={{ height: 120, background: a.image_url ? `url(${a.image_url}) center/cover` : "linear-gradient(135deg,#f97316,#fb7185)" }} />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{a.category}</div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 10, color: "#0f172a" }}>{a.title}</div>
        <div style={{ color: "#64748b", fontSize: 12 }}>{fmtDate(a.published_at)} · {readingTime(a.content)} min read</div>
      </div>
    </Link>
  );
}

export default function ArticlePage({ article, related, theme }) {
  const mins = readingTime(article.content);

  return (
    <Layout title={article.title} description={article.meta_desc} theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: ARTICLE_CSS }} />

      <article className="article-shell content-panel">
        {/* Breadcrumb */}
        <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 18 }}>
          <Link href="/" style={{ color: "#64748b" }}>Home</Link>
          {article.category && <> <span style={{ opacity: 0.5 }}>/</span> <Link href={`/category/${catSlug(article.category)}`} style={{ color: "#ea580c", fontWeight: 600 }}>{article.category}</Link></>}
        </div>

        {/* Title + subtitle */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{article.category}</div>
        <h1 className="article-h1">{article.title}</h1>
        {article.meta_desc && (
          <p style={{ fontSize: 19, lineHeight: 1.7, fontWeight: 500, color: "#64748b", margin: "0 0 22px" }}>{article.meta_desc}</p>
        )}

        {/* Byline */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#fb7185)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
            {(article.author || "E").charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{article.author || "Editorial Team"}</div>
            <div style={{ color: "#64748b", fontSize: 12.5 }}>{fmtDate(article.published_at)} · {mins} min read</div>
          </div>
          <ContentStats type="article" slug={article.slug} initialViews={article.view_count} initialLikes={article.like_count} />
        </div>

        {/* Featured image */}
        {article.image_url ? (
          <img src={article.image_url} alt={article.title} style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 16, marginBottom: 28 }} />
        ) : (
          <div style={{ height: 240, borderRadius: 16, marginBottom: 28, background: "var(--hero)" }} />
        )}

        {/* Optional data callout */}
        {article.data && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "20px 24px", background: "color-mix(in srgb, var(--accent) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)", borderRadius: 14, marginBottom: 28 }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: "var(--accent)" }}>{article.data.value}</span>
            <span style={{ color: "var(--muted)", fontSize: 14 }}>{article.data.label}</span>
          </div>
        )}

        {/* In-article ad */}
        <div className="ad-slot" style={{ padding: 16, marginBottom: 28 }}>[ In-article Ad Unit ]</div>

        {/* Body */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ marginTop: 32, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {article.tags.map(tag => (
              <Link key={tag} href={`/category/${catSlug(article.category)}`} style={{ padding: "4px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 20, fontSize: 12, color: "#64748b", fontWeight: 600 }}>#{tag}</Link>
            ))}
          </div>
        )}
      </article>

      {/* Related */}
      {related?.length > 0 && (
        <section style={{ maxWidth: "var(--max)", margin: "48px auto 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>Related Stories</h2>
            <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
            {related.map(a => <RelatedCard key={a.id} a={a} />)}
          </div>
        </section>
      )}
    </Layout>
  );
}
