import React from "react";
import { Input } from "@zoyzoy/ui";

export const Default = () => (
  <div style={{ padding: 24, width: 360 }}>
    <Input defaultValue="AI Insider Daily" />
  </div>
);

export const Placeholder = () => (
  <div style={{ padding: 24, width: 360 }}>
    <Input placeholder="petlovers.com" />
  </div>
);
