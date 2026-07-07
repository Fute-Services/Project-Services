# Technical Requirements Document (TRD)

## 1. Overview
App Distribution Portal — Next.js based web app, deployed on Vercel, files stored on Cloudflare R2, data stored in a JSON file inside the repo.

## 2. Tech Stack
| Layer | Technology | Reason |
|---|---|---|
| Frontend/Backend | Next.js (App Router) | Single framework for pages + API routes, free Vercel hosting |
| Hosting | Vercel | Free tier, auto-deploy on `git push` |
| File Storage | Cloudflare R2 | 10GB free storage, **free egress/bandwidth**, S3-compatible API |
| Data Store | `data/clients.json` (in repo) | No DB needed at this scale, version-controlled, easy for Claude Code to edit |
| Auth (Admin) | Simple password via env var + cookie session | Lightweight, no need for full auth provider at MVP stage |
| Styling | Tailwind CSS | Fast to build clean, professional UI |

## 3. System Components

### 3.1 Data Layer
- `data/clients.json` — single source of truth
- Schema:
```json
{
  "clients": [
    {
      "id": "string (slug)",
      "name": "string",
      "projects": [
        {
          "slug": "string (unique, used in URL)",
          "title": "string",
          "description": "string",
          "version": "string",
          "icon": "string (optional URL)",
          "downloads": {
            "windows": "string (R2 URL) | null",
            "mac": "string (R2 URL) | null",
            "android": "string (R2 URL) | null"
          },
          "updatedAt": "ISO date string"
        }
      ]
    }
  ]
}
```
- Read helper: `lib/clients.ts` — functions `getAllClients()`, `getProjectBySlug(slug)`

### 3.2 Storage Layer (Cloudflare R2)
- One bucket, e.g. `app-distribution`
- Folder convention: `{clientId}/{projectSlug}/{filename}`
- Public access via R2 public bucket URL or custom domain (`files.yourdomain.com`)
- Upload method: `wrangler` CLI or `rclone` (scripted, run by Claude Code when adding new files)

### 3.3 Web App Routes
| Route | Type | Auth | Purpose |
|---|---|---|---|
| `/admin` | Server Component | Password cookie | List all clients + projects, copy link buttons |
| `/admin/login` | Page | Public | Password entry form |
| `/p/[slug]` | Server Component | Public | Client-facing download page |
| `/api/auth` | API Route | — | Validate admin password, set cookie |

### 3.4 Client Download Page Logic
1. Read project by slug from `clients.json`
2. Detect user OS via `navigator.userAgent` (client-side) → highlight matching download button
3. Show all available platform buttons (hide platforms with `null` link)
4. Each button = direct `<a href>` to R2 file URL, `download` attribute set

### 3.5 Admin Auth Flow
1. Admin visits `/admin`
2. If no valid session cookie → redirect to `/admin/login`
3. Password checked against `ADMIN_PASSWORD` env var (server-side)
4. On success, set HttpOnly signed cookie (e.g. via `iron-session` or simple JWT), redirect to `/admin`

## 4. Environment Variables
```
ADMIN_PASSWORD=xxxxx
R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=app-distribution
R2_PUBLIC_URL=https://files.yourdomain.com
SESSION_SECRET=xxxxx
```

## 5. Non-Functional Requirements
- **Performance**: Static-ish pages, fast load (<1s) — Next.js SSG/ISR where possible
- **Security**: Admin route password protected; client links are unguessable slugs (not sequential IDs)
- **Scalability**: JSON file fine up to a few hundred projects; migrate to a real DB (e.g. Postgres/Supabase) if it grows beyond that
- **Cost**: $0/month at current scale (Vercel free tier + R2 free tier)
- **Mobile-friendly**: Client download page must be responsive (client often opens link on phone)

## 6. Deployment
1. Repo pushed to GitHub
2. Vercel project linked to repo, env vars set in Vercel dashboard
3. Every `git push` to `main` → auto-deploy
4. R2 bucket managed separately via Cloudflare dashboard/`wrangler`

## 7. Adding a New App (Operational Flow)
1. Admin gives Claude Code: client name, project name, description, files (per platform)
2. Claude uploads files to R2 (`wrangler r2 object put`)
3. Claude updates `data/clients.json` with new entry + R2 URLs
4. Claude commits + pushes → Vercel auto-deploys
5. Link `https://yourdomain.com/p/{slug}` shared with client

## 8. Risks / Open Questions
- R2 public bucket vs custom domain — need to decide before go-live (custom domain looks more professional)
- JSON file concurrent edits — not an issue since only Claude Code edits it (single writer)
- Large file uploads (>100MB) — R2 supports multipart upload if needed later
