import React from "react";
import { StatCard } from "@zoyzoy/ui";

export const DashboardGrid = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, padding: 24, width: 560 }}>
    <StatCard label="Total Sites" value={4} sub="Active websites" />
    <StatCard label="Published Articles" value={28} sub="Live content" color="var(--success)" grad="var(--grad-success)" />
    <StatCard label="Drafts" value={6} sub="Awaiting review" color="var(--warning)" grad="var(--grad-danger)" />
    <StatCard label="Revenue (30d)" value="$1,240.00" sub="AdSense earnings" color="var(--accent2)" grad="var(--grad-accent)" />
  </div>
);

export const Single = () => (
  <div style={{ padding: 24, width: 280 }}>
    <StatCard label="Revenue (30d)" value="$1,240.00" sub="AdSense earnings" color="var(--accent2)" grad="var(--grad-accent)" />
  </div>
);
