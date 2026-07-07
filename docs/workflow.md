# Workflow Document

## 1. Admin — Add New Client + Project

```mermaid
flowchart TD
    A[Start: Naya client/app hai] --> B[Admin Claude ko details deta hai:<br/>client name, project name, description,<br/>version, files per platform]
    B --> C{Client pehle se exist karta hai?}
    C -->|Nahi| D[Naya client entry banao<br/>clients.json me]
    C -->|Haan| E[Existing client ke andar<br/>naya project add karo]
    D --> F
    E --> F[Files R2 pe upload karo<br/>wrangler r2 object put]
    F --> G[R2 URLs clients.json me daalo]
    G --> H[Git commit + push]
    H --> I[Vercel auto-deploy]
    I --> J[Link ready: /p/client-project-slug]
    J --> K[Admin link client ko share kare]
```

## 2. Admin — Update Existing App (New Version)

```mermaid
flowchart TD
    A[Client/app ka naya version aaya] --> B[Admin Claude ko naya file deta hai]
    B --> C[Purani file R2 pe rehne do<br/>ya replace karo — decide]
    C --> D[Naya file R2 pe upload]
    D --> E[clients.json me version + URL update]
    E --> F[Git commit + push → auto-deploy]
    F --> G[Same link kaam karega,<br/>naya file serve hoga]
```

## 3. Client — Download App

```mermaid
flowchart TD
    A[Client ko link milta hai] --> B[Link open karta hai /p/slug]
    B --> C[Page load: app name, version,<br/>description dikhta hai]
    C --> D[System auto-detect karta hai<br/>client ka OS]
    D --> E[Uss platform ka button highlight]
    E --> F{Client kaunsa button dabata hai?}
    F -->|Windows| G1[.exe download]
    F -->|Mac| G2[.dmg download]
    F -->|Android| G3[.apk download]
    G1 --> H[Download complete]
    G2 --> H
    G3 --> H
```

## 4. Admin — View All Clients (Dashboard)

```mermaid
flowchart TD
    A[Admin /admin pe jaata hai] --> B{Login session valid?}
    B -->|Nahi| C[/admin/login pe redirect]
    C --> D[Password enter]
    D -->|Sahi| E[Session cookie set]
    B -->|Haan| F[Saare clients + projects list dikhte hain]
    E --> F
    F --> G[Har project ke aage:<br/>link copy button, platforms available]
```

## 5. End-to-End Timeline (Typical Request)

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Admin (Aap)
    participant CC as Claude Code
    participant R2 as Cloudflare R2
    participant V as Vercel Site

    C->>A: "Mujhe app chahiye" / feedback
    A->>CC: "XYZ client ke liye naya app/update add karo" + files
    CC->>R2: Upload installer file(s)
    CC->>CC: data/clients.json update
    CC->>V: git push → auto deploy
    V-->>A: Link ready
    A->>C: Link share (WhatsApp/Email)
    C->>V: Link open, page load
    C->>R2: Download click
    R2-->>C: File download
```
