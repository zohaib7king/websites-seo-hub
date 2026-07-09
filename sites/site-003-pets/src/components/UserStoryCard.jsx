import Link from "next/link";
import { formatCount, fmtDate } from "../lib/seed";

export default function UserStoryCard({ story }) {
  const date = story.created_at ? fmtDate(story.created_at) : null;
  const author = story.author_email ? story.author_email.split("@")[0] : "Pet Lover";

  return (
    <Link href={`/user-stories/${story.id}`} style={{ display: "block", height: "100%" }}>
      <article className="card-hover" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, overflow: "hidden", height: "100%", boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
        {story.image_url ? (
          <img src={story.image_url} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} />
        ) : (
          <div style={{ height: 140, background: "linear-gradient(135deg,#22c55e,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🐾</div>
        )}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#16a34a", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {story.pet_type || "Community"} · by {author}
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.4, margin: 0, color: "#0f172a" }}>{story.title}</h2>
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
