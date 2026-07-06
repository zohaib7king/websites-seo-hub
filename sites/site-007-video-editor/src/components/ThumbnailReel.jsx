import Link from "next/link";

export default function ThumbnailReel({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="sw-reel-section" style={{ margin: "0 -24px" }}>
      <div className="sw-reel-track">
        {[...items, ...items].map((item, i) => {
          const inner = (
            <article className="sw-reel-card">
              <div className="sw-reel-thumb">
                <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
                <div className="sw-reel-play">▶</div>
              </div>
              <div className="sw-reel-meta">
                <span className="sw-reel-cat">{item.category || "Work"}</span>
                <strong>{item.title}</strong>
              </div>
            </article>
          );
          const key = `${item.id}-${i}`;
          return item.video_url ? (
            <a key={key} href={item.video_url} target="_blank" rel="noreferrer" className="sw-reel-link">
              {inner}
            </a>
          ) : (
            <div key={key} className="sw-reel-link">{inner}</div>
          );
        })}
      </div>
    </section>
  );
}

export function ThumbnailGrid({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="sw-thumb-grid">
      {items.map((item) => (
        <Link key={item.id} href={item.video_url || "/portfolio"} className="sw-thumb-card card-hover">
          <div className="sw-thumb-img">
            <img src={item.thumbnail_url} alt={item.title} />
          </div>
          <div className="sw-thumb-cap">
            <span>{item.category}</span>
            <strong>{item.title}</strong>
          </div>
        </Link>
      ))}
    </div>
  );
}
