INSERT INTO sites (id, name, niche, domain, theme)
VALUES ('site-005-gulf-jobs', 'Gulf Jobs Guide', 'gulf-jobs', 'gulfjobss.com', 'royal')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  niche = EXCLUDED.niche,
  domain = EXCLUDED.domain,
  theme = EXCLUDED.theme;
