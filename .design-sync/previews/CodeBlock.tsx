import React from "react";
import { CodeBlock } from "@zoyzoy/ui";

export const Command = () => (
  <div style={{ padding: 24, width: 460 }}>
    <CodeBlock>docker compose up -d --build site-003-pets nginx</CodeBlock>
  </div>
);

export const InPanel = () => (
  <div style={{ padding: 24, width: 460, fontFamily: "var(--font)", color: "var(--muted)", fontSize: 12 }}>
    <div style={{ marginBottom: 8 }}>Now run on the host to build &amp; start it:</div>
    <CodeBlock>curl -X POST http://localhost:4000/api/ai/generate</CodeBlock>
  </div>
);
