import React, { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function Revenue() {
  const [revenue, setRevenue] = useState([]);
  const [sites, setSites] = useState([]);
  const [siteId, setSiteId] = useState("");

  useEffect(() => { api.getSites().then(setSites).catch(() => {}); }, []);
  useEffect(() => {
    api.getRevenue(siteId ? { site_id: siteId, days: 30 } : { days: 30 }).then(setRevenue).catch(() => {});
  }, [siteId]);

  const total = revenue.reduce((s, r) => s + parseFloat(r.earnings_usd || 0), 0);
  const clicks = revenue.reduce((s, r) => s + (r.clicks || 0), 0);
  const impr   = revenue.reduce((s, r) => s + (r.impressions || 0), 0);
  const ctr    = impr ? ((clicks / impr) * 100).toFixed(2) : "0.00";

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Revenue</h1>
        <p style={{ color: "var(--muted)", marginTop: 4 }}>AdSense earnings across your network (last 30 days)</p>
      </div>

      <select value={siteId} onChange={e => setSiteId(e.target.value)} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "8px 12px", color: "var(--text)", fontSize: 13, marginBottom: 24 }}>
        <option value="">All Sites</option>
        {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Earnings", value: `$${total.toFixed(4)}`, color: "var(--success)" },
          { label: "Impressions",    value: impr.toLocaleString(),  color: "var(--accent)" },
          { label: "Clicks",         value: clicks.toLocaleString(), color: "var(--accent2)" },
          { label: "CTR",            value: `${ctr}%`,              color: "var(--warning)" },
        ].map(c => (
          <div key={c.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px" }}>
            <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Date", "Site", "Impressions", "Clicks", "CTR", "Earnings"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "var(--muted)", fontSize: 11, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {revenue.length === 0
              ? <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                  No revenue data yet. Connect your AdSense account and import data via API.
                </td></tr>
              : revenue.map(r => {
                const rctr = r.impressions ? ((r.clicks / r.impressions) * 100).toFixed(2) : "0.00";
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{r.date}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--muted)" }}>{r.site_id}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{r.impressions?.toLocaleString()}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{r.clicks?.toLocaleString()}</td>
                    <td style={{ padding: "11px 16px", fontSize: 13 }}>{rctr}%</td>
                    <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: "var(--success)" }}>${parseFloat(r.earnings_usd).toFixed(4)}</td>
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
