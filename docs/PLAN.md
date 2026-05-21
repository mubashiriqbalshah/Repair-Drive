# Master Plan

## 1. Concept

inDrive ka model — but cars ki jagah **home repair technicians**.

Customer ke ghar mein koi cheez kharab ho (AC, fridge, washing machine, oven, motor, electronics, plumbing, etc.). Wo app pe order place kare with:
- Problem description + photos
- Apni location (GPS pin)
- Apna offered budget (e.g. "Rs. 2000")

Nearby technicians ko notification jaye. Wo:
- Accept kar le offered price pe, **YA**
- Counter-offer bhejen ("Main Rs. 2500 mein kar dunga")

Customer multiple offers mein se choose kare → technician customer ke ghar jaye → kaam complete → payment + rating.

Platform commission le har order pe (e.g. 10–15%).

---

## 2. App Name

**Repair Drive** — official name (confirmed).

- Echoes "inDrive" branding which is the reference model — easy to explain ("Repair Drive is like inDrive but for repairs")
- "Drive" implies action/movement — technician comes TO the customer
- Works in both English and Urdu speakers' mouths

**To-do**: Buy `repairdrive.pk` and `repairdrive.com` domains, secure social handles (@repairdrive on Instagram, Facebook, TikTok).

**Logo direction**: Wrench + arrow (motion), or stylized "RD" monogram. Brand colors: keep one strong primary (suggestion: deep blue or orange — high recognition in PK market).

---

## 3. User Roles

### 3.1 Customer
Aam log jin ki ghar mein koi cheez kharab ho. Booking karte hain, technician choose karte hain, pay karte hain, rate karte hain.

### 3.2 Technician (Mistri/Ustaad)
Verified skilled workers. Categories ke hisaab se sign up karte hain (e.g. "AC technician", "Electrician"). Nearby orders dekh ke accept/counter-offer karte hain.

### 3.3 Admin (Platform owner — aap)
Sab kuch control karta hai: technicians approve karna, categories manage karna, disputes resolve karna, payments/commission, analytics.

---

## 4. Service Categories (MVP)

Pakistan market ke common repair needs:

1. **AC Repair** (Split AC, Window AC, gas refilling, service)
2. **Refrigerator Repair**
3. **Washing Machine Repair**
4. **Microwave / Oven Repair**
5. **Electric Motor / Water Pump**
6. **Electronics** (TV, LED, Home Theater)
7. **Electrician** (wiring, switches, fans, UPS)
8. **Plumber** (taps, pipes, geyser)
9. **Carpenter** (furniture repair, doors)
10. **Mobile / Laptop Repair**

Admin panel se categories add/remove ho sakti hain.

---

## 5. Core Order Flow (Happy Path)

```
1. Customer apne ghar se app open kare
2. Category select kare (e.g. "AC Repair")
3. Problem describe kare + photo upload (optional)
4. Location confirm kare (auto GPS or manual)
5. Apna budget enter kare (e.g. Rs. 2000) — optional, ya "Let technician quote"
6. "Find Technician" tap kare
   ↓
7. Backend nearby technicians (within X km radius) ko notification bheje
   ↓
8. Multiple technicians offers bhejen (accept Rs.2000, ya counter Rs.2500)
   ↓
9. Customer offers ki list dekhe (technician rating, distance, price)
10. Ek technician select kare
    ↓
11. Order confirmed → technician customer ke address pe jaye
12. Map pe live tracking (technician's location)
13. In-app chat / call button
    ↓
14. Technician pohanch ke "Arrived" mark kare
15. Diagnose + repair kare
16. "Job Complete" mark kare → customer confirm kare
    ↓
17. Payment (Cash on Delivery / JazzCash / EasyPaisa)
18. Customer technician ko rate kare (1–5 stars + review)
19. Technician customer ko bhi rate kare
    ↓
20. Platform commission deduct ho, technician wallet update ho
```

---

## 6. Critical Edge Cases (must handle)

- **No technician available** → Suggest customer increase budget or wait
- **Technician cancels after accepting** → Re-broadcast to others, penalty on technician
- **Customer cancels after technician arrived** → Visit charge applies
- **Dispute** (kaam theek nahi hua, technician overcharge kiya) → Admin intervention
- **Fake/spam orders** → Phone OTP verification, ban repeat offenders
- **Payment failure** → Cash fallback
- **Off-route** (technician went elsewhere mid-trip) → GPS alerts
- **Multiple offers timing out** → Auto-expire after 5 min

---

## 7. Trust & Safety (MUST for adoption)

Pakistan market ka biggest concern: "Yeh banda ghar aa raha hai, koi chori na kar le."

- Technician verification: **CNIC required**, photo, address proof
- Background check (manual review by admin)
- "Verified" badge on profile
- Customer rating visible to technician (both ways)
- SOS button in-app for customer
- Share live trip with family member
- All chats/calls logged

---

## 8. Monetization

1. **Commission**: Configurable from admin panel (start at 12% suggested). Per-category override possible (e.g. AC repair higher margin → 15%, plumber lower → 10%).
2. **Featured listings**: Top technicians pay for priority in search
3. **Subscription** (later): Premium tier for technicians (more orders, lower commission)
4. **Customer subscription** (later): "Care+" plan for unlimited service calls

**Launch city**: Lahore (Phase 7). Expand to Karachi, Islamabad, Faisalabad after stable.

**Domain**: Purchase `repairdrive.pk` and `repairdrive.com` after MVP is complete (closer to launch). For development use `localhost` and a test subdomain.

---

## 9. Out of Scope (for now)

Build na karein abhi — Phase 2/3 ke liye:

- Spare parts marketplace
- Annual maintenance contracts (AMC)
- Multi-language beyond Urdu + English
- iOS app (focus Android first, larger PK market share)
- AI diagnosis from photos
- Video call for remote diagnosis
- Insurance for repairs

---

## 10. Success Metrics (post-launch)

- DAU (Daily Active Users)
- Orders per day
- Match rate (orders that find technician within 10 min)
- Completion rate (% orders completed vs cancelled)
- Average rating (target: 4.5+)
- Repeat customer rate
- Technician retention

---

## Next Steps

1. Review [FEATURES.md](FEATURES.md) for detailed features per role
2. Review [ARCHITECTURE.md](ARCHITECTURE.md) for tech decisions
3. Review [ROADMAP.md](ROADMAP.md) for phased plan
4. Confirm app name
5. Start MVP build (Phase 1)
