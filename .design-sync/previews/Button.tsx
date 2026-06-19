import React from "react";
import { Button } from "@zoyzoy/ui";

export const Variants = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 24 }}>
    <Button variant="primary">+ Add Site</Button>
    <Button variant="secondary">Cancel</Button>
    <Button variant="outline">Provision files</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 24 }}>
    <Button variant="primary" size="md">Create Site</Button>
    <Button variant="outline" size="sm">Visit →</Button>
  </div>
);

export const Disabled = () => (
  <div style={{ padding: 24 }}>
    <Button variant="primary" disabled>Provisioning…</Button>
  </div>
);
