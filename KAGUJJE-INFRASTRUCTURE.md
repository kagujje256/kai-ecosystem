# KAGUJJE Infrastructure

Multi-subdomain architecture for the KAGUJJE brand ecosystem.

## Architecture Overview

```
                    ┌──────────────────────────────────────────────────────────────┐
                    │          kagujje.com (root)                                  │
                    └──────────────────────────────────────────────────────────────┘
                                       │
        ┌────────────────┬─────────────────────────┬─────────────────┬────────────────┬───────┐
        ▼               ▼                         ▼                 ▼                ▼       ▼
   www.kagujje   app.kagujje   admin.kagujje  api.kagujje  blog.kagujje  ... (more)
   ─────────────  ─────────────  ──────────────  ─────────────  ─────────────
   Portfolio      Dashboard     Admin Panel     API/Backend    Blog
   Landing        Software                      Services       Articles
```

## Services Map

| Subdomain | Purpose | Tech | Status |
|-----------|---------|------|--------|
| `www` | Main landing page / company homepage | Next.js (existing portfolio) | ✅ Ready |
| `mdm` | KagujjeMDM Platform | Next.js + SQLite | ✅ Ready |
| `app` | Main software dashboard | React/Bun + Hono | 📋 Planned |
| `admin` | Private admin panel | Next.js (extracted from portfolio) | 📋 Planned |
| `api` | API/backend services | Hono/Bun | 📋 Planned |
| `blog` | Articles/news/SEO | Next.js or Astro | 📋 Planned |
| `shop` | Digital products/store | Next.js + Stripe | 📋 Planned |
| `tools` | Free utilities | Hono + React | 📋 Planned |
| `status` | Uptime/status page | Hono static | 📋 Planned |
| `boost` | Social Media Boosting SaaS | Next.js + Stripe | 📋 Planned |

## Shared Infrastructure

### Database (Supabase)
- Primary data store for all services
- Tables: users, projects, writings, products, orders, subscriptions, tools_usage, etc.
- Auth: Supabase Auth with JWT tokens

### API Gateway (`api.kagujje.com`)
Central API for all services:
- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/projects/*` - Project CRUD
- `/products/*` - Product catalog
- `/orders/*` - Order processing
- `/blog/*` - Blog content
- `/tools/*` - Tool utilities
- `/webhooks/*` - Stripe & external webhooks

## Implementation Priority

### Phase 1: Foundation
1. ✅ `www` - Portfolio (complete)
2. 🔄 `api` - Core API service
3. 🔄 `admin` - Extract admin panel

### Phase 2: Content & Commerce
4. `blog` - Blog platform
5. `shop` - Digital products store

### Phase 3: Applications
6. `app` - Software dashboard
7. `boost` - Social Media Boosting SaaS

### Phase 4: Utilities
8. `tools` - Free utilities
9. `status` - Status page

## Connected Zo Spaces

| Space | Role | URL |
|-------|------|-----|
| kaggu.zo.computer | Primary | https://kaggu.zo.space |
| daily4.zo.computer | Secondary | https://daily4.zo.space |
| kaguujje3.zo.computer | Sync Target | https://kaguujje3.zo.space |

---

*Synced from kaggu.zo.computer on 2026-05-08*
