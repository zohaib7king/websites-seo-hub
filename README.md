# 🌐 ZoyZoy Hub

A multi-site content network with AI-powered CRM for managing websites, generating SEO content, and tracking AdSense revenue.

## Architecture

```
zoyzoy-hub/
├── docker-compose.yml       ← Start everything with one command
├── api/                     ← Backend REST API (Node/Express + PostgreSQL)
├── crm/                     ← Admin CRM Dashboard (React)
├── sites/
│   └── site-001-ai/         ← AI Insider Daily (Next.js)
│       (add site-002-finance, site-003-petcare, etc.)
└── nginx/                   ← Reverse proxy
```

## Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/zoyzoy-hub.git
cd zoyzoy-hub
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 2. Start Everything
```bash
docker compose up --build
```

### 3. Access Services

| Service          | URL                    |
|-----------------|------------------------|
| CRM Dashboard   | http://localhost:3000  |
| AI Website #1   | http://localhost:3001  |
| API             | http://localhost:4000  |

---

## CRM Features

### Dashboard
- Overview of all sites, articles, and revenue

### AI Generator
- **Single Article**: Enter one keyword → Claude AI writes a full SEO article
- **Bulk Queue**: Paste 10–50 keywords → all added to generation queue

### Sites Management
- Add new sites with niche and domain info
- Supported niches: `artificial-intelligence`, `personal-finance`, `pet-care`

### Articles
- View, publish, unpublish, and delete articles
- Filter by site and status

### Revenue
- Track AdSense impressions, clicks, CTR, and earnings
- Per-site and network-wide views

---

## Adding a New Website

1. Create a new folder under `sites/`:
```bash
cp -r sites/site-001-ai sites/site-002-finance
```

2. Update `sites/site-002-finance/package.json` name field

3. Add to `docker-compose.yml`:
```yaml
site-002-finance:
  build: ./sites/site-002-finance
  container_name: zoyzoy_site_002
  environment:
    NEXT_PUBLIC_SITE_ID: site-002-finance
  ports:
    - "3002:3000"
  networks:
    - zoyzoy_net
```

4. Register the site in the CRM Dashboard → Sites → Add Site

---

## API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | /api/sites            | List all sites           |
| POST   | /api/sites            | Create new site          |
| GET    | /api/articles         | List articles            |
| PATCH  | /api/articles/:id     | Update article           |
| POST   | /api/ai/generate      | Generate 1 AI article    |
| POST   | /api/ai/bulk          | Queue multiple keywords  |
| GET    | /api/revenue          | Revenue data             |

---

## Scaling to 100 Sites

- Each site runs as a Docker container
- CRM manages content for all sites from one dashboard  
- AI generates articles automatically — no manual writing needed
- Add a cron job to process the content queue automatically

```bash
# Example: auto-generate queued articles every hour
# Add to your server's crontab:
0 * * * * curl -X POST http://localhost:4000/api/ai/process-queue
```

---

## Tech Stack

- **Backend**: Node.js + Express + PostgreSQL
- **CRM**: React + Vite
- **Websites**: Next.js (SEO-optimized)
- **AI**: Anthropic Claude (claude-sonnet-4-6)
- **Infrastructure**: Docker + Docker Compose + Nginx
