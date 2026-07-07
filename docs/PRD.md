# Product Requirements Document (PRD)

## 1. Product Name
App Distribution Portal (internal name — final naam decide karna baaki hai)

## 2. Problem Statement
Freelance/agency developer (aap) multiple clients ke liye apps banate ho. Abhi tak Google Drive se app installer files share ho rahi hain, jo:
- Unprofessional dikhta hai
- Version/updates track karna mushkil
- Client ko sahi platform (Windows/Mac/Android) ka file dhoondhna padta hai
- Multiple clients ke links kahi bhi scattered rehte hain, ek jagah track nahi hota

## 3. Goal
Ek simple, professional web portal jaha:
- Aap saare clients aur unke projects ek jagah dekh sako
- Har project ka ek clean, shareable link ho jisme platform-wise download buttons ho
- Naya app/update add karna fast ho (minutes me)
- Cost minimal/free rahe

## 4. Target Users
| User | Role |
|---|---|
| Admin (aap) | Sab kuch manage karta hai — clients, projects, files |
| Client | Sirf apna project link kholta hai, app download karta hai |

## 5. User Stories
- **As Admin**, main naya client add karna chahta hu taaki unke projects track ho sake.
- **As Admin**, main ek project ke liye Windows/Mac/Android files upload karna chahta hu.
- **As Admin**, main saare clients aur unke projects ek dashboard me dekhna chahta hu.
- **As Admin**, main ek shareable link generate karna chahta hu jo client ko bhej sakoon.
- **As Client**, main link kholke apna platform select karke seedha app download karna chahta hu, bina login/signup ke.
- **As Client**, main dekhna chahta hu ki app ka naam, version, aur description kya hai, taaki confirm ho sake ye sahi app hai.

## 6. Core Features (MVP)
1. **Admin Dashboard** (`/admin`, password protected)
   - Clients list
   - Har client ke andar projects list
   - Har project ka link copy button
2. **Client Download Page** (`/p/[slug]`, public link)
   - App name, description, version, icon
   - Platform-wise download buttons (Windows / Mac / Android)
   - Auto-detect user's OS aur wahi button highlight karna
3. **Data Management**
   - Simple JSON-based data store (`data/clients.json`)
   - Naya entry add karna = file update + git push (Claude Code ke through)
4. **File Storage**
   - Cloudflare R2 pe installer files
   - Direct download links, no expiry

## 7. Out of Scope (for MVP)
- Client login/authentication
- Auto-update / in-app update checker
- Analytics/download tracking (future me add ho sakta hai)
- Payment/licensing
- Multi-admin roles

## 8. Success Criteria
- Aap ek naya client/project **5 minute se kam** me add kar pao
- Client ko link bhejne ke baad wo **bina kisi confusion ke** sahi file download kar paye
- Drive ka use completely replace ho jaye

## 9. Future Enhancements (Phase 2+)
- Download count/analytics per project
- Email notification jab client download kare
- Version history per project (purane versions bhi rakhe)
- Custom domain (e.g. downloads.yourbrand.com)
- Auto OS-detect + QR code for mobile apps
