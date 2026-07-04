import Link from "next/link";

const ACCENTS = [
  "linear-gradient(90deg,#ff4d9a,#a855f7)",
  "linear-gradient(90deg,#38bdf8,#34d399)",
  "linear-gradient(90deg,#fbbf24,#ff4d9a)",
  "linear-gradient(90deg,#a855f7,#38bdf8)",
];

export default function ProjectCard({ item, accent = 0 }) {
  const bar = ACCENTS[accent % ACCENTS.length];

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="card-hover"
      style={{
        display: "block", background: "var(--surface)",
        border: "1px solid color-mix(in srgb, var(--accent) 22%, var(--border))",
        borderRadius: 24, overflow: "hidden",
      }}
    >
      <div style={{ height: 4, background: bar }} />
      <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--bg)" }}>
        {item.thumbnail_url ? (
          <img src={item.thumbnail_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--hero)", opacity: 0.55 }} />
        )}
        <div className="play-badge"><span>▶</span></div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{
          fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 6,
          background: bar, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
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
