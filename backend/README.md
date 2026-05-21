# Repair Drive — Backend

REST API + Socket.IO server for the Repair Drive platform.

## Stack

- Node.js + Express + TypeScript
- MongoDB (Mongoose) — geo-indexed for nearby-technician queries
- Socket.IO for real-time (order offers, live tracking, chat)
- JWT auth (access + refresh)
- Zod for input validation
- Phone OTP via Twilio (configurable to mock or local PK providers)

## Folder structure

```
src/
  config/           env, db connection, logger
  models/           Mongoose schemas (Customer, Technician, Order, etc.)
  middleware/       auth, validation, rate limiting, error handling
  controllers/      route handlers grouped by domain
  routes/           Express routers
  services/         sms, jwt — swappable providers
  utils/            errors, async wrappers, phone normalize, hashing
  scripts/seed.ts   initial data (categories, settings, super admin)
  socket.ts         Socket.IO setup + room helpers
  app.ts            Express app factory
  index.ts          server bootstrap
```

## Running locally

### Prerequisites
- Node.js 20+
- MongoDB running locally (or MongoDB Atlas URI)

### Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — at minimum set MONGODB_URI, JWT secrets, SEED_ADMIN_PASSWORD
```

### Seed initial data

Run once to create categories, settings, and the first super admin:

```bash
npm run seed
```

### Start dev server

```bash
npm run dev
```

Server listens on `http://localhost:4000`. Health check: `GET /health`.

### Production build

```bash
npm run build
npm start
```

## Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Long random strings, never commit |
| `SMS_PROVIDER` | `mock` (dev), `twilio`, or `veevotech` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | First super admin credentials |

In development with `SMS_PROVIDER=mock`, OTP codes are logged to console AND returned in the response as `devCode` for easy testing. The dev OTP is hardcoded to `123456` for predictability.

## API Routes

Base: `http://localhost:4000/v1`

### Public
- `POST /auth/send-otp` — body `{ phone }`
- `POST /auth/verify-otp` — body `{ phone, code, role: "customer"|"technician" }`
- `POST /auth/refresh` — body `{ refreshToken }`
- `GET /categories`

### Customer (Bearer token, role=customer)
- `GET /customer/profile`
- `PATCH /customer/profile`
- `POST /customer/addresses`
- `DELETE /customer/addresses/:id`
- `POST /customer/orders` — create new order
- `GET /customer/orders`
- `GET /customer/orders/:id`
- `PATCH /customer/orders/:id/accept-offer` — body `{ offerId }`
- `PATCH /customer/orders/:id/cancel` — body `{ reason }`
- `POST /customer/orders/:id/rate` — body `{ stars, review }`

### Technician (Bearer token, role=technician)
- `GET /technician/profile`
- `POST /technician/onboard` — KYC submission
- `PATCH /technician/profile`
- `PATCH /technician/online-status` — body `{ isOnline }`
- `PATCH /technician/location` — body `{ lat, lng }`
- `GET /technician/nearby-orders?lat=&lng=&radius=`
- `POST /technician/orders/:id/offer` — body `{ price, note? }`
- `PATCH /technician/orders/:id/status` — body `{ status, finalPrice? }`
- `GET /technician/earnings`

### Shared (Bearer token, customer or technician)
- `GET /orders/:id`
- `GET /orders/:id/chat`
- `POST /orders/:id/chat` — body `{ text? | imageUrl? }`
- `POST /orders/:id/dispute` — body `{ reason, description?, attachments? }`

### Admin
- `POST /admin/login` — body `{ email, password }`
- All other admin routes require `Bearer` admin token:
  - `GET /admin/dashboard-stats`
  - `GET /admin/technicians?status=pending`
  - `PATCH /admin/technicians/:id/approve|reject|suspend`
  - `GET /admin/orders`, `GET /admin/orders/:id`
  - `GET /admin/disputes`, `PATCH /admin/disputes/:id/resolve`
  - `POST /admin/categories`, `DELETE /admin/categories/:slug`
  - `GET /admin/settings`, `PATCH /admin/settings/:key`
  - `POST /admin/admins` — create another admin

## Socket.IO events

Connect with `auth: { token: <accessToken> }`.

### Client → Server
- `order:join_room` (orderId) — subscribe to updates for an order
- `order:leave_room` (orderId)
- `technician:location_update` `{ lat, lng }`

### Server → Client
- `order:available` — new order in technician's area (technician room)
- `order:new_offer` — incoming offer (customer room)
- `order:offer_accepted` / `order:offer_rejected` (technician room)
- `order:status_changed` (order room)
- `order:technician_location` (order room — live tracking)
- `chat:new_message` (order room)

## Testing the order flow end-to-end

1. Start server + seed.
2. POST `/auth/send-otp` with a customer phone. Use OTP `123456` in dev.
3. POST `/auth/verify-otp` to get customer tokens.
4. Repeat with a different phone + role=technician.
5. Approve the technician via admin login + `PATCH /admin/technicians/:id/approve`.
6. Technician: set online + update location + add a category from `GET /categories`.
7. Customer: `POST /customer/orders`.
8. Technician: `GET /technician/nearby-orders` → see the new order.
9. Technician: `POST /technician/orders/:id/offer` `{ price: 2000 }`.
10. Customer: `GET /customer/orders/:id` → see offer → `PATCH .../accept-offer`.
11. Technician progresses status: `enroute` → `arrived` → `in_progress` → `completed`.
12. Customer rates: `POST /customer/orders/:id/rate`.

## Next steps

- File uploads via Cloudinary (replace photo URLs in onboarding/orders)
- Real SMS provider (swap `SMS_PROVIDER=twilio` once Twilio account is set up)
- Payment gateway integration (JazzCash, EasyPaisa) — Phase 5 of roadmap
- Background jobs (offer expiry, abandoned order cleanup)
