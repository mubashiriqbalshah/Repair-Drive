# User Flows

Screen-by-screen walkthrough for the most important flows. Use these as a reference when implementing screens.

---

## Flow 1 — Customer Places First Order

```
[Splash]
   ↓
[Onboarding carousel] (3 slides explaining the app)
   ↓
[Phone number entry]   → "Send OTP"
   ↓
[OTP entry]   → "Verify"
   ↓
[Name + profile photo]   → "Continue"
   ↓
[Home screen]
   - Greeting: "Salaam, Ali!"
   - Search bar
   - Categories grid (AC, Fridge, Washing Machine, etc.)
   - "Recent orders" section (empty for first-time)
   ↓ (tap "AC Repair")
[Category detail screen]
   - Subcategories (Split AC, Window AC, Inverter AC)
   - "Common issues" list (Not cooling, Water leaking, Noise)
   ↓ (tap subcategory or "Other issue")
[New order form]
   - Problem description (text)
   - Add photos button (up to 5)
   - Location section:
     - "Use current location" or "Pick on map"
     - Selected address shown
     - Edit landmark / house no.
   - Budget section:
     - Slider: Rs. 500 — Rs. 10,000
     - Or "Let technicians quote"
   - Schedule: "ASAP" / "Schedule for later"
   - "Find Technician" button
   ↓
[Finding technicians screen]
   - Animated radar/loading
   - "Searching nearby technicians..."
   - As offers come in, list appears below:
     ┌─────────────────────────────────┐
     │ Ahmed Khan ⭐ 4.8 (124 jobs)    │
     │ 2.3 km away · ETA 15 min       │
     │ Rs. 2,000 ✓ (your budget)       │
     │                  [View] [Accept]│
     └─────────────────────────────────┘
   ↓ (tap "Accept" on one)
[Order assigned screen]
   - "Ahmed is on his way!"
   - Map with technician's marker moving
   - ETA countdown
   - Technician card (name, photo, phone)
   - Buttons: [Chat] [Call] [Cancel]
   ↓ (technician arrives, marks "Arrived")
[Active job screen]
   - Status: "Technician is at your location"
   - Chat available
   ↓ (technician marks "Job complete" with final price)
[Payment screen]
   - Bill breakdown
   - Payment method (Cash selected by default)
   - "Confirm payment"
   ↓
[Rating screen]
   - "How was Ahmed's service?"
   - 5 stars + tap stars
   - Review text (optional)
   - Tip option (optional)
   - "Submit"
   ↓
[Thank you screen]
   - Order summary
   - "Book again" button
   - Back to home
```

---

## Flow 2 — Technician Onboarding + First Job

```
[Splash]
   ↓
[Welcome — pick role]   ("I want to book" / "I want to work")
   ↓ (tap "I want to work")
[Phone OTP — same as customer]
   ↓
[Personal info]
   - Full name
   - Date of birth
   - Address
   - CNIC number
   ↓
[Document upload]
   - CNIC front photo
   - CNIC back photo
   - Selfie holding CNIC
   ↓
[Skills selection]
   - Multi-select categories
   - For each: years of experience
   ↓
[Service area]
   - Pick cities you serve (max 3)
   ↓
[Bank details]
   - Account title
   - Account number
   - Bank name
   - Or JazzCash / EasyPaisa number
   ↓
[Submit for verification]
   ↓
[Pending screen]
   "Aap ki verification 24-48 hours mein ho jayegi.
    Approval ke baad app fully unlock ho jayegi."
   ↓ (admin approves)
[Push notification: "Account approved! Aap ab kaam shuru kar sakte hain."]
   ↓
[Home screen (technician)]
   - Online/Offline toggle (off by default)
   - Today's earnings: Rs. 0
   - "No active jobs"
   ↓ (toggle Online)
[Nearby orders screen]
   - Map showing pending orders nearby
   - List view toggle
   - Filter by category
   ↓ (new order appears with notification)
[Order details modal]
   - Category: AC Repair (Split AC, Not cooling)
   - Customer photos of unit
   - Distance: 2.3 km
   - Customer budget: Rs. 2,000
   - Customer rating: 4.5
   - Buttons:
     [Accept at Rs. 2,000]  [Counter-offer]
   ↓ (tap "Accept")
[Waiting for customer]
   "Aap ka offer customer ko bhej diya gaya."
   ↓ (customer accepts)
[Active job screen]
   - "Customer accepted you!"
   - [Navigate] button → opens Google Maps
   - Status buttons:
     ○ Starting
     ○ On the way
     ○ Arrived
     ○ Working
     ○ Complete
   - Chat / Call buttons
   ↓ (technician progresses through statuses)
[Job completion]
   - Enter final amount
     - Quoted: Rs. 2,000
     - Final: [____] (can be different)
   - Reason for difference (optional)
   - Mark "Cash received" or wait for digital payment
   ↓
[Rate customer]
   - 5 stars
   - "Submit"
   ↓
[Earnings updated]
   - Today: Rs. 2,000
   - Commission deducted: Rs. 300 (15%)
   - Your earning: Rs. 1,700
```

