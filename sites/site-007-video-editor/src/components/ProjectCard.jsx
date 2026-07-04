import Link from "next/link";

export default function ProjectCard({ item }) {
  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="card-hover"
      style={{
        display: "block", background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 22, overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg)" }}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--hero)", opacity: 0.35 }} />
        )}
        <div className="play-badge"><span>▶</span></div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ color: "var(--accent2)", fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6 }}>
          {item.category || "Project"}
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 6 }}>{item.title}</h3>
        {item.description && (
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.6 }}>
            {item.description.length > 110 ? `${item.description.slice(0, 110)}…` : item.description}
          </p>
        )}
      </div>
    </Link>
  );
}
