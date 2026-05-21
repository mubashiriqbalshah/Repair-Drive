# Development Roadmap

Phased plan. Realistic estimates assuming 1 developer working ~4 hours/day. Faster with full-time / team.

---

## Phase 0 — Foundation (Week 1)

**Goal**: Repo setup, decisions locked, design system started.

- [x] App name confirmed: **Repair Drive**
- [x] Launch city decided: **Lahore**
- [x] Commission model: admin-configurable, default 12%
- [x] Brand colors locked: green (#059669) + charcoal (#1F2937) — see [BRAND.md](BRAND.md)
- [x] Logo direction: wrench + arrow combo
- [ ] Domain purchase: deferred to pre-launch (Phase 6)
- [ ] Create actual logo file (Recraft / Fiverr / Looka — brief from BRAND.md)
- [ ] Setup GitHub repos (or monorepo)
- [ ] Initialize 4 projects: backend, customer-app, technician-app, admin-panel
- [ ] Pick one design system, set up shared theme tokens (colors, fonts)
- [ ] Setup MongoDB Atlas account (free tier)
- [ ] Setup Firebase project (for FCM)
- [ ] Setup Google Cloud project (for Maps API)
- [ ] Pick SMS provider (Jazz API vs Twilio — see below)

**Deliverable**: Empty but bootstrapped projects, brand assets ready.

---

## Phase 1 — MVP Backend (Week 2–3)

**Goal**: Working API + DB for the full order lifecycle.

### Backend
- [ ] Express + TypeScript scaffolding
- [ ] MongoDB connection + Mongoose models (all collections from ARCHITECTURE.md)
- [ ] Auth: phone OTP signup/login (Twilio test mode first)
- [ ] JWT middleware (access + refresh)
- [ ] Customer endpoints (profile, addresses, orders CRUD)
- [ ] Technician endpoints (onboarding, profile, location updates)
- [ ] Order matching logic (geo-query + offer broadcast)
- [ ] Socket.IO setup (rooms per order)
- [ ] Real-time order updates
- [ ] Chat endpoints + socket events
- [ ] File upload (Cloudinary integration)
- [ ] Admin endpoints (verification approve/reject, dashboard stats)
- [ ] Seeding script (categories, test users)
- [ ] Postman / Bruno collection for testing

**Deliverable**: API fully testable from Postman. No frontend yet.

---

## Phase 2 — Customer App MVP (Week 4–5)

**Goal**: A customer can sign up, place an order, see offers, accept one, chat, complete, rate.

- [ ] React Native init + TypeScript + navigation
- [ ] Auth flow (phone OTP screens)
- [ ] Home screen (categories grid)
- [ ] New order flow (category → problem → location → budget → confirm)
- [ ] "Finding technician" screen with live offers
- [ ] Active order screen (map + tracking + chat)
- [ ] Order history
- [ ] Rating screen
- [ ] Profile + addresses screens
- [ ] FCM integration
- [ ] Bilingual (Urdu/English)
- [ ] Polish: loading states, error handling, offline detection

**Deliverable**: Demoable customer app on Android device.

---

## Phase 3 — Technician App MVP (Week 6–7)

**Goal**: A technician can onboard, get verified, see orders, bid, complete jobs.

- [ ] RN init (can share components with customer app via shared package)
- [ ] Auth + onboarding flow (CNIC upload)
- [ ] "Waiting for approval" screen
- [ ] Online/offline toggle
- [ ] Nearby orders screen (map + list)
- [ ] Bidding flow
- [ ] Active job screen (navigate, status, chat)
- [ ] Earnings dashboard
- [ ] Profile + ratings
- [ ] Background location updates while online
- [ ] FCM
- [ ] Bilingual

**Deliverable**: Two devices can demo: customer places order → technician accepts → flow completes.

---

## Phase 4 — Admin Panel MVP (Week 8)

**Goal**: You can manage the platform without touching the DB.

- [ ] Next.js init + Tailwind + shadcn
- [ ] Admin login
- [ ] Dashboard with key metrics
- [ ] Technician verification queue (KYC review)
- [ ] All technicians table
- [ ] All orders table
- [ ] Disputes queue
- [ ] Categories CRUD
- [ ] Settings (commission, etc.)
- [ ] Basic charts

**Deliverable**: Aap khud platform manage kar sakte hain, devs ki zaroorat nahi rozmarra ke kaam ke liye.

---

## Phase 5 — Payment Integration (Week 9)

- [ ] JazzCash API integration (test env first)
- [ ] EasyPaisa API integration
- [ ] Payment flow on order completion
- [ ] Technician withdrawal flow
- [ ] Payment failure handling + cash fallback
- [ ] Admin payouts processing UI

**Deliverable**: Real money can flow through the platform.

---

## Phase 6 — Pre-launch Hardening (Week 10)

- [ ] **Purchase domain**: `repairdrive.pk` + `repairdrive.com`
- [ ] Sentry integration (errors)
- [ ] Rate limiting
- [ ] Input validation audit
- [ ] Load testing (simulate 100 concurrent orders)
- [ ] Security audit (OWASP basics)
- [ ] Privacy policy + terms of service (legally required for app stores)
- [ ] Play Store assets (screenshots, description, video)
- [ ] Closed beta with 10–20 real technicians in **Lahore**

**Deliverable**: Ready for soft launch in Lahore.

---

## Phase 7 — Launch + Iterate (Week 11+)

- [ ] Soft launch in **Lahore**
- [ ] Onboard 20–50 technicians manually (give them red carpet treatment) — start with neighborhoods you know (Johar Town, DHA, Gulberg)
- [ ] Marketing: WhatsApp groups, Facebook, local ads
- [ ] Customer support channel (WhatsApp Business)
- [ ] Weekly metrics review
- [ ] Bug fixes + small feature additions based on real feedback
- [ ] Refer & earn program

---

## Phase 8+ (Post-Launch)

Pick based on what users actually want:

- iOS app
- Spare parts ordering
- Annual maintenance contracts
- B2B (corporate offices, hotels)
- Insurance / warranty on repairs
- AI-based problem diagnosis from photos
- Expansion to more cities

---

## Realistic Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0. Foundation | 1 week | 1 wk |
| 1. Backend MVP | 2 weeks | 3 wks |
| 2. Customer App | 2 weeks | 5 wks |
| 3. Technician App | 2 weeks | 7 wks |
| 4. Admin Panel | 1 week | 8 wks |
| 5. Payments | 1 week | 9 wks |
| 6. Hardening | 1 week | 10 wks |
| **Launch ready** | | **~10 weeks** |

That's solo dev, part-time. With team or full-time, 4–6 weeks possible.

---

## Cost Estimate (monthly, post-launch)

Pakistan-friendly:

| Service | Free tier? | Likely monthly cost |
|---------|-----------|---------------------|
| MongoDB Atlas | Yes (M0) | $0 — $25 |
| Backend hosting (Railway/Render) | Yes | $5 — $20 |
| Vercel (admin panel) | Yes | $0 |
| Google Maps API | $200 credit/mo | $0 — $50 |
| Cloudinary (images) | Yes | $0 — $20 |
| Firebase FCM | Yes | $0 |
| Twilio OTP | Pay-as-you-go | ~$0.05 per OTP × volume |
| Sentry | Yes (5k events) | $0 |
| Domain | — | ~$15/year |
| **Total MVP** | | **$5 — $100/month** |

At launch ye costs almost negligible hain. Scale ke saath barhenge.
