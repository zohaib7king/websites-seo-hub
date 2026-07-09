-- Contact page + inquiry email + WhatsApp prefill (admin-managed)
ALTER TABLE editor_settings ADD COLUMN IF NOT EXISTS contact_title TEXT;
ALTER TABLE editor_settings ADD COLUMN IF NOT EXISTS contact_body TEXT;
ALTER TABLE editor_settings ADD COLUMN IF NOT EXISTS whatsapp_message TEXT;
ALTER TABLE editor_settings ADD COLUMN IF NOT EXISTS notify_email TEXT;

UPDATE editor_settings SET
  contact_title = COALESCE(contact_title, 'Let''s edit your next video'),
  contact_body = COALESCE(contact_body, 'Tell us about your project, deadline, and style. We usually reply within 24 hours.'),
  whatsapp_message = COALESCE(whatsapp_message, 'Hi! I would like to discuss a video editing project.'),
  notify_email = COALESCE(notify_email, email)
WHERE site_id = 'site-007-video-editor';
