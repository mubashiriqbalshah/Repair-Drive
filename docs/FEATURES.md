# Features Breakdown

Detailed feature list per role. **MVP** = Phase 1 must-have. **P2** = Phase 2. **P3** = Phase 3 (nice-to-have).

---

## Customer App

### Authentication & Profile (MVP)
- Phone number signup with OTP (no email needed — friction)
- Name, profile photo
- Multiple saved addresses (Home, Office, Other)
- Logout, delete account

### Service Booking (MVP)
- Browse service categories (with icons + names in Urdu+English)
- Search bar ("AC repair", "fridge"...)
- Create new order:
  - Select category
  - Subcategory (e.g. AC → Split / Window / Inverter)
  - Describe problem (text)
  - Upload photos (up to 5, optional)
  - Pick location (auto GPS or manual map pin)
  - Set address details (house no, landmark)
  - Enter budget OR "Let technicians quote"
  - Schedule: "ASAP" or "Schedule for later"

### Order Matching (MVP)
- Live screen: "Finding technicians..."
- Incoming offers list (real-time):
  - Technician name + photo
  - Rating + completed jobs count
  - Distance / ETA
  - Quoted price (highlighted if = customer's budget vs counter)
  - Specialization tags
- Tap to view full technician profile
- Accept one → others auto-rejected
- Cancel order button (with reason)

### Active Order Tracking (MVP)
- Map view with technician's live location
- ETA countdown
- Technician details + photo + phone
- In-app chat
- Call button (masked number for privacy)
- "Arrived" notification
- Status updates: En route → Arrived → In progress → Completed

### Payment (MVP)
- Cash on Delivery (default — Pakistan)
- JazzCash (P2)
- EasyPaisa (P2)
- Saved cards (P3)
- Final bill breakdown: service charge + parts + platform fee

### Post-Order (MVP)
- Rate technician (1–5 stars + optional review)
- Tip option (optional)
- Receipt
- Report issue / file dispute

### Order History (MVP)
- All past orders
- Re-book same technician
- Re-order for same problem

### Notifications (MVP)
- Push notifications for: new offer, technician arrived, order completed, etc.
- In-app notification center

### Other (P2/P3)
- Refer & earn (P2)
- Favorites — saved technicians (P2)
- Loyalty points / discounts (P3)
- Multi-language toggle (Urdu/English) (MVP — important)
- Help / FAQ / contact support (MVP)

---

## Technician App

### Authentication & Onboarding (MVP)
- Phone OTP signup
- **Verification flow (mandatory before going live)**:
  - Personal info: name, address, CNIC number
  - Upload CNIC front + back photo
  - Selfie holding CNIC
  - Select service categories you provide
  - Years of experience
  - Service area (cities/zones)
  - Bank account / mobile wallet for payouts
- Admin manually approves → "Verified" badge

### Profile (MVP)
- Public profile (what customer sees):
  - Name, photo, rating, total jobs, years experience
  - Categories
  - Verified badge
- Edit availability hours
- Toggle "Online / Offline" (only online sees orders)

### Order Discovery (MVP)
- Map view of nearby pending orders (within radius)
- List view alternative
- For each order shown:
  - Category + problem description
  - Distance
  - Customer's offered budget
  - Customer rating
- Tap to view full details + photos

### Bidding / Accepting (MVP)
- Two-tap accept at customer's budget, OR
- Enter counter-offer with price + optional note ("AC gas charge alag hoga")
- See if customer has accepted you (real-time)
- Auto-rejection if someone else accepted first

### Active Job (MVP)
- Navigation to customer location (Google Maps deep link)
- Customer details + masked phone
- Chat with customer
- Status buttons:
  - "On the way"
  - "Arrived"
  - "Starting work"
  - "Job complete" → enter final amount (if different from quoted)
- Mark cash received

### Earnings (MVP)
- Today / This week / This month earnings
- Pending payout (platform clearing)
- Transaction history
- Commission deducted shown per job
- Request withdrawal to bank/wallet (P2)

### Ratings & Reviews (MVP)
- See your rating + reviews from customers
- Rate the customer (one-way for now, mutual after both rate)

### Performance Dashboard (P2)
- Acceptance rate
- Cancellation rate
- Average rating trend
- Most repaired categories
- Peak earning hours

### Notifications (MVP)
- New order in your area
- Customer accepted your offer
- Customer is rating you
- Payout processed

---

## Admin Panel (Web)

### Dashboard (MVP)
- Today's stats: orders, revenue, new signups, active technicians
- Charts: orders over time, top categories, revenue trend
- Live order map

### Technician Management (MVP)
- Pending verification queue (KYC review)
  - View CNIC photos + selfie
  - Approve / reject with reason
- All technicians list (filter by status, category, rating)
- Suspend / ban
- View earnings + history

### Customer Management (MVP)
- All customers list
- Order history per customer
- Flag / ban abusers

### Order Management (MVP)
- All orders (live + completed + cancelled)
- Filter by status, date, category, city
- View full order details + chat logs (for disputes)
- Manually intervene if needed
- Refund processing

### Categories Management (MVP)
- Add / edit / remove service categories
- Subcategories
- Set base pricing suggestions
- Upload icons

### Disputes (MVP)
- Customer complaints queue
- View order + chat + photos
- Refund / penalize / resolve options
- Internal notes

### Payments (MVP)
- Pending payouts to technicians
- Approve / process payouts
- Platform commission earned
- Transaction logs

### Settings (MVP)
- Commission percentage (configurable per category)
- Service area / city coverage
- Verification requirements
- Cancellation policies
- Push notification templates

### Analytics (P2)
- Cohort analysis
- Funnel: signup → first order → repeat
- Technician performance reports
- City-wise breakdown
- Export to CSV

### Promotions (P2)
- Create promo codes
- Run referral campaigns
- Push announcements to users

### Roles (P2)
- Sub-admin accounts with limited permissions
- Activity audit log
