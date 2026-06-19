import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";

const STATUS_COLORS = {
  published: { bg: "rgba(34,197,94,0.15)", fg: "var(--success)" },
  draft:     { bg: "rgba(245,158,11,0.15)", fg: "var(--warning)" },
  scheduled: { bg: "rgba(99,102,241,0.15)", fg: "var(--accent)" },
};

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [sites, setSites] = useState([]);
  const [filter, setFilter] = useState({ site_id: "", status: "" });
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const visible = q
    ? articles.filter((a) =>
        [a.title, a.category, a.slug, a.site_id]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
    : articles;

  useEffect(() => {
    api.getSites().then(setSites).catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    if (filter.site_id) params.site_id = filter.site_id;
    if (filter.status)  params.status  = filter.status;
    api.getArticles(params).then(setArticles).catch(() => {});
  }, [filter]);

  async function changeStatus(id, status) {
    await api.updateArticle(id, { status });
    setArticles(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  async function remove(id) {
    if (!confirm("Delete this article?")) return;
    await api.deleteArticle(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  }

  const sel = { background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", color: "var(--text)", fontSize: 13 };

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Articles</h1>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>All content across your network</p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select value={filter.site_id} onChange={e => setFilter(p => ({ ...p, site_id: e.target.value }))} style={sel}>
          <option value="">All Sites</option>
          {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))} style={sel}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
        {q && (
          <button
            onClick={() => setSearchParams({})}
            className="zz-btn"
            style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.15)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 999, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}
          >
            Search: “{q}” · {visible.length} ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Title", "Site", "Category", "Status", "AI?", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0
              ? <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>{q ? `No articles match “${q}”.` : "No articles yet. Generate some in the AI Generator!"}</td></tr>
              : visible.map(a => {
                const sc = STATUS_COLORS[a.status] || STATUS_COLORS.draft;
                return (
                  <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", maxWidth: 280 }}>
                      <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{a.slug}</div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>{a.site_id}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>{a.category || "—"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.fg }}>{a.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: a.ai_generated ? "var(--accent)" : "var(--muted)", fontSize: 12 }}>
                      {a.ai_generated ? "✨ AI" : "Human"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", fontSize: 12 }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {a.status === "draft" && (
                          <button onClick={() => changeStatus(a.id, "published")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(34,197,94,0.15)", color: "var(--success)", fontSize: 11, fontWeight: 600 }}>Publish</button>
                        )}
                        {a.status === "published" && (
                          <button onClick={() => changeStatus(a.id, "draft")} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(245,158,11,0.15)", color: "var(--warning)", fontSize: 11, fontWeight: 600 }}>Unpublish</button>
                        )}
                        <button onClick={() => remove(a.id)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: 11, fontWeight: 600 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
