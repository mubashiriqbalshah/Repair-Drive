# Brand Guide — Repair Drive

Locked design decisions. Use these tokens everywhere (customer app, technician app, admin panel) for visual consistency.

---

## Colors

### Primary palette

| Role | Hex | RGB | Use case |
|------|-----|-----|----------|
| **Primary** | `#059669` | `5, 150, 105` | Brand color, primary buttons, links, active states, logo |
| **Primary dark** | `#047857` | `4, 120, 87` | Button hover/press, headers on dark mode |
| **Primary light** | `#10B981` | `16, 185, 129` | Highlights, success badges, online indicator |
| **Accent / Text** | `#1F2937` | `31, 41, 55` | Body text, headings, secondary buttons |
| **Background** | `#FFFFFF` | `255, 255, 255` | App background |
| **Surface** | `#F9FAFB` | `249, 250, 251` | Card backgrounds, modals |
| **Border** | `#E5E7EB` | `229, 231, 235` | Dividers, input borders |

### Semantic colors

| Role | Hex | Use case |
|------|-----|----------|
| **Success** | `#10B981` | Order confirmed, payment success |
| **Warning** | `#F59E0B` | Pending verification, low balance |
| **Error** | `#EF4444` | Failed payment, cancellation |
| **Info** | `#3B82F6` | Information banners |

### Text colors

| Role | Hex |
|------|-----|
| **Heading** | `#111827` |
| **Body** | `#1F2937` |
| **Muted** | `#6B7280` |
| **Disabled** | `#9CA3AF` |
| **On primary** | `#FFFFFF` |

### Quick preview

```
PRIMARY        DARK           LIGHT          ACCENT
#059669        #047857        #10B981        #1F2937
(buttons,      (hover/        (badges,       (text,
 logo, CTA)     pressed)       success)       headings)

SURFACE        BORDER         MUTED TEXT     ERROR
#F9FAFB        #E5E7EB        #6B7280        #EF4444
```

---

## Logo

### Concept: Wrench + Arrow

A wrench icon combined with a directional arrow. The arrow communicates motion / delivery / "drive" — the technician comes TO the customer.

### Direction (design brief for designer or AI tool)

```
Concept:
- A wrench (spanner) angled at ~45° pointing forward-up-right
- The handle of the wrench tapers into an arrow point at its end
- OR: A separate arrow swooping around the wrench head (like Nike's swoosh wrapping a tool)

Style:
- Flat / minimal (NOT detailed, NOT 3D, NOT skeuomorphic)
- Single color: primary green (#059669) on white background
- Reverse: white on green for dark/header use
- Bold enough to be readable at 24px favicon size

Wordmark:
- "Repair Drive" in modern sans-serif (suggested: Inter, Poppins, or Plus Jakarta Sans)
- Bold weight (700)
- Letter spacing: slightly tight (-1%)
- Title case: "Repair Drive" (not all caps, not all lowercase)

Lockups:
1. Icon only (square)        — app icon, favicon
2. Icon + wordmark (horizontal) — splash, web header
3. Icon + wordmark (stacked)   — print, business cards
```

### Where to get it made

Cheap options:
1. **Recraft.ai** — AI logo generator, $0–10/month. Generate variations, pick best, refine.
2. **Looka** — AI logo + brand kit, ~$20 one-time.
3. **Fiverr** — designers from $10–50. Search "modern flat logo wrench".

Premium:
- **99designs** — design contest ~$300–500. Multiple designers compete.
- Hire a local PK designer on Daraz Freelancer ~Rs 5000–15,000.

**Brief for any designer**: paste this entire BRAND.md document.

---

## Typography

### Mobile apps (React Native)

