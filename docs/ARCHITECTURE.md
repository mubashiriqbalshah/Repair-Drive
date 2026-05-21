# Architecture

## 1. Tech Stack

### Frontend (Mobile Apps)
- **Framework**: React Native (CLI, not Expo — for native modules like background location)
- **Language**: TypeScript
- **State management**: Zustand (client state — auth, UI) + TanStack Query / @tanstack/react-query (server state + caching)
- **Navigation**: React Navigation v6
- **Maps**: react-native-maps (Google Maps)
- **Push notifications**: Firebase Cloud Messaging (FCM)
- **Real-time**: Socket.IO client
- **Forms**: React Hook Form + Zod (validation)
- **UI components**: React Native Paper or NativeBase
- **Image picker**: react-native-image-picker
- **Localization**: i18next (Urdu + English)

### Frontend (Admin Panel)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Tables/Charts**: TanStack Table + Recharts
- **Auth**: NextAuth.js (admin-only)

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js (with TypeScript)
- **Database**: MongoDB (Atlas) — flexible schema, good for evolving requirements
- **ODM**: Mongoose
- **Real-time**: Socket.IO server
- **Auth**: JWT (access + refresh tokens), bcrypt for passwords
- **File storage**: AWS S3 or Cloudinary (CNIC photos, repair photos)
- **SMS / OTP**: Local PK provider (Jazz/Telenor SMS API) as primary, Twilio as fallback — see [SMS Provider Comparison](#sms-provider-comparison) below
- **Maps & geocoding**: Google Maps Platform (Geocoding, Distance Matrix)
- **Payments**: JazzCash + EasyPaisa APIs (integrate after MVP)
- **Validation**: Zod (shared types with frontend)

### DevOps
- **Hosting (backend)**: Railway / Render / DigitalOcean
- **Hosting (admin)**: Vercel
- **DB hosting**: MongoDB Atlas (free tier for MVP)
- **CDN**: Cloudflare
- **Monitoring**: Sentry (errors) + LogRocket (sessions)
- **CI/CD**: GitHub Actions

---

## 2. Why These Choices

| Choice | Reason |
|--------|--------|
| React Native (not Expo) | Need background location for technicians; Expo's bare workflow possible but plain RN is cleaner for native modules |
| MongoDB (not SQL) | Schema will evolve a lot during MVP; flexible documents fit order/chat/profile data |
| Socket.IO (not raw WebSocket) | Auto-reconnect, rooms (per-order channel), fallback to polling |
| JWT (not sessions) | Stateless, works across mobile + web admin |
| Tailwind + shadcn | Fast admin panel UI without designing components from scratch |
| Twilio (or local) | Phone OTP is critical — must be reliable in Pakistan |

---

## 3. Database Schema (MongoDB Collections)

### `users` (Customers)
```js
{
  _id: ObjectId,
  phone: "+923001234567",          // unique
  name: String,
  profilePhoto: String,             // URL
  addresses: [
    { label: "Home", lat, lng, fullAddress, landmark, isDefault }
  ],
  createdAt: Date,
  lastActiveAt: Date,
  banned: Boolean,
  fcmTokens: [String]               // device tokens for push
}
```

### `technicians`
```js
{
  _id: ObjectId,
  phone: "+923001234567",
  name: String,
  profilePhoto: String,
  cnic: "12345-1234567-1",          // hashed in DB
  cnicFrontPhoto: String,           // S3 URL
  cnicBackPhoto: String,
  selfieWithCnic: String,
  categories: ["ac", "electrician"],
  experienceYears: Number,
  serviceAreas: ["Lahore", "Gujranwala"],
  bankAccount: { accountTitle, accountNumber, bankName },
  status: "pending" | "approved" | "rejected" | "suspended",
  rejectionReason: String,
  rating: Number,                   // avg
  ratingCount: Number,
  totalJobs: Number,
  totalEarnings: Number,
  walletBalance: Number,
  isOnline: Boolean,
  currentLocation: { lat, lng, updatedAt },
  createdAt: Date,
  fcmTokens: [String]
}
```

### `categories`
```js
{
  _id: ObjectId,
  slug: "ac",                       // "ac" | "fridge" | ...
  nameEn: "AC Repair",
  nameUr: "اے سی مرمت",
  icon: String,
  subcategories: [
    { slug: "split-ac", nameEn, nameUr }
  ],
  baseSuggestedPrice: Number,       // for display only
  commissionPercent: Number,        // overrides global default
  active: Boolean,
  order: Number                     // display order
}
```

### `orders`
```js
{
  _id: ObjectId,
  customerId: ObjectId,
  technicianId: ObjectId,            // null until assigned
  category: String,
  subcategory: String,
  problemDescription: String,
  photos: [String],
  location: { lat, lng, fullAddress, landmark },
  customerBudget: Number,             // can be null
  agreedPrice: Number,                // set when offer accepted
  finalPrice: Number,                 // set on completion (might differ)
  platformCommission: Number,
  technicianPayout: Number,
  status: "searching" | "assigned" | "enroute" | "arrived" |
          "in_progress" | "completed" | "cancelled" | "disputed",
  cancellationReason: String,
  cancelledBy: "customer" | "technician" | "system",
  offers: [
    {
      technicianId: ObjectId,
      price: Number,
      note: String,
      createdAt: Date,
      status: "pending" | "rejected" | "accepted"
    }
  ],
  timeline: [
    { event: "created", at: Date },
    { event: "assigned", at: Date },
    ...
  ],
  customerRating: { stars, review, ratedAt },
  technicianRating: { stars, review, ratedAt },
  paymentMethod: "cash" | "jazzcash" | "easypaisa",
  paymentStatus: "pending" | "paid" | "refunded",
  createdAt: Date,
  updatedAt: Date
}
```

### `chats`
```js
{
  _id: ObjectId,
  orderId: ObjectId,                  // 1 chat per order
  messages: [
    {
      senderId: ObjectId,
      senderRole: "customer" | "technician",
      text: String,
      type: "text" | "image" | "system",
      sentAt: Date,
      readAt: Date
    }
  ]
}
```

### `transactions`
```js
{
  _id: ObjectId,
  orderId: ObjectId,
  technicianId: ObjectId,
  customerId: ObjectId,
  amount: Number,
  commission: Number,
  technicianPayout: Number,
  type: "order_payment" | "withdrawal" | "refund" | "penalty",
  status: "pending" | "completed" | "failed",
  paymentMethod: String,
  createdAt: Date
}
```

### `disputes`
```js
{
  _id: ObjectId,
  orderId: ObjectId,
  raisedBy: "customer" | "technician",
  reason: String,
  description: String,
  attachments: [String],
  status: "open" | "investigating" | "resolved",
  resolution: String,
  resolvedBy: ObjectId,                // admin id
  createdAt: Date,
  resolvedAt: Date
}
```

### `admins`
```js
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  role: "super_admin" | "support" | "finance",
  permissions: [String],
  createdAt: Date,
  lastLoginAt: Date
}
```

### `notifications`
```js
{
  _id: ObjectId,
  userId: ObjectId,
  userRole: "customer" | "technician",
  type: String,
  title: String,
  body: String,
  data: Object,                       // deep link payload
  read: Boolean,
  createdAt: Date
}
```

---

## 4. API Endpoints (REST)

Base URL: `https://api.repairdrive.pk/v1`

### Auth
```
POST   /auth/send-otp              { phone }
POST   /auth/verify-otp            { phone, otp, role }   → JWT
POST   /auth/refresh               { refreshToken }       → new JWT
POST   /auth/logout
```

### Customer
```
GET    /customer/profile
PATCH  /customer/profile
POST   /customer/addresses
DELETE /customer/addresses/:id
GET    /customer/orders
GET    /customer/orders/:id
POST   /customer/orders                                   create new order
PATCH  /customer/orders/:id/accept-offer  { offerId }
PATCH  /customer/orders/:id/cancel        { reason }
POST   /customer/orders/:id/rate          { stars, review }
```

### Technician
```
POST   /technician/onboard         (CNIC docs upload)
GET    /technician/profile
PATCH  /technician/profile
PATCH  /technician/online-status   { isOnline }
PATCH  /technician/location        { lat, lng }
GET    /technician/nearby-orders   ?lat=&lng=&radius=
POST   /technician/orders/:id/offer  { price, note }
PATCH  /technician/orders/:id/status { status }
GET    /technician/earnings
POST   /technician/withdraw
```

### Order (shared)
```
GET    /orders/:id
GET    /orders/:id/chat
POST   /orders/:id/chat            { text | imageUrl }
POST   /orders/:id/dispute         { reason, description }
```

### Categories
```
GET    /categories                  public — for browsing
```

### Admin
```
POST   /admin/login                { email, password }
GET    /admin/dashboard-stats
GET    /admin/technicians          ?status=pending
PATCH  /admin/technicians/:id/approve
PATCH  /admin/technicians/:id/reject  { reason }
GET    /admin/orders
GET    /admin/disputes
PATCH  /admin/disputes/:id/resolve
POST   /admin/categories
PATCH  /admin/categories/:id
GET    /admin/payouts
POST   /admin/payouts/:id/process
GET    /admin/settings
PATCH  /admin/settings
```

---

## 5. Real-time Events (Socket.IO)

Each connected client joins rooms based on their role + active orders.

### Server → Client events
- `order:new_offer` — to customer when technician sends offer
- `order:offer_accepted` — to technician when customer picks them
- `order:offer_rejected` — to other technicians who offered
- `order:status_changed` — both parties when status updates
- `order:technician_location` — to customer with live location
- `chat:new_message` — both parties
- `notification:new` — generic push for in-app banner

### Client → Server events
- `technician:location_update` — every 10–20 sec while on active job
- `order:join_room` — when opening an active order screen
- `chat:send_message`

---

## 6. Security Considerations

- All endpoints require JWT except `/auth/*` and `GET /categories`
- Rate limiting on OTP endpoint (max 3 per phone per 15 min)
- CNIC numbers hashed at rest, photos in private S3 bucket with signed URLs
- Phone numbers masked in chat/calls (use Twilio masking or similar)
- HTTPS only
- Input validation with Zod on every endpoint
- MongoDB indexes on lookups (phone, orderId, location)
- Geo-index on `technicians.currentLocation` for nearby queries
- Helmet.js for HTTP security headers
- CORS whitelist admin panel domain only

---

## 7. SMS Provider Comparison

OTP delivery is **critical** — if it fails, users can't sign up. Cost matters because every signup + login burns SMS.

| Provider | Cost per SMS to PK | Reliability for PK numbers | Setup difficulty | Notes |
|----------|--------------------|----------------------------|------------------|-------|
| **Twilio** | ~$0.05–0.075 (Rs 14–21) | Good but routes via international gateway | Easy — best docs in industry | Overkill cost for high volume in PK |
| **Jazz SMS API** | ~Rs 0.50–1 per SMS | Excellent for Jazz numbers, good for others | Medium — corporate account required, KYC | Need to register as business |
| **Telenor SMS API** | ~Rs 0.60–1 per SMS | Excellent for Telenor numbers | Medium — same as Jazz | Same setup as Jazz |
| **Veevotech / BulkSMS.pk** | ~Rs 0.40–0.80 | Good across all PK networks | Easy — sign up online | Aggregators, route to multiple networks |
| **MSG91 (India-based)** | ~Rs 0.50 | Decent for PK | Easy — modern API | Good docs, cheaper than Twilio |

**Recommendation**:
- **MVP / Development**: Twilio (test credits free, easy setup, just for testing flow)
- **Production launch**: Switch to **Veevotech** or **BulkSMS.pk** (aggregator covers all PK networks, much cheaper)
- **Future at scale**: Direct Jazz + Telenor enterprise accounts when volume justifies the KYC overhead

**Cost example** (10,000 OTPs/month):
- Twilio: ~Rs 150,000/month
- Veevotech: ~Rs 6,000/month
- Direct Jazz/Telenor: ~Rs 5,000–8,000/month

Build SMS as an interface in code so we can swap providers without rewriting:

```ts
interface SmsProvider {
  sendOtp(phone: string, code: string): Promise<{ success: boolean }>
}
// Implementations: TwilioSmsProvider, VeevotechSmsProvider, etc.
```

---

## 8. Geo-Queries (Nearby Technicians)

MongoDB supports geospatial indexes. Setup:

```js
technicians.createIndex({ currentLocation: "2dsphere" })

// Find technicians within 10km of customer
db.technicians.find({
  isOnline: true,
  status: "approved",
  categories: "ac",
  currentLocation: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 10000   // 10km
    }
  }
})
```
