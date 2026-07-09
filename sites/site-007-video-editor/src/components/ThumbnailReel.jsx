import Link from "next/link";

export default function ThumbnailReel({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="sw-reel-section" style={{ margin: "0 -24px" }}>
      <div className="sw-reel-track">
        {[...items, ...items].map((item, i) => (
          <article key={`${item.id}-${i}`} className="sw-reel-link sw-reel-card">
            <div className="sw-reel-thumb">
              <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
            </div>
            <div className="sw-reel-meta">
              <span className="sw-reel-cat">{item.category || "Gallery"}</span>
              <strong>{item.title}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ThumbnailGrid({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="sw-thumb-grid">
      {items.map((item) => (
        <article key={item.id} className="sw-thumb-card card-hover">
          <div className="sw-thumb-img">
            <img src={item.thumbnail_url} alt={item.title} />
          </div>
          <div className="sw-thumb-cap">
            <span>{item.category}</span>
            <strong>{item.title}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}
