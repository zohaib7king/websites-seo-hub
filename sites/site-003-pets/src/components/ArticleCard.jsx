import Link from "next/link";
import { formatCount, fmtDate, readingTime } from "../lib/seed";

export default function ArticleCard({ article }) {
  const date = article.published_at ? fmtDate(article.published_at) : null;

  return (
    <Link href={`/article/${article.slug}`} style={{ display: "block", height: "100%" }}>
      <article className="card-hover" style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", height: "100%", boxShadow: "0 8px 24px rgba(249,115,22,.08)" }}>
        {article.image_url ? (
          <img src={article.image_url} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} />
        ) : (
          <div style={{ height: 140, background: "var(--hero)" }} />
        )}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {article.category || "Article"}
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.4, margin: 0 }}>{article.title}</h2>
          {article.meta_desc && (
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>{article.meta_desc}</p>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", color: "var(--muted)", fontSize: 12, fontWeight: 800 }}>
            {date && <span>{date}</span>}
            {date && <span>·</span>}
            <span>{formatCount(article.view_count)} views</span>
            <span>·</span>
            <span>{formatCount(article.like_count)} likes</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
