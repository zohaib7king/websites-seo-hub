import { useEffect, useRef, useState } from "react";
import { authHeaders, getAuth, requireLogin } from "../lib/authClient";
import { formatCount } from "../lib/seed";

export default function ContentStats({ type, slug, id, initialViews = 0, initialLikes = 0 }) {
  const [views, setViews] = useState(Number(initialViews || 0));
  const [likes, setLikes] = useState(Number(initialLikes || 0));
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const trackedView = useRef(false);

  const viewApi = type === "article" ? "/api/article-stats/view"
    : type === "story" ? "/api/pet-stories/view"
    : "/api/user-pet-stories/view";

  const likeApi = type === "article" ? "/api/article-stats/like"
    : type === "story" ? "/api/pet-stories/like"
    : "/api/user-pet-stories/like";

  const likeStatusApi = type === "article"
    ? `/api/article-stats/like-status?slug=${encodeURIComponent(slug)}`
    : type === "story"
    ? `/api/pet-stories/like-status?slug=${encodeURIComponent(slug)}`
    : `/api/user-pet-stories/like-status?id=${encodeURIComponent(id)}`;

  const viewBody = type === "user-story" ? { id } : { slug };

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    fetch(viewApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(viewBody),
    })
      .then(res => res.json())
      .then(payload => {
        if (payload.view_count != null) setViews(Number(payload.view_count));
        if (payload.like_count != null) setLikes(Number(payload.like_count));
      })
      .catch(() => {});
  }, [viewApi, slug, id, type]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!getAuth()?.token) { setLiked(false); return; }
      try {
        const res = await fetch(likeStatusApi, { headers: authHeaders() });
        const payload = await res.json();
        if (res.ok) setLiked(Boolean(payload.liked));
      } catch { setLiked(false); }
    };
    fetchLikeStatus();
    window.addEventListener("pets-auth-changed", fetchLikeStatus);
    return () => window.removeEventListener("pets-auth-changed", fetchLikeStatus);
  }, [likeStatusApi]);

  const toggleLike = async () => {
    if (!getAuth()?.token) { requireLogin(); return; }
    setLoading(true);
    try {
      const res = await fetch(likeApi, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(viewBody),
      });
      const payload = await res.json();
      if (res.status === 401) { requireLogin(); return; }
      if (!res.ok) throw new Error(payload.error);
      setLiked(Boolean(payload.liked));
      setLikes(Number(payload.like_count || 0));
      setViews(Number(payload.view_count || views));
    } catch { /* keep UI */ } finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 999, padding: "8px 14px", color: "var(--muted)", fontSize: 13, fontWeight: 800 }}>
        {formatCount(views)} views
      </span>
      <button
        type="button"
        onClick={toggleLike}
        disabled={loading}
        style={{
          border: `1px solid ${liked ? "var(--accent)" : "var(--border)"}`,
          background: liked ? "color-mix(in srgb,var(--accent) 12%,#fff)" : "#fff",
          color: liked ? "var(--accent)" : "var(--muted)",
          borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 900,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {liked ? "❤️ Liked" : "🤍 Like"} · {formatCount(likes)}
      </button>
    </div>
  );
}
