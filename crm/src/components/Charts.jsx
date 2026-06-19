import React, { useId } from "react";

// Lightweight inline-SVG charts — no external libraries (per repo rules).
// All colors come from the CSS-variable token system.

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function buildPath(values, w, h, pad = 4) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;
  return values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });
}

/**
 * Filled area + line chart. `data`: number[]. Scales to its container width.
 */
export function AreaChart({ data = [], height = 160, stroke = "var(--accent)", fillFrom = "rgba(99,102,241,0.35)", fillTo = "rgba(99,102,241,0)" }) {
  const gid = useId();
  const w = 600;
  const h = height;
  if (!data.length) return <EmptyChart height={height} />;
  const pts = buildPath(data, w, h, 8);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${h - 8} L${pts[0].x.toFixed(1)},${h - 8} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      <defs>
        <linearGradient id={`area-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillFrom} />
          <stop offset="100%" stopColor={fillTo} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#area-${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {pts.length <= 31 && (
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3.5" fill={stroke} />
      )}
    </svg>
  );
}

/**
 * Vertical bar chart. `data`: {label?, value}[].
 */
export function BarChart({ data = [], height = 160, color = "var(--accent2)" }) {
  const w = 600;
  const h = height;
  if (!data.length) return <EmptyChart height={height} />;
  const values = data.map((d) => (typeof d === "number" ? d : d.value));
  const max = Math.max(...values, 1);
  const pad = 8;
  const gap = 4;
  const barW = (w - pad * 2 - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }}>
      {values.map((v, i) => {
        const bh = clamp((v / max) * (h - pad * 2), v > 0 ? 3 : 0, h);
        const x = pad + i * (barW + gap);
        const y = h - pad - bh;
        return <rect key={i} x={x} y={y} width={barW} height={bh} rx="3" fill={color} opacity={0.55 + 0.45 * (v / max)} />;
      })}
    </svg>
  );
}

/**
 * Tiny inline sparkline for KPI cards. `data`: number[].
 */
export function Sparkline({ data = [], width = 96, height = 32, stroke = "var(--accent2)" }) {
  if (!data.length) return null;
  const pts = buildPath(data, width, height, 3);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2.5" fill={stroke} />
    </svg>
  );
}

/**
 * Thin progress / donut-free ring substitute — a horizontal track + fill bar.
 */
export function ProgressBar({ value = 0, max = 100, color = "var(--grad-accent)", height = 8 }) {
  const pct = clamp((value / (max || 1)) * 100, 0, 100);
  return (
    <div style={{ width: "100%", height, background: "var(--bg)", borderRadius: 999, overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
    </div>
  );
}

function EmptyChart({ height }) {
  return (
    <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>
      No data yet
    </div>
  );
}