- **Primary font**: Inter (free, Google Fonts) — excellent Latin readability, modern
- **Urdu font**: Noto Nastaliq Urdu (free, Google Fonts) — proper Nastaliq rendering
- **Numbers**: Use Inter (don't switch to Urdu numerals — confuses users)

### Scale

| Token | Size | Weight | Use case |
|-------|------|--------|----------|
| `display` | 32px | 700 | Big headings, splash |
| `h1` | 24px | 700 | Screen titles |
| `h2` | 20px | 600 | Section headings |
| `h3` | 18px | 600 | Card titles |
| `body` | 16px | 400 | Body text |
| `bodySmall` | 14px | 400 | Secondary info |
| `caption` | 12px | 500 | Labels, timestamps |
| `button` | 16px | 600 | Button labels |

### Line height

- Headings: 1.2
- Body: 1.5
- Urdu body: 1.8 (Nastaliq needs more breathing room)

---

## Spacing & Layout

Use 4px base scale:

```
xs:  4px    sm:  8px    md:  16px   lg:  24px
xl:  32px   2xl: 48px   3xl: 64px
```

### Radii

- `sm`: 4px (chips, small badges)
- `md`: 8px (buttons, inputs, cards)
- `lg`: 12px (large cards, modals)
- `xl`: 16px (hero cards)
- `full`: 9999px (pills, avatars)

### Shadows

- `sm`: `0 1px 2px rgba(0,0,0,0.05)` — subtle card lift
- `md`: `0 4px 6px rgba(0,0,0,0.1)` — pressed/elevated state
- `lg`: `0 10px 15px rgba(0,0,0,0.1)` — modals, dropdowns

---

## Components — Quick Specs

### Primary button

```
BG:        #059669
Text:      #FFFFFF
Padding:   12px 24px
Radius:    8px
Font:      Inter 600, 16px
Pressed:   BG → #047857
Disabled:  BG → #D1D5DB, Text → #6B7280
```

### Secondary button

```
BG:        transparent
Border:    1.5px solid #059669
Text:      #059669
Padding:   12px 24px
Radius:    8px
```

### Input field

```
BG:        #FFFFFF
Border:    1px solid #E5E7EB
Border-focused: 2px solid #059669
Padding:   12px 16px
Radius:    8px
Text:      Inter 400, 16px, #1F2937
Placeholder: #9CA3AF
```

### Card

```
BG:        #FFFFFF
Border:    1px solid #E5E7EB
Radius:    12px
Padding:   16px
Shadow:    sm
```

---

## Code: Shared theme tokens

Place this in a shared package or copy across projects:

### `theme.ts` (TypeScript)

```ts
export const colors = {
  primary: '#059669',
  primaryDark: '#047857',
  primaryLight: '#10B981',
  accent: '#1F2937',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  text: {
    heading: '#111827',
    body: '#1F2937',
    muted: '#6B7280',
    disabled: '#9CA3AF',
    onPrimary: '#FFFFFF',
  },
} as const

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64,
} as const

export const radii = {
  sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
} as const

export const typography = {
  display:    { fontSize: 32, fontWeight: '700', lineHeight: 38 },
  h1:         { fontSize: 24, fontWeight: '700', lineHeight: 29 },
  h2:         { fontSize: 20, fontWeight: '600', lineHeight: 24 },
  h3:         { fontSize: 18, fontWeight: '600', lineHeight: 22 },
  body:       { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  bodySmall:  { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  caption:    { fontSize: 12, fontWeight: '500', lineHeight: 14 },
  button:     { fontSize: 16, fontWeight: '600', lineHeight: 19 },
} as const

export const theme = { colors, spacing, radii, typography } as const
```

### `theme.css` (for admin panel — Tailwind config extension)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#10B981',
        },
        accent: '#1F2937',
        surface: '#F9FAFB',
      },
    },
  },
}
```

---

## Voice & Tone

- **Friendly, not formal**: "Apka mistri raasta mein hai" not "The service provider is en route"
- **Bilingual mix is OK**: Pakistani audience reads Urdu-English mix naturally. Lean toward English for nouns (Order, Payment) and Urdu for emotions/instructions.
- **Action-oriented**: Buttons say what they DO ("Find Technician" not "Submit")
- **Confidence over politeness**: "Order confirmed" not "Your order has been confirmed, thank you"

### Sample copy

| English | Urdu mix |
|---------|----------|
| Find Technician | Mistri Dhoondein |
| Your order is on the way | Apka order raasta mein hai |
| Rate your experience | Apna experience rate karein |
| Sorry, no technicians nearby | Maazrat, qareeb koi mistri nahi mila |
| Tap to retry | Dobara try karein |
