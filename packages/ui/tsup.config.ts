import { defineConfig } from "tsup";

// Emits dist/index.js (ESM) + dist/index.d.ts. React stays external so the
// design-sync bundle and the host app share one React instance.
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  outExtension: () => ({ js: ".js" }),
});
