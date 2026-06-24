# 🎟️ Watch Party Ticketing System

> **Complete developer guide for the cupcal Finals Watch Party ticketing feature.**
> Updated: 2026-06-22

---

## 📋 Overview

cupcal (`cupcal.online`) hosts a **physical** FIFA World Cup 2026 **Finals-only** watch party on a local turf in Bangalore, India. This document covers the full ticketing system — from how a user discovers the event to how they show their QR code at the venue entrance.

**Key Constraints:**
- 🏟️ Physical event (not digital streaming)
- 🚫 No alcohol, family-friendly
- 👥 Capacity: 200 marketed + 50 buffer = 250 real
- 💳 PhonePe Payment Gateway (Indian ecosystem)
- 🔓 No user login/password system — entirely guest checkout

---

## 🗺️ Route Map

| Route | Purpose | Auth Required |
|---|---|---|
| `/finals` | Landing page with event details, progress bar, checkout form | None |
| `/ticket/[uuid]` | Individual ticket page with QR code (secret link) | UUID acts as auth |
| `/my-ticket` | Ticket lookup — user enters email/WhatsApp to find their ticket | None |
| `/final` | Live experience during the event (pre-game, half-time) | Future build |

---

## 🗄️ Database Schema (Supabase)

We use **Supabase** (Postgres) for all project data. Umami analytics lives separately on **Neon**.

### Table: `finals_events`

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | Primary key |
| `name` | TEXT | — | Event name |
| `description` | TEXT | — | Event description |
| `max_tickets` | INTEGER | 200 | Marketed capacity (shown to users) |
| `max_tickets_buffer` | INTEGER | 50 | Hidden buffer for cancellation safety |
| `price_in_cents` | INTEGER | 0 | Ticket price in paise (₹499 = 49900) |
| `created_at` | TIMESTAMPTZ | `now()` | Created timestamp |

### Table: `finals_tickets`

| Column | Type | Default | Description |
|---|---|---|---|
| `id` | UUID | `gen_random_uuid()` | Primary key — **this IS the secret ticket link** |
| `event_id` | UUID (FK) | — | References `finals_events.id` |
| `email` | TEXT | — | Buyer's email |
| `whatsapp` | TEXT | — | Buyer's WhatsApp number |
| `payment_status` | TEXT | `'pending'` | One of: `pending`, `paid`, `failed` |
| `phonepe_transaction_id` | TEXT | — | PhonePe merchant transaction ID |
| `phonepe_provider_reference_id` | TEXT | — | PhonePe provider reference ID (set after success) |
| `created_at` | TIMESTAMPTZ | `now()` | Created timestamp |
| `updated_at` | TIMESTAMPTZ | `now()` | Auto-updated via trigger |

### Row Level Security (RLS)

Both tables have RLS enabled:
- `finals_events`: Publicly readable (SELECT for all)
- `finals_tickets`: INSERT allowed for anon (checkout), SELECT allowed (ticket lookup), UPDATE allowed (payment webhook)

> ⚠️ **Security Note:** The ticket UUID itself acts as an authentication token. Since UUIDs are unguessable (122 bits of entropy), knowing a ticket ID = owning the ticket. This is the same pattern used by Google Docs share links.

---

## 🎯 The 3-Phase Progress Bar Logic

This is the **core business logic** for the ticketing frontend. The progress bar uses two DB variables to create urgency while maintaining a safety buffer.

### Variables
- `max_tickets` = 200 (marketed capacity)
- `max_tickets_buffer` = 50 (hidden buffer)
- `tickets_sold` = COUNT of `finals_tickets` WHERE `payment_status = 'paid'`

### Phase 1: Normal Sales (`tickets_sold < max_tickets`)

```
Progress bar width: (tickets_sold / max_tickets) * 100%
Bar color: Green gradient
Text: "🎟️ {max_tickets - tickets_sold} TICKETS LEFT"
CTA: Active — "BOOK MY SPOT — ₹499"
```

**Example:** 150 sold → "50 TICKETS LEFT", bar at 75%

### Phase 2: Buffer Urgency (`tickets_sold >= max_tickets AND < max_tickets + max_tickets_buffer`)

```
Progress bar width: 100% (capped, visually full)
Bar color: Amber/Orange gradient
Text: "🔥 {(max_tickets + max_tickets_buffer) - tickets_sold} BUFFER TICKETS LEFT"
Subtext: "Capacity is full, but we're still accepting a few more because we don't want you to miss out on the fun!"
CTA: Active — "BOOK MY SPOT — ₹499"
```

**Example:** 220 sold → "30 BUFFER TICKETS LEFT", bar at 100% (amber)

### Phase 3: Sold Out (`tickets_sold >= max_tickets + max_tickets_buffer`)

```
Progress bar width: 100%
Bar color: Red
Text: "🚫 SOLD OUT"
CTA: Disabled/Hidden
```

> 💡 **Why this works:** The user sees a capacity of 200. Once those sell, they see "buffer tickets left" with urgency messaging — this creates FOMO and a sense of exclusivity ("we're making an exception for you!"). Meanwhile, the buffer protects against revenue loss from cancellations/no-shows.

---

## 🛒 User Journey (Complete Flow)

