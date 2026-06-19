import React from "react";
import { Card, Badge } from "@zoyzoy/ui";

export const Flat = () => (
  <div style={{ padding: 24, width: 380, fontFamily: "var(--font)", color: "var(--text)" }}>
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Finance Daily</div>
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 3 }}>
            site-002 · personal-finance
          </div>
        </div>
        <Badge tone="success">active</Badge>
      </div>
    </Card>
  </div>
);

export const Gradient = () => (
  <div style={{ padding: 24, width: 380, fontFamily: "var(--font)", color: "var(--text)" }}>
    <Card gradient>
      <div style={{ fontWeight: 600, fontSize: 15 }}>Network overview</div>
      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
        4 sites · 28 published articles
      </div>
    </Card>
  </div>
);

export const Emphasized = () => (
  <div style={{ padding: 24, width: 380, fontFamily: "var(--font)", color: "var(--text)" }}>
    <Card gradient emphasized padding={24}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>New Site</div>
      <div style={{ color: "var(--muted)", fontSize: 13 }}>
        Fill in the details to add a website to the network.
      </div>
    </Card>
  </div>
);
