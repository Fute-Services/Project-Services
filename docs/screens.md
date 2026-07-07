# Screens Document

## Screen Navigation Map

```mermaid
graph LR
    L[/admin/login] -->|correct password| D[/admin — Dashboard]
    D -->|copy link| P["/p/[slug] — Client Page"]
    D -->|new client/project| D
    P -->|download click| F[File downloads from R2]
```

---

## 1. `/admin/login` — Admin Login

```
┌─────────────────────────────────────┐
│                                       │
│              [ Logo/Name ]           │
│                                       │
│        App Distribution Portal       │
│                                       │
│   ┌─────────────────────────────┐    │
│   │ Password                    │    │
│   └─────────────────────────────┘    │
│                                       │
│         [   Login   ]                │
│                                       │
└─────────────────────────────────────┘
```
- Single password field, no username
- On wrong password → inline error "Incorrect password"

---

## 2. `/admin` — Admin Dashboard

```
┌───────────────────────────────────────────────────────┐
│  App Distribution Portal              [Logout]        │
├───────────────────────────────────────────────────────┤
│  🔍 Search client/project...                           │
├───────────────────────────────────────────────────────┤
│  ▸ ABC Traders                                          │
│      • ABC Inventory App   v1.2.0   [Copy Link] [Edit]  │
│      • ABC Billing App     v2.0.0   [Copy Link] [Edit]  │
│                                                          │
│  ▸ XYZ Retail                                           │
│      • XYZ POS App         v1.0.0   [Copy Link] [Edit]  │
│                                                          │
├───────────────────────────────────────────────────────┤
│                [ + Add New Client ]                     │
│                [ + Add New Project ]                    │
└───────────────────────────────────────────────────────┘
```
- Clients shown as collapsible groups
- Each project row: name, version, platforms available (small icons), Copy Link button, Edit button
- "Copy Link" copies full `https://yourdomain.com/p/slug` to clipboard
- Add buttons — MVP me ye Claude Code ke through hoga (manual JSON edit), future me form ban sakta hai

---

## 3. `/p/[slug]` — Client Download Page

```
┌───────────────────────────────────────────────────────┐
│                                                         │
│                   [ App Icon ]                          │
│                                                         │
│                ABC Inventory App                        │
│         Inventory management app for ABC Traders        │
│                    Version 1.2.0                        │
│                                                         │
│   ┌───────────────────┐  ┌───────────────────┐          │
│   │ ⊞ Download for     │  │ ⊞ Download for     │          │
│   │   Windows           │  │   Mac               │          │
│   └───────────────────┘  └───────────────────┘          │
│   ┌───────────────────┐                                 │
│   │ ⊞ Download for     │                                 │
│   │   Android           │                                 │
│   └───────────────────┘                                 │
│                                                         │
│   (Your device: Windows — highlighted above)             │
│                                                         │
│   ────────────────────────────────────────────          │
│         Powered by [Your Brand Name]                    │
└───────────────────────────────────────────────────────┘
```
- Centered, minimal, mobile-first layout
- Only platforms with an available file are shown as buttons
- Detected OS button styled as primary (highlighted), others secondary
- Footer branding line (professional touch, replaces "sent via Drive" feel)

---

## 4. Empty / Error States
- **Invalid slug** (`/p/does-not-exist`): "Ye link valid nahi hai ya app remove kar diya gaya hai." + contact note
- **No clients yet** (`/admin` empty): "Abhi koi client add nahi hua — Claude Code se pehla client add karwao"
- **Platform not available**: Us platform ka button simply hide, dikhaya hi nahi jata (clutter avoid karne ke liye)
