import Link from "next/link";
import { formatCount, fmtDate } from "../lib/seed";

export default function StoryCard({ story }) {
  const date = story.published_at ? fmtDate(story.published_at) : null;

  return (
    <Link href={`/stories/${story.slug}`} style={{ display: "block", height: "100%" }}>
      <article className="card-hover" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", height: "100%", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
        {story.image_url ? (
          <img src={story.image_url} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} />
        ) : (
          <div style={{ height: 140, background: "linear-gradient(135deg,#a855f7,#ec4899)" }} />
        )}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#7c3aed", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {story.category || "Story"}
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.4, margin: 0, color: "#0f172a" }}>{story.title}</h2>
          {story.excerpt && (
            <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>{story.excerpt}</p>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>
            {date && <span>{date}</span>}
            {date && <span>·</span>}
            <span>{formatCount(story.view_count)} views</span>
            <span>·</span>
            <span>{formatCount(story.like_count)} likes</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
