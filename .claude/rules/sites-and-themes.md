# Sites & theme-system guardrails

- Theme presets live in `sites/<id>/src/themes.js` (6 presets: midnight, daylight, ocean,
  sunset, forest, royal) and a preview copy in `crm/src/themes.js`. **The theme `name` keys
  must stay in sync across all of them.**
- Each page's `getServerSideProps` fetches the site (`getSite()` in `src/lib/data.js`) and
  passes `theme` to `<Layout>`. `Layout.jsx` injects the theme as CSS variables
  (`--bg/--surface/--accent/--hero/…`) so the whole page recolors. New pages MUST pass `theme`.
- Article HTML from the AI is styled via the `.article-body` rules in `article/[slug].jsx`
  using CSS vars; `<blockquote>` renders as a "Key Takeaway" callout. The AI prompt
  (`api/src/services/generator.js`) is expected to emit a lead paragraph, ≥1 blockquote,
  H2/H3 structure, and a conclusion CTA.
- `articles.image_url` is optional; when empty the article/cards show a gradient placeholder
  built from `--hero`.
