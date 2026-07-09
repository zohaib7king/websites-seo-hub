INSERT INTO sites (id, name, niche, domain, theme)
VALUES ('site-006-memory-photos', 'Remake Memory', 'memory-photos', 'memory.skoolai.cloud', 'sunset')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  niche = EXCLUDED.niche,
  domain = EXCLUDED.domain,
  theme = EXCLUDED.theme;
