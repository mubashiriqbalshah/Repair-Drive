# Repair Drive

> **This is a product, not a client project.**
> Repair Drive is an independently owned product being built by [@mubasher](https://github.com/) (mubashir2009@gmail.com). All code, design, and brand assets in this repository are proprietary work toward a launchable consumer product — not a deliverable for any external client.

inDrive-style on-demand repair service marketplace for Pakistan. Customers book technicians for home appliance and electronics repair at their doorstep with negotiable pricing.

**Tagline ideas**: "Drive the repair to your door" · "Apka mistri, apke ghar"

---

## About this Product

| | |
|---|---|
| **Type** | Owned product (proprietary, not open source, not client work) |
| **Owner** | Mubashir — sole founder / builder |
| **Stage** | Pre-launch, in active development |
| **Launch market** | Lahore, Pakistan |
| **Business model** | Marketplace commission (default 12% per completed job) |
| **License** | All rights reserved — see [LICENSE](LICENSE) |

---

## Product Components

| Folder | Purpose | Tech | Status |
|--------|---------|------|--------|
| [customer-app/](customer-app/) | Mobile app for customers booking repairs | React Native (Expo) | In progress |
| [technician-app/](technician-app/) | Mobile app for technicians (like inDrive driver app) | React Native (Expo) | Not started |
| [admin-panel/](admin-panel/) | Web dashboard for platform management | Next.js | Not started |
| [backend/](backend/) | REST API + WebSocket server | Node.js + Express + MongoDB | In progress |
| [docs/](docs/) | All planning, design, architecture docs | Markdown | Living docs |

## Quick Links

- [Master Plan](docs/PLAN.md) — Read this first
- [Features Breakdown](docs/FEATURES.md) — What each user role can do
- [Architecture](docs/ARCHITECTURE.md) — Tech stack, database, API design
- [Roadmap](docs/ROADMAP.md) — Phased development plan
- [User Flows](docs/USER-FLOWS.md) — Step-by-step screens for key actions
- [Brand Guide](docs/BRAND.md) — Colors, typography, logo direction

## Status

**Phase: Active development** — backend API and customer-app scaffolding underway; technician-app and admin-panel not yet started.

---

## Repository Conventions

This is a monorepo with four workspaces. Each workspace has its own `package.json` and `README.md`. There is no root-level package manager (no yarn/pnpm workspaces yet) — install dependencies inside each subfolder.

```sh
cd backend && npm install && npm run dev
cd customer-app && npm install && npm start
```

## Confidentiality

This source code is **not licensed for reuse**. If you are reading this and you are not the owner or an explicitly invited collaborator, please do not copy, redistribute, or build derivative products from it.