```
1. User lands on /finals (from IG ad, WhatsApp share, or direct)
     ↓
2. Sees event details, progress bar, and rules
     ↓
3. Fills checkout form: Name, Email, WhatsApp
     ↓
4. Checks mandatory box: "I agree to the family-friendly, no-alcohol rules"
     ↓
5. Clicks "BOOK MY SPOT — ₹499"
     ↓
6. Redirects to PhonePe secure payment page
     ↓
7. On SUCCESS:
   a. PhonePe sends S2S webhook to /api/payment/callback
   b. User is redirected back to /api/payment/redirect
   c. System marks ticket as 'paid' and redirects to /ticket/[uuid]
     ↓
8. User sees their digital ticket with QR code
     ↓
9. On event day: User shows QR at entrance → scanned → admitted
```

### Lost Ticket Recovery

```
1. User visits /my-ticket
     ↓
2. Enters their email or WhatsApp number
     ↓
3. System queries finals_tickets WHERE email = X OR whatsapp = X
     ↓
4. If found: Shows masked email + "View Ticket" button → /ticket/[uuid]
5. If not found: "No ticket found — contact us"
```

---

## 🏗️ Tech Implementation Details

### Supabase Client

Located at `src/utils/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Server-Side Data Fetching (Astro Frontmatter)

The `/finals` page fetches event config and ticket count at build/request time:
```ts
const { data: event } = await supabase.from('finals_events').select('*').single();
const { count: ticketsSold } = await supabase
  .from('finals_tickets')
  .select('*', { count: 'exact', head: true })
  .eq('event_id', event?.id)
  .eq('payment_status', 'paid');
```

### React Islands

Interactive components use Astro's `client:load` directive:
- `TicketProgress.tsx` — Progress bar + checkout form
- `TicketLookup.tsx` — Ticket search on `/my-ticket`

### Environment Variables

| Variable | Where Used | Description |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key (safe for frontend) |
| `DATABASE_URL` | Server only | Direct Postgres connection via Supabase pooler |
| `SUPABASE_DB_PASSWORD` | Server only | DB password for admin operations |
| `PHONEPE_MERCHANT_ID` | Server only | PhonePe Merchant ID (e.g. PGTESTPAYUAT) |
| `PHONEPE_SALT_KEY` | Server only | PhonePe API Salt Key |
| `PHONEPE_SALT_INDEX` | Server only | PhonePe API Salt Index |
| `PHONEPE_ENV` | Server only | UAT or PROD |

---

## 💰 Sponsor System

Sponsors are handled **offline**. The website only provides lead capture:
- A contact form or mailto link on the `/finals` page
- Links to Instagram (@hammaadworks) and email (sponsor@cupcal.online)
- Promise tracking is done manually by admin (no dashboard)

---

## 🎮 Live Experience (`/final`) — Future Build

During the event, a digital companion at `/final` will provide:
- **Pre-game (30 min):** Guess the Score polls, trivia
- **Hydration breaks (3 min):** Quick sponsor shoutouts, fun facts
- **Half-time (30 min):** Live trivia, crowd polls, sponsor content
- **Post-match:** Winner announcement for trivia/lucky draw (e.g., jersey giveaway)

---

## 📝 Post-Event

- Simple feedback form on the website
- Collects: Rating (1-5), What did you enjoy?, Suggestions
- Stored in Supabase for analysis

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Access the site
open http://localhost:4321

# Key pages
# /finals — Landing + ticketing
# /ticket/[uuid] — Individual ticket
# /my-ticket — Ticket lookup
```

### Required Environment Variables
Copy `.env.example` to `.env` and fill in:
- `PUBLIC_SUPABASE_URL` — From Supabase Dashboard → Settings → API
- `PUBLIC_SUPABASE_ANON_KEY` — From Supabase Dashboard → Settings → API
- `DATABASE_URL` — From Supabase Dashboard → Settings → Database → Connection String (Transaction Mode)
- `SUPABASE_DB_PASSWORD` — Your Supabase database password

### Database Migrations
The schema is in `supabase_schema.sql` and `phonepe_migration.sql`. Run them against your Supabase instance:
```bash
psql "postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-YOUR_REGION.pooler.supabase.com:6543/postgres" -f supabase_schema.sql
psql "postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-YOUR_REGION.pooler.supabase.com:6543/postgres" -f phonepe_migration.sql
```

---

## 📁 File Structure (Ticketing Feature)

```
src/
├── components/
│   ├── TicketProgress.tsx    # 3-phase progress bar + checkout form (with PhonePe integration)
│   └── TicketLookup.tsx      # Ticket search component
├── pages/
│   ├── api/
│   │   └── payment/
│   │       ├── initiate.ts   # Generates PhonePe payload & returns redirect URL
│   │       ├── callback.ts   # S2S Webhook for async payment confirmation
│   │       └── redirect.ts   # Browser redirect handler after payment
│   ├── finals/
│   │   └── index.astro       # Landing page
│   ├── ticket/
│   │   └── [id].astro        # Individual ticket display
│   └── my-ticket.astro       # Ticket lookup page
├── utils/
│   └── supabase.ts           # Supabase client
docs/
├── WATCH_PARTY_TICKETING.md  # This file
supabase_schema.sql           # Database schema
.env                          # Environment variables (gitignored)
.env.example                  # Template for env vars
```