---

## Flow 3 — Admin Reviews Technician Verification

```
[Admin login]
   ↓
[Dashboard]
   - Pending verifications: 5 (badge)
   ↓ (click "Verifications")
[Verification queue]
   - Table: Name, Phone, Categories, Submitted At
   ↓ (click a row)
[Verification detail page]
   - Personal info
   - CNIC front + back photos (clickable to enlarge)
   - Selfie with CNIC
   - Selected categories
   - Buttons: [Approve]  [Reject with reason]
   ↓ (click Approve)
[Confirmation]
   - Push notification sent to technician
   - Status updated
   - Removed from queue
```

---

## Flow 4 — Dispute Handling

```
Customer file karta hai dispute (after job complete):
[Order detail]
   ↓ (tap "Report issue")
[Dispute form]
   - Issue type: Overcharged / Poor work / Damaged something / Other
   - Description
   - Attach photos
   - Submit
   ↓
[Dispute pending screen]
   - "Hamari team 24h mein contact karegi."

Admin side:
[Admin dashboard]
   - "Open disputes: 3"
   ↓
[Disputes queue]
   ↓ (click)
[Dispute detail]
   - Full order info
   - Chat log between customer + technician
   - Customer's complaint + photos
   - Action buttons:
     [Refund customer]  [Penalize technician]
     [Mark resolved no action]  [Need more info]
   ↓ (resolve)
- Both parties get notification with outcome
- If refund: amount processed
- If penalty: deducted from technician wallet
```

---

## Flow 5 — Re-book / Repeat Order

```
[Customer home]
   - "Recent orders" section shows last 3 orders
   ↓ (tap one)
[Order detail]
   - View past order
   - [Book again] button
   ↓
[New order form (prefilled)]
   - Category, location, problem all pre-filled
   - Edit anything
   - [Find Technician]
   - Optional: [Book same technician] (sends offer directly to that mistri first)
```

---

## Notes on UX

### Pakistan-specific UX
- **Bilingual**: Urdu fonts (Noto Nastaliq Urdu or Jameel Noori Nastaleeq). Toggle in profile or detect from device language.
- **Phone numbers**: Auto-format with +92 prefix. Validate against PK mobile pattern (3XX XXXXXXX).
- **Currency**: Always "Rs." prefix, comma-separated thousands (Rs. 2,500).
- **Cash-first**: Cash on Delivery as default — most users won't have digital payments setup initially.
- **Voice descriptions**: Consider voice-note option for problem description (Phase 2). Many users prefer voice over typing.
- **WhatsApp deep-link**: Always have a fallback "Contact us on WhatsApp" — Pakistani users trust this.

### Trust signals everywhere
- "Verified" badge prominently on technician cards
- Rating + job count visible before booking
- "Track live location" link to share with family
- Help button reachable from every screen
