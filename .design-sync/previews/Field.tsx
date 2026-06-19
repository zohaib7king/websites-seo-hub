import React from "react";
import { Field, Input } from "@zoyzoy/ui";

export const TextField = () => (
  <div style={{ padding: 24, width: 360 }}>
    <Field label="DISPLAY NAME">
      <Input placeholder="Pet Lovers Daily" />
    </Field>
  </div>
);

export const SelectField = () => (
  <div style={{ padding: 24, width: 360 }}>
    <Field label="NICHE">
      <select
        className="zz-input"
        defaultValue="personal-finance"
        style={{
          width: "100%",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "9px 12px",
          color: "var(--text)",
          fontSize: 13,
        }}
      >
        <option>artificial-intelligence</option>
        <option>personal-finance</option>
        <option>pet-care</option>
      </select>
    </Field>
  </div>
);

export const Stacked = () => (
  <div style={{ padding: 24, width: 360 }}>
    <Field label="SITE ID (no spaces)">
      <Input placeholder="site-003-pets" />
    </Field>
    <Field label="DOMAIN">
      <Input placeholder="petlovers.com" />
    </Field>
  </div>
);
