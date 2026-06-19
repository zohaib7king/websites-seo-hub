import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { Card, Badge } from "@zoyzoy/ui";
import { AreaChart, BarChart, Sparkline } from "../components/Charts.jsx";

// ── helpers ──────────────────────────────────────────────
const fmtUSD = (n) => `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtNum = (n) => (n || 0).toLocaleString("en-US");
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

function deltaPct(curr, prev) {
  if (!prev) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

// Last N day buckets (ascending) with a value reducer over rows.
function bucketByDay(rows, days, dateField, valueFn) {
  const today = new Date();
  const keys = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    keys.push(dayKey(d));
  }
  const map = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const r of rows) {
    const raw = r[dateField];
    if (!raw) continue;
    const k = dayKey(raw);
    if (k in map) map[k] += valueFn(r);
  }
  return keys.map((k) => map[k]);
}

// ── KPI card (module scope) ──────────────────────────────
function KpiCard({ label, value, icon, delta, deltaLabel, sub, series, accent = "var(--accent)", grad = "var(--grad-accent)" }) {
  const hasDelta = typeof delta === "number";
  const up = hasDelta && delta >= 0;
  return (
    <Card gradient padding={20} style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: grad }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: "var(--bg)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
        }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", marginTop: 10, letterSpacing: "-0.02em" }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, minHeight: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasDelta && (
            <Badge tone={up ? "success" : "danger"}>{up ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</Badge>
          )}
          <span style={{ color: "var(--muted)", fontSize: 11 }}>{deltaLabel || sub}</span>
        </div>
        {series && series.length > 1 && <Sparkline data={series} stroke={accent} />}
      </div>
    </Card>
  );
}

function PanelHeader({ title, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
      {action}
    </div>
  );
}

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [articles, setArticles] = useState([]);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    api.getSites().then(setSites).catch(() => {});
    api.getArticles().then(setArticles).catch(() => {});
    api.getRevenue({ days: 30 }).then(setRevenue).catch(() => {});
  }, []);

  // ── derived metrics ──
  const revSorted = [...revenue].sort((a, b) => new Date(a.date) - new Date(b.date));
  const earningsSeries = bucketByDay(revenue, 30, "date", (r) => parseFloat(r.earnings_usd || 0));
  const clicksSeries = bucketByDay(revenue, 30, "date", (r) => parseInt(r.clicks || 0, 10));

  const totalEarnings = earningsSeries.reduce((s, v) => s + v, 0);
  const totalClicks = clicksSeries.reduce((s, v) => s + v, 0);
  const totalImpr = revenue.reduce((s, r) => s + parseInt(r.impressions || 0, 10), 0);
  const ctr = totalImpr ? (totalClicks / totalImpr) * 100 : 0;

  const last7 = (arr) => arr.slice(-7).reduce((s, v) => s + v, 0);
  const prev7 = (arr) => arr.slice(-14, -7).reduce((s, v) => s + v, 0);
  const revDelta = deltaPct(last7(earningsSeries), prev7(earningsSeries));
  const clickDelta = deltaPct(last7(clicksSeries), prev7(clicksSeries));

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");
  // Normalize each published article to one effective date, then bucket once.
  const pubEffective = published.map((a) => ({ d: a.published_at || a.created_at }));
  const pubSeries14 = bucketByDay(pubEffective, 14, "d", () => 1);
  const pubDelta = deltaPct(
    published.filter((a) => withinDays(a.published_at || a.created_at, 7)).length,
    published.filter((a) => betweenDays(a.published_at || a.created_at, 7, 14)).length
  );

  const recent = [...articles]
    .sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0))
    .slice(0, 6);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ color: "var(--muted)", marginTop: 4, fontSize: 13.5 }}>Overview of your entire content network</p>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        <KpiCard
          label="Total Sites" icon="🌐" value={fmtNum(sites.length)}
          sub={`${sites.filter((s) => s.status === "active").length} active`}
          grad="var(--grad-accent)" accent="var(--accent)"
        />
        <KpiCard
          label="Published Articles" icon="📝" value={fmtNum(published.length)}
          delta={pubDelta} deltaLabel="vs last week" series={pubSeries14}
          grad="var(--grad-success)" accent="var(--success)"
        />
        <KpiCard
          label="Revenue (30d)" icon="💰" value={fmtUSD(totalEarnings)}
          delta={revDelta} deltaLabel="vs prev 7d" series={earningsSeries.slice(-14)}
          grad="var(--grad-accent)" accent="var(--accent2)"
        />
        <KpiCard
          label="Clicks (30d)" icon="👆" value={fmtNum(totalClicks)}
          delta={clickDelta} deltaLabel={`${ctr.toFixed(2)}% CTR`} series={clicksSeries.slice(-14)}
          grad="var(--grad-danger)" accent="var(--warning)"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card padding={22}>
          <PanelHeader
            title="Revenue — last 30 days"
            action={<span style={{ color: "var(--accent2)", fontWeight: 700, fontSize: 15 }}>{fmtUSD(totalEarnings)}</span>}
          />
          <AreaChart data={earningsSeries} height={200} />
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: 11, marginTop: 8 }}>
            <span>{revSorted[0]?.date ? new Date(revSorted[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span>
            <span>Today</span>
          </div>
        </Card>
        <Card padding={22}>
          <PanelHeader title="Articles / day" action={<Badge tone="accent">14d</Badge>} />
          <BarChart data={pubSeries14} height={200} color="var(--accent)" />
          <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 8 }}>
            {pubSeries14.reduce((s, v) => s + v, 0)} published · {drafts.length} drafts
          </div>
        </Card>
      </div>

      {/* Activity + sites row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card padding={22}>
          <PanelHeader title="Recent activity" action={<Link to="/articles" style={{ color: "var(--accent2)", fontSize: 12 }}>View all →</Link>} />
          {recent.length === 0 ? (
            <Empty text="No articles yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recent.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--grad-surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {a.ai_generated ? "✨" : "📄"}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>
                      {a.category || "Uncategorized"} · {a.published_at || a.created_at ? new Date(a.published_at || a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </div>
                  </div>
                  <Badge tone={a.status === "published" ? "success" : a.status === "draft" ? "warning" : "muted"}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padding={22}>
          <PanelHeader title="Sites" action={<Link to="/sites" style={{ color: "var(--accent2)", fontSize: 12 }}>Manage →</Link>} />
          {sites.length === 0 ? (
            <Empty text="No sites yet. Go to Sites to add one." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sites.map((s) => {
                const count = articles.filter((a) => a.site_id === s.id).length;
                return (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{s.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{s.niche} · {count} article{count === 1 ? "" : "s"}</div>
                    </div>
                    <Badge tone={s.status === "active" ? "success" : "muted"}>{s.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return <div style={{ color: "var(--muted)", fontSize: 13, padding: "16px 0" }}>{text}</div>;
}

function withinDays(date, n) {
  if (!date) return false;
  const diff = (Date.now() - new Date(date).getTime()) / 86400000;
  return diff >= 0 && diff <= n;
}
function betweenDays(date, lo, hi) {
  if (!date) return false;
  const diff = (Date.now() - new Date(date).getTime()) / 86400000;
  return diff > lo && diff <= hi;
}
