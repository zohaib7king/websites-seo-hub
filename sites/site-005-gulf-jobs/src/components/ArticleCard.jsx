import Link from "next/link";

function formatCount(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return String(number);
}

export default function ArticleCard({ article }) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <Link href={`/article/${article.slug}`} style={{ display: "block", height: "100%" }}>
      <article className="card-hover" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, height: "100%" }}>
        {article.image_url ? (
          <img src={article.image_url} alt="" style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, marginBottom: 14 }} />
        ) : (
          <div style={{ height: 120, borderRadius: 8, marginBottom: 14, background: "var(--hero)" }} />
        )}
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {article.category || "Article"}
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.4, margin: 0 }}>
          {article.title}
        </h2>
        {article.meta_desc && (
          <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>
            {article.meta_desc}
          </p>
        )}
        <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", color: "var(--muted)", fontSize: 12, fontWeight: 800 }}>
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span>{formatCount(article.view_count)} views</span>
          <span>·</span>
          <span>{formatCount(article.like_count)} likes</span>
        </div>
      </article>
    </Link>
  );
}
