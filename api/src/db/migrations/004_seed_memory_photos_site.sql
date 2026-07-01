INSERT INTO sites (id, name, niche, domain, theme)
VALUES ('site-006-memory-photos', 'Remake Memory', 'memory-photos', 'remakememory.com', 'sunset')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  niche = EXCLUDED.niche,
  domain = EXCLUDED.domain,
  theme = EXCLUDED.theme;
