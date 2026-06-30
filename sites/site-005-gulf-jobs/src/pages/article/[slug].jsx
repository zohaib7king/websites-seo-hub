import Layout from "../../components/Layout.jsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { authHeaders, getAuth, requireLogin } from "../../lib/authClient";
import { getSite, getPublishedArticles, catSlug } from "../../lib/data";
import { readingTime, fmtDate } from "../../lib/seed";
import { SITE } from "../../site.config";

export async function getServerSideProps({ params }) {
  const [site, articles] = await Promise.all([getSite(), getPublishedArticles()]);
  const article = articles.find(a => a.slug === params.slug);
  if (!article) return { notFound: true };
  const related = articles.filter(a => a.slug !== article.slug).slice(0, 3);
  return { props: { article, related, theme: site?.theme || "midnight" } };
}

const ARTICLE_CSS = `
.article-shell{width:100%;max-width:760px;margin:0 auto;overflow:hidden;}
.article-h1{font-size:40px;font-weight:800;line-height:1.15;letter-spacing:-0.02em;margin-bottom:14px;overflow-wrap:anywhere;}
.article-body{font-size:17px;line-height:1.8;color:var(--text);overflow-wrap:anywhere;word-break:break-word;}
.article-body > p:first-of-type{font-size:1.15em;line-height:1.7;font-weight:500;}
.article-body h2{font-size:1.5em;font-weight:800;line-height:1.3;margin:1.9em 0 .6em;}
.article-body h3{font-size:1.2em;font-weight:700;margin:1.5em 0 .5em;}
.article-body p{margin:0 0 1.25em;}
.article-body ul,.article-body ol{margin:0 0 1.3em 1.4em;}
.article-body li{margin:.45em 0;}
.article-body strong{font-weight:700;}
.article-body a{color:var(--accent);text-decoration:underline;}
.article-body img,.article-body iframe,.article-body video{max-width:100%;height:auto;border-radius:14px;}
.article-body blockquote{
  margin:1.7em 0;padding:18px 22px;border-left:4px solid var(--accent);
  background:color-mix(in srgb, var(--accent) 13%, transparent);
  border-radius:0 12px 12px 0;font-size:1.05em;
}
.article-body blockquote::before{
  content:"Key Takeaway";display:block;font-size:.72em;font-weight:800;
  letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:6px;
}
.article-body blockquote p:last-child{margin-bottom:0;}
.article-stat-row{max-width:100%;min-width:0;}
.article-stat-row span,.article-stat-row button{white-space:nowrap;}
.article-share{display:flex;gap:8px;flex-wrap:wrap;}
.article-featured-image{display:block;max-width:100%;}
@media(max-width:768px){
  .article-h1{font-size:28px;}
  .article-body{font-size:16px;}
  .article-byline{align-items:flex-start !important;}
  .article-author{flex:1 1 calc(100% - 56px) !important;min-width:0 !important;}
  .article-stat-row{flex:1 1 100%;}
  .article-share{flex:1 1 100%;}
  .article-featured-image{height:230px !important;}
  .article-data-callout{align-items:flex-start !important;flex-direction:column;}
}
@media(max-width:420px){
  .article-featured-image{height:190px !important;}
  .article-body blockquote{padding:16px 18px;}
}
`;

function RelatedCard({ a }) {
  return (
    <Link href={`/article/${a.slug}`} className="card-hover" style={{ display: "block", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", height: "100%" }}>
      <div style={{ height: 120, background: a.image_url ? `url(${a.image_url}) center/cover` : "var(--hero)" }} />
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{a.category}</div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, marginBottom: 10 }}>{a.title}</div>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>{fmtDate(a.published_at)} · {readingTime(a.content)} min read</div>
      </div>
    </Link>
  );
}

function formatCount(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(number);
}

function ArticleStats({ article }) {
  const [views, setViews] = useState(Number(article.view_count || 0));
  const [likes, setLikes] = useState(Number(article.like_count || 0));
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const trackedView = useRef(false);

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;

    const recordView = async () => {
      try {
        const res = await fetch("/api/article-stats/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: article.slug }),
        });
        const payload = await res.json();
        if (res.ok) {
          setViews(Number(payload.view_count || 0));
          setLikes(Number(payload.like_count || 0));
        }
      } catch {
        // Keep the server-rendered count if the tracker is unavailable.
      }
    };

    recordView();
  }, [article.slug]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!getAuth()?.token) {
        setLiked(false);
        return;
      }
      try {
        const res = await fetch(`/api/article-stats/like-status?slug=${encodeURIComponent(article.slug)}`, {
          headers: authHeaders(),
        });
        const payload = await res.json();
        if (res.ok) setLiked(Boolean(payload.liked));
      } catch {
        setLiked(false);
      }
    };

    fetchLikeStatus();
    window.addEventListener("gulf-auth-changed", fetchLikeStatus);
    return () => window.removeEventListener("gulf-auth-changed", fetchLikeStatus);
  }, [article.slug]);

  const toggleLike = async () => {
    if (!getAuth()?.token) {
      requireLogin();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/article-stats/like", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ slug: article.slug }),
      });
      const payload = await res.json();
      if (res.status === 401) {
        requireLogin();
        return;
      }
      if (!res.ok) throw new Error(payload.error || "Could not update like");
      setLiked(Boolean(payload.liked));
      setLikes(Number(payload.like_count || 0));
      setViews(Number(payload.view_count || views));
    } catch {
      // Leave the UI unchanged if the backend rejects the update.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-stat-row" style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 999, padding: "8px 12px", color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
        {formatCount(views)} views
      </span>
      <button
        type="button"
        onClick={toggleLike}
        disabled={loading}
        style={{
          border: `1px solid ${liked ? "var(--accent)" : "var(--border)"}`,
          background: liked ? "color-mix(in srgb,var(--accent) 12%,#fff)" : "#fff",
          color: liked ? "var(--accent)" : "var(--muted)",
          borderRadius: 999,
          padding: "8px 12px",
          fontSize: 13,
          fontWeight: 900,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? .72 : 1,
        }}
      >
        {liked ? "Liked" : "Like"} · {formatCount(likes)}
      </button>
    </div>
  );
}

