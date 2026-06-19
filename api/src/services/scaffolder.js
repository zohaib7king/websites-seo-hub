// Site scaffolder — "Option 1: scaffold-to-disk".
// Given a site that already exists as a DB row, generate everything the platform
// CANNOT create from a DB record alone: the Next.js app folder, a docker-compose
// service, and the nginx routing blocks. It deliberately does NOT build/start any
// container (that needs `docker compose up --build` on the host) — it only writes
// files, then returns the next steps.
//
// Repo location: in Docker the repo is bind-mounted at REPO_ROOT (/workspace).
// Outside Docker it resolves to the repo root relative to this file.

const fs = require("fs/promises");
const path = require("path");

const REPO_ROOT = process.env.REPO_ROOT || path.resolve(__dirname, "..", "..", "..");
const TEMPLATE_ID = "site-001-ai"; // folder we clone from

// Per-niche header nav + hero copy. Falls back to a generic set for unknown niches.
const NICHE = {
  "artificial-intelligence": {
    nav: ["AI Tools", "News", "Tutorials", "Business AI"],
    highlight: "Artificial Intelligence",
    lead: "Daily news, tool reviews, and practical tutorials for AI beginners and professionals.",
  },
  "personal-finance": {
    nav: ["Investing", "Saving", "Crypto", "Budgeting"],
    highlight: "Personal Finance",
    lead: "Practical money guides on investing, saving, and building long-term wealth.",
  },
  "pet-care": {
    nav: ["Dogs", "Cats", "Nutrition", "Health"],
    highlight: "Happy, Healthy Pets",
    lead: "Vet-informed guides on nutrition, training, and everyday pet health.",
  },
  "health-wellness": {
    nav: ["Fitness", "Nutrition", "Mental Health", "Wellness"],
    highlight: "Health & Wellness",
    lead: "Evidence-based guides on fitness, nutrition, and feeling your best.",
  },
  technology: {
    nav: ["Gadgets", "Software", "Reviews", "How-To"],
    highlight: "Technology",
    lead: "Hands-on reviews, buying guides, and how-tos across consumer tech.",
  },
};

function nicheConfig(niche) {
  return NICHE[niche] || {
    nav: ["Latest", "Guides", "Reviews", "News"],
    highlight: niche ? niche.replace(/-/g, " ") : "Our Topics",
    lead: "Fresh articles, guides, and reviews — updated regularly.",
  };
}

const SITE_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

