import Layout from "../../components/Layout.jsx";
import Link from "next/link";
import { getSite, getPublishedArticles } from "../../lib/data";

export async function getServerSideProps({ params }) {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  const article = articles.find(a => a.slug === params.slug);
  if (!article) return { notFound: true };
  return { props: { article, theme: site?.theme || "midnight" } };
}

function readingTime(html) {
  const words = String(html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Typography for the AI-generated HTML body. Uses theme CSS vars set by Layout.
const ARTICLE_CSS = `
.article-h1{font-size:38px;font-weight:800;line-height:1.2;margin-bottom:14px;}
.article-body{font-size:17px;line-height:1.8;color:var(--text);}
.article-body > p:first-of-type{font-size:1.15em;line-height:1.7;font-weight:500;}
.article-body h2{font-size:1.55em;font-weight:800;line-height:1.3;margin:1.9em 0 .6em;}
.article-body h3{font-size:1.2em;font-weight:700;margin:1.5em 0 .5em;}
.article-body p{margin:0 0 1.25em;}
.article-body ul,.article-body ol{margin:0 0 1.3em 1.4em;}
.article-body li{margin:.45em 0;}
.article-body strong{font-weight:700;}
.article-body a{color:var(--accent);text-decoration:underline;}
.article-body blockquote{
  margin:1.7em 0;padding:18px 22px;border-left:4px solid var(--accent);
  background:color-mix(in srgb, var(--accent) 13%, transparent);
  border-radius:0 12px 12px 0;font-size:1.05em;
}
.article-body blockquote::before{
  content:"💡 Key Takeaway";display:block;font-size:.72em;font-weight:800;
  letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;
}
.article-body blockquote p:last-child{margin-bottom:0;}
@media(max-width:768px){
  .article-h1{font-size:28px;}
  .article-body{font-size:16px;}
}
`;

export default function ArticlePage({ article, theme }) {
  const mins = readingTime(article.content);
  const date = new Date(article.published_at || article.created_at)
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <Layout title={article.title} description={article.meta_desc} theme={theme}>
      <style dangerouslySetInnerHTML={{ __html: ARTICLE_CSS }} />

      <article style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Featured image — or clean gradient placeholder */}
        {article.image_url ? (
          <img src={article.image_url} alt={article.title}
            style={{ width: "100%", height: 340, objectFit: "cover", borderRadius: 16, marginBottom: 28 }} />
        ) : (
          <div style={{ height: 240, borderRadius: 16, marginBottom: 28, background: "var(--hero)", display: "flex", alignItems: "flex-end", padding: 24 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", opacity: 0.92 }}>
              {article.category || "Featured"}
            </span>
          </div>
        )}

        {/* Category + title */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          {article.category}
        </div>
        <h1 className="article-h1">{article.title}</h1>

        {/* Meta: date + reading time */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", color: "var(--muted)", fontSize: 13, flexWrap: "wrap" }}>
          <span>{date}</span><span>•</span><span>{mins} min read</span>
          {article.ai_generated && <><span>•</span><span style={{ color: "var(--accent)" }}>✨ AI-assisted</span></>}
        </div>

        {/* Lead / standfirst */}
        {article.meta_desc && (
          <p style={{ fontSize: 19, lineHeight: 1.7, fontWeight: 500, margin: "20px 0 28px", opacity: 0.95 }}>
            {article.meta_desc}
          </p>
        )}

        {/* In-article Ad */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, textAlign: "center", color: "var(--muted)", fontSize: 12, marginBottom: 32 }}>
          [ In-article Ad Unit ]
        </div>

        {/* Article body */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div style={{ marginTop: 32, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {article.tags.map(tag => (
              <span key={tag} style={{ padding: "4px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, color: "var(--muted)" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* End-of-article CTA */}
        <div style={{ marginTop: 40, padding: "30px 28px", borderRadius: 16, background: "var(--hero)", textAlign: "center" }}>
          <div style={{ fontSize: 21, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Enjoyed this article?</div>
          <p style={{ color: "rgba(255,255,255,0.92)", fontSize: 14, marginBottom: 18 }}>
            Get more guides like this — explore the rest of the site.
          </p>
          <Link href="/" style={{ display: "inline-block", background: "#fff", color: "#111", fontWeight: 700, fontSize: 14, padding: "11px 24px", borderRadius: 999 }}>
            Read more articles →
          </Link>
        </div>
      </article>
    </Layout>
  );
}
