import React from "react";

export interface Article {
  title: string;
  /** Short description / standfirst. */
  meta_desc?: string;
  /** Category label, shown as the eyebrow. */
  category?: string;
  /** Optional cover image URL; falls back to a gradient placeholder when absent. */
  image_url?: string | null;
  /** ISO date string. */
  published_at?: string | null;
  /** Marks the article as AI-generated (shows a ✨ AI tag). */
  ai_generated?: boolean;
}

export interface ArticleCardProps {
  /** The article to render. */
  article: Article;
  /** Gradient used for the placeholder block when there's no image. Defaults to `var(--grad-accent)`. */
  heroGradient?: string;
  /** Optional click handler (links are the host app's concern). */
  onClick?: () => void;
}

/**
 * Public-site article card used on homepages and category pages. Shows a cover
 * image (or gradient placeholder), an uppercase category eyebrow, the title,
 * a description, and a meta row with the date and an optional AI tag. Lifts on hover.
 */
export function ArticleCard({
  article,
  heroGradient = "var(--grad-accent)",
  onClick,
}: ArticleCardProps) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 16,
        transition: "border-color 0.2s, transform 0.2s",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {article.image_url ? (
        <img
          src={article.image_url}
          alt=""
          style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, marginBottom: 14 }}
        />
      ) : (
        <div style={{ height: 120, borderRadius: 8, marginBottom: 14, background: heroGradient }} />
      )}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--accent)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {article.category || "Article"}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, marginBottom: 10, margin: 0 }}>
        {article.title}
      </h2>
      {article.meta_desc && (
        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>
          {article.meta_desc}
        </p>
      )}
      <div style={{ marginTop: 14, fontSize: 12, color: "var(--muted)" }}>
        {date}
        {article.ai_generated && <span style={{ marginLeft: 8, color: "var(--accent)" }}>✨ AI</span>}
      </div>
    </div>
  );
}