// Replace the first occurrence of `find` (a literal string) with `repl`; throw if
// the marker is missing so we fail loudly instead of silently producing a broken file.
function replaceOnce(content, find, repl, label) {
  if (!content.includes(find)) {
    throw new Error(`Scaffold marker not found (${label}); template may have changed`);
  }
  return content.replace(find, repl);
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

// Find the next free site host port by scanning docker-compose for "<port>:3000" maps.
function nextSitePort(compose) {
  const ports = [...compose.matchAll(/"(\d+):3000"/g)].map(m => Number(m[1]));
  const max = ports.length ? Math.max(...ports) : 3002;
  return Math.max(max + 1, 3003);
}

async function scaffoldSite({ id, name, niche, domain, theme }) {
  if (!id || !SITE_ID_RE.test(id)) {
    throw new Error("Invalid site id (use lowercase letters, digits, hyphens; e.g. site-003-pets)");
  }
  if (id === TEMPLATE_ID) throw new Error("That id is the template site");

  const siteDir = path.join(REPO_ROOT, "sites", id);
  if (await exists(siteDir)) {
    throw new Error(`sites/${id} already exists — refusing to overwrite`);
  }

  const cfg = nicheConfig(niche);
  const displayName = name || id;
  const composePath = path.join(REPO_ROOT, "docker-compose.yml");
  const nginxPath = path.join(REPO_ROOT, "nginx", "nginx.conf");

  // Read the two infra files up front so a parse/marker failure aborts BEFORE we
  // write the site folder (keeps the repo from being left half-scaffolded).
  let compose = await fs.readFile(composePath, "utf8");
  let nginx = await fs.readFile(nginxPath, "utf8");

  if (compose.includes(`\n  ${id}:\n`)) throw new Error(`docker-compose already has a "${id}" service`);

  const port = nextSitePort(compose);
  const upstream = `site_${port}`;

  // ── 1. Clone the template folder (skip node_modules / .next build output) ──
  const templateDir = path.join(REPO_ROOT, "sites", TEMPLATE_ID);
  if (!(await exists(templateDir))) throw new Error(`Template ${TEMPLATE_ID} not found at ${templateDir}`);
  await fs.cp(templateDir, siteDir, {
    recursive: true,
    filter: (src) => !/[\\/](node_modules|\.next)([\\/]|$)/.test(src),
  });

  // ── 2. package.json name ──
  const pkgPath = path.join(siteDir, "package.json");
  const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  pkg.name = id;
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // ── 3. Layout.jsx — SITE_NAME, NAV, meta description ──
  const layoutPath = path.join(siteDir, "src", "components", "Layout.jsx");
  let layout = await fs.readFile(layoutPath, "utf8");
  layout = replaceOnce(layout,
    'const SITE_NAME = "AI Insider Daily";',
    `const SITE_NAME = ${JSON.stringify(displayName)};`, "Layout SITE_NAME");
  layout = replaceOnce(layout,
    'const NAV = ["AI Tools", "News", "Tutorials", "Business AI"];',
    `const NAV = ${JSON.stringify(cfg.nav)};`, "Layout NAV");
  layout = replaceOnce(layout,
    'content={description || "Your daily source for AI news, tools, and tutorials."}',
    `content={description || ${JSON.stringify(`${displayName} — ${cfg.lead}`)}}`, "Layout description");
  await fs.writeFile(layoutPath, layout);

  // ── 4. index.jsx — hero copy + page title ──
  const indexPath = path.join(siteDir, "src", "pages", "index.jsx");
  let index = await fs.readFile(indexPath, "utf8");
  index = replaceOnce(index, 'title="AI News & Tools"', `title=${JSON.stringify(displayName)}`, "index title");
  index = replaceOnce(index,
    "            Artificial Intelligence\n",
    `            ${cfg.highlight}\n`, "index hero highlight");
  index = replaceOnce(index,
    "          Daily news, tool reviews, and practical tutorials for AI beginners and professionals.\n",
    `          ${cfg.lead}\n`, "index hero lead");
  await fs.writeFile(indexPath, index);

  // public/.gitkeep already cloned (cp copies it) — Dockerfile COPY /app/public needs it.

  // ── 5. docker-compose.yml — new service, inserted before the nginx block ──
  const serviceBlock =
`  # ── Site: ${id} (auto-provisioned) ──────────────────────
  ${id}:
    build:
      context: ./sites/${id}
      args:
        NEXT_PUBLIC_API_URL: http://api:4000
        NEXT_PUBLIC_SITE_ID: ${id}
    container_name: zoyzoy_${id}
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000
      NEXT_PUBLIC_SITE_ID: ${id}
    depends_on:
      - api
    ports:
      - "${port}:3000"
    networks:
      - zoyzoy_net

`;
  compose = replaceOnce(compose, "  # ── Nginx Reverse Proxy", serviceBlock + "  # ── Nginx Reverse Proxy", "compose nginx marker");
  // add the new service to nginx depends_on (the only block with "- crm")
  compose = replaceOnce(compose, "    depends_on:\n      - crm\n", `    depends_on:\n      - crm\n      - ${id}\n`, "compose nginx depends_on");
  await fs.writeFile(composePath, compose);

  // ── 6. nginx.conf — upstream + server block ──
  nginx = replaceOnce(nginx, "\n  # CRM Admin Dashboard",
    `\n  upstream ${upstream} { server ${id}:3000; }\n\n  # CRM Admin Dashboard`, "nginx upstream marker");
  const serverNames = domain
    ? `${id}.zoyzoy.local ${domain} www.${domain}`
    : `${id}.zoyzoy.local`;
  const serverBlock =
`
  # Site: ${id} (auto-provisioned)
  server {
    listen ${port};
    server_name ${serverNames};
    location / { proxy_pass http://${upstream}; proxy_set_header Host $host; }
  }
`;
  // insert before the final closing brace of the http { } block
  nginx = nginx.replace(/\}\s*$/, serverBlock + "}\n");
  await fs.writeFile(nginxPath, nginx);

  return {
    id,
    name: displayName,
    niche,
    theme: theme || "midnight",
    port,
    upstream,
    siteDir: path.relative(REPO_ROOT, siteDir).replace(/\\/g, "/"),
    files: ["docker-compose.yml", "nginx/nginx.conf", `sites/${id}/`],
    rebuildCommand: `docker compose up -d --build ${id} nginx`,
    localUrl: `http://localhost:${port}`,
    note: "Files generated. Run the rebuild command on the host to build & start the site, then hard-refresh.",
  };
}

module.exports = { scaffoldSite };
