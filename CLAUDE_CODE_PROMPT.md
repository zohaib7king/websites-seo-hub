# Claude Code — ZoyZoy Hub Starter Prompt
# Paste this into Claude Code when starting work on this project

---

I am building a multi-site content network called **ZoyZoy Hub**.
The full project is in this repository. Read CLAUDE.md first before doing anything.

## Project Summary

- A CRM dashboard (React) where I manage all my websites
- Multiple niche websites (Next.js) that display articles
- A backend API (Node.js + Express + PostgreSQL) that connects everything
- AI content generation using the Anthropic API (claude-sonnet-4-6)
- All services run with Docker Compose

## What I Need You to Do Right Now

1. Read `CLAUDE.md` — understand the full project structure
2. Read `docker-compose.yml` — understand how all services connect
3. Read `api/src/routes/ai.js` — understand how AI content generation works
4. Read `crm/src/pages/AIGenerator.jsx` — understand the CRM interface

Then complete this task:

**[REPLACE THIS LINE WITH YOUR SPECIFIC TASK]**

Examples of tasks you can paste here:
- "Add a cron job that processes the content queue every hour automatically"
- "Add user login to the CRM with JWT authentication"
- "Build a sitemap.xml route in site-001-ai for SEO"
- "Add image generation for article thumbnails using Claude"
- "Add AdSense API integration to pull real revenue data automatically"
- "Add a site-002-finance website for personal finance content"
- "Add a dark/light mode toggle to the CRM"
- "Add article preview before publishing in the CRM"

## Rules to Follow

- Always follow the coding rules in CLAUDE.md
- Use CSS variables from `crm/src/index.css` for all CRM styling
- Never use localStorage in the CRM
- Use `claude-sonnet-4-6` for all Anthropic API calls
- All DB queries must use parameterized queries (never string interpolation)
- Test your changes work with `docker compose up --build`
