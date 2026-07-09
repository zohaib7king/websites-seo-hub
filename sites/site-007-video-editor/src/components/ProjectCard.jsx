import Link from "next/link";

export default function ProjectCard({ item }) {
  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="card-hover sw-thumb-card"
      style={{ display: "block" }}
    >
      <div className="sw-thumb-img" style={{ position: "relative" }}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--border)" }} />
        )}
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#fff", opacity: 0, transition: "opacity .25s",
          background: "rgba(0,0,0,.35)",
        }} className="sw-reel-play">▶</div>
      </div>
      <div className="sw-thumb-cap">
        <span>{item.category || "Project"}</span>
        <strong>{item.title}</strong>
        {item.description && (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8, lineHeight: 1.55 }}>
            {item.description.length > 90 ? `${item.description.slice(0, 90)}…` : item.description}
          </p>
        )}
      </div>
    </Link>
  );
}