export default function ArticlePage({ article, related, theme }) {
  const mins = readingTime(article.content);
  const articleUrl = `https://${SITE.domain}/article/${article.slug}`;
  const imageUrl = article.image_url?.startsWith("http") ? article.image_url : article.image_url ? `https://${SITE.domain}${article.image_url}` : undefined;
  const articleText = String(article.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_desc,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      "@type": "Organization",
      name: article.author || SITE.name,
      url: `https://${SITE.domain}/contact`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: `https://${SITE.domain}`,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    articleSection: article.category,
    keywords: article.tags?.join(", "),
    articleBody: articleText.slice(0, 5000),
  };
  const qapageSchema = article.slug === "how-to-use-linkedin-and-gulf-job-portals" ? {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: "How should you use LinkedIn and Gulf job portals for a focused job search?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use LinkedIn and Gulf job portals as a daily system: optimize your profile, search exact job titles, apply to fresh vacancies, tailor your CV to each role type, track applications, and follow up only when the employer and vacancy are clear.",
      },
    },
  } : null;
  const schema = qapageSchema ? [blogPostingSchema, qapageSchema] : blogPostingSchema;

  return (
    <Layout title={article.title} description={article.meta_desc} theme={theme} canonical={articleUrl} image={article.image_url} schema={schema}>
      <style dangerouslySetInnerHTML={{ __html: ARTICLE_CSS }} />

      <article className="article-shell">
        {/* Breadcrumb */}
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 18 }}>
          <Link href="/" style={{ color: "var(--muted)" }}>Home</Link>
          {article.category && <> <span style={{ opacity: 0.5 }}>/</span> <Link href={`/category/${catSlug(article.category)}`} style={{ color: "var(--accent)" }}>{article.category}</Link></>}
        </div>

        {/* Title + subtitle */}
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{article.category}</div>
        <h1 className="article-h1">{article.title}</h1>
        {article.meta_desc && (
          <p style={{ fontSize: 19, lineHeight: 1.7, fontWeight: 500, color: "var(--muted)", margin: "0 0 22px" }}>{article.meta_desc}</p>
        )}

        {/* Byline */}
        <div className="article-byline" style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: 28, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--hero)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
            {(article.author || "E").charAt(0)}
          </div>
          <div className="article-author" style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{article.author || "Editorial Team"}</div>
            <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{fmtDate(article.published_at)} · {mins} min read</div>
          </div>
          <ArticleStats article={article} />
          <div className="article-share">
            {["𝕏", "in", "f"].map(s => (
              <span key={s} style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Featured image */}
        {article.image_url ? (
          <img className="article-featured-image" src={article.image_url} alt={article.title} style={{ width: "100%", height: 380, objectFit: "cover", borderRadius: 16, marginBottom: 28 }} />
        ) : (
          <div className="article-featured-image" style={{ height: 240, borderRadius: 16, marginBottom: 28, background: "var(--hero)" }} />
        )}

        {/* Optional data callout */}
        {article.data && (
          <div className="article-data-callout" style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "20px 24px", background: "color-mix(in srgb, var(--accent) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)", borderRadius: 14, marginBottom: 28 }}>
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
              <Link key={tag} href={`/category/${catSlug(article.category)}`} style={{ padding: "4px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, color: "var(--muted)" }}>#{tag}</Link>
            ))}
          </div>
        )}

        <section style={{ marginTop: 34, padding: 22, border: "1px solid var(--border)", borderRadius: 16, background: "#fff" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Editorial review</div>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>
            This guide is prepared by the {SITE.name} editorial desk for Gulf job seekers. We focus on practical CV,
            job portal, recruiter communication, visa-safety, and offer-verification advice. We update guides when
            job-search practices or official processes change, and readers can report corrections through the contact page.
          </p>
        </section>
      </article>

      {/* Related */}
      {related?.length > 0 && (
        <section style={{ maxWidth: "var(--max)", margin: "48px auto 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Related Stories</h2>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 20 }}>
            {related.map(a => <RelatedCard key={a.id} a={a} />)}
          </div>
        </section>
      )}
    </Layout>
  );
}
