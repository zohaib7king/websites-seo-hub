const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    // Surface the API's { error, detail } so callers (e.g. provisioning) show why.
    const body = await res.json().catch(() => null);
    const msg = body && (body.detail || body.error);
    throw new Error(msg ? `${body.error || "Error"}: ${body.detail || ""}`.trim() : `API error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Sites
  getSites:    ()           => req("/api/sites"),
  createSite:  (data)       => req("/api/sites", { method: "POST", body: JSON.stringify(data) }),
  updateSite:  (id, data)   => req(`/api/sites/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  provisionSite: (id)       => req(`/api/sites/${id}/provision`, { method: "POST" }),

  // Articles
  getArticles: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/api/articles${qs ? "?" + qs : ""}`);
  },
  createArticle: (data)     => req("/api/articles", { method: "POST", body: JSON.stringify(data) }),
  updateArticle: (id, data) => req(`/api/articles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteArticle: (id)       => req(`/api/articles/${id}`, { method: "DELETE" }),

  // AI
  generateArticle: (site_id, keyword) =>
    req("/api/ai/generate", { method: "POST", body: JSON.stringify({ site_id, keyword }) }),
  bulkQueue: (site_id, keywords) =>
    req("/api/ai/bulk", { method: "POST", body: JSON.stringify({ site_id, keywords }) }),

  // Revenue
  getRevenue: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/api/revenue${qs ? "?" + qs : ""}`);
  },

  // Queue
  getQueue: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/api/queue${qs ? "?" + qs : ""}`);
  },
};
