# App Distribution Portal — Plan

## Problem
Abhi apps Google Drive se share ho rahe hain — unprofessional lagta hai, links messy hote hain, aur multiple clients/projects track karna mushkil hai.

## Goal
Ek professional web portal jaha:
- **Admin (aap)** ek jagah se saare clients aur unke projects dekh sake.
- Har **project** ka apna unique link ho, jisme Windows / Mac / Android ke liye direct download buttons ho.
- Client sirf apna link kholega — koi login nahi, seedha download.
- Naya app ya update daalna easy ho (aap bolo → main file R2 pe daalu → link ready).

## Tech Stack
| Part | Choice | Why |
|---|---|---|
| Hosting (website) | Vercel (Next.js) | Free, auto-deploy on git push |
| File storage | Cloudflare R2 | 10GB free, free egress (bandwidth), unlimited apps within size |
| Data | `data/clients.json` in repo | Simple, version-controlled, no DB needed for this scale |
| Admin access | Password-protected `/admin` route | Sirf aap dekh sako saari client list |
| Client access | Secret link `/p/[projectSlug]` | No login, link hi password hai |

---

## Architecture

```mermaid
graph TB
    subgraph Storage
        R2[(Cloudflare R2<br/>installer files)]
    end

    subgraph Repo["Git Repo (data/clients.json)"]
        DATA[clients.json<br/>clients → projects → file links]
    end

    subgraph Vercel["Vercel — Next.js App"]
        ADMIN["/admin<br/>password protected"]
        PROJECT["/p/slug<br/>public client page"]
    end

    Admin((Aap)) -->|Naya app/update bolna| Claude[Claude Code]
    Claude -->|1. Upload file| R2
    Claude -->|2. Update JSON + git push| DATA
    DATA --> Vercel
    Admin -->|3. Dekhna| ADMIN
    ADMIN --> DATA
    PROJECT --> DATA
    PROJECT -->|Download click| R2
    Client((Client)) -->|Link kholta hai| PROJECT
```

---

## Admin Flow

```mermaid
flowchart TD
    A[Naya client/project add karna hai] --> B[Aap Claude ko batate ho:<br/>client naam, project naam, files]
    B --> C[Claude installer files<br/>R2 me upload karta hai]
    C --> D[Claude clients.json update karta hai<br/>with download URLs]
    D --> E[Git push → Vercel auto-deploy]
    E --> F[Unique link generate hota hai<br/>e.g. yourapp.com/p/client-project]
    F --> G[Aap wahi link client ko bhejte ho]
    G --> H["/admin page pe jaake<br/>saare clients + projects dekh sakte ho"]
```

## Client Flow

```mermaid
flowchart TD
    A[Client ko link milta hai<br/>WhatsApp/Email se] --> B[Link open karta hai]
    B --> C[Project page dikhta hai:<br/>App name, description, icon]
    C --> D{Kaunsa platform?}
    D -->|Windows| E1[Download .exe]
    D -->|Mac| E2[Download .dmg]
    D -->|Android| E3[Download .apk]
    E1 --> F[File R2 se seedha download]
    E2 --> F
    E3 --> F
```

---

## End-to-End Sequence (New App Added → Client Downloads)

```mermaid
sequenceDiagram
    participant Admin as Aap
    participant Claude as Claude Code
    participant R2 as Cloudflare R2
    participant Repo as Git Repo
    participant Vercel as Vercel (Live Site)
    participant Client

    Admin->>Claude: "XYZ client ke liye naya app add karo"
    Claude->>R2: Installer file upload (exe/dmg/apk)
    R2-->>Claude: File URL
    Claude->>Repo: clients.json update + commit + push
    Repo->>Vercel: Auto-deploy trigger
    Vercel-->>Admin: Naya link ready (/p/xyz-app)
    Admin->>Client: Link share (WhatsApp/Email)
    Client->>Vercel: Link open karta hai
    Vercel-->>Client: Project page (download buttons)
    Client->>R2: Platform button click → download
    R2-->>Client: File download shuru
```

---

## Data Model (`data/clients.json`)

```json
{
  "clients": [
    {
      "id": "client-abc",
      "name": "ABC Traders",
      "projects": [
        {
          "slug": "abc-inventory-app",
          "title": "ABC Inventory App",
          "description": "Inventory management app for ABC Traders",
          "version": "1.2.0",
          "downloads": {
            "windows": "https://r2.example.com/abc/inventory-1.2.0-win.exe",
            "mac": "https://r2.example.com/abc/inventory-1.2.0-mac.dmg",
            "android": "https://r2.example.com/abc/inventory-1.2.0.apk"
          }
        }
      ]
    }
  ]
}
```

---

## Pages / Routes

| Route | Access | Purpose |
|---|---|---|
| `/admin` | Password (env var) | Saare clients + projects ki list, links copy karna |
| `/p/[slug]` | Public (link-based) | Client-facing download page for one project |

---

## Folder Structure

```
Project-Services/
├── data/
│   └── clients.json
├── app/ (or pages/)
│   ├── admin/
│   │   └── page.tsx
│   └── p/
│       └── [slug]/
│           └── page.tsx
├── lib/
│   └── clients.ts   (read/query clients.json)
├── public/
└── plan.md
```

---

## Next Steps
1. Next.js project scaffold karna
2. `clients.json` + read logic banana
3. `/p/[slug]` client download page banana (mobile-friendly, platform auto-detect)
4. `/admin` password-protected list page banana
5. Cloudflare R2 bucket setup + upload script (wrangler/rclone)
6. Vercel pe deploy + env vars set karna
7. Pehla real client/project add karke test karna
