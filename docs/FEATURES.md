# 🛠️ Feature Specifications

## 🟢 Functional Requirements (Public-Facing)
*These features define the user experience and are communicated to the public.*

### 1. Calendar Utility (Core)
- **Localization:**
    - **Country Selector:** Users can select their country to automatically adjust match timings.
    - **Timezone:** Defaults to viewer's browser timezone but remains manually overridable via country selector.
- **Views:**
    - **Multi-Country Filter:** User can select one or multiple countries/teams to follow.
    - **Clutter-Free Mode:** Details are hidden by default to provide a clean, focused view. Non-selected teams are completely hidden from the list.
- **Filters:** Filter by Team, Group, Stage, or Venue.
- **Branded Downloads:**
    - **Personalized Export:** Filters results into a "Timeline" style PNG/JPG.
    - **Thematic Branding:** Background colors change based on selected teams (e.g., Yellow/Green for Brazil).
    - **Metadata:** Includes `cupcal.online` logo, a "follow for more" tagline, and a match-specific QR code.

### 2. Match Detail Pages (`/match/[id]`)
- **Dedicated URL:** Every match has a unique, SEO-friendly slug.
- **Countdown Timer:** Massive, real-time countdown to kick-off (DD:HH:MM:SS).
- **Calendar Alerts (Advanced):**
    - **Alert Center:** Horizontal chip-selector/scroller (5m, 15m, 30m, 1h, 2h, Custom).
    - **Multiple Alerts:** Users can select multiple chips to bundle multiple `VALARM` triggers into a single `.ics` file.
    - **Persistence:** Remembers user preferences for future visits via `localStorage`.
- **Reminders (.ics):**
    - **Implementation:** Client-side JavaScript generating a Blob.

### 3. Status/Story Generator
- **Mechanic:** A UI tool that allows users to generate "teaser" graphics for WhatsApp Status and Instagram Stories.
- **Templates:**
    - **Template A (Guess the Score):** Blurred/pixelated team names/flags with a "Who will win?" overlay.
    - **Template B (Match Day):** Rich, high-contrast match card with localized kick-off time and stadium info.
- **Branding:** Subtle watermark and QR code for organic distribution.

### 4. Watch Party Directory (/watch-party)
A community-driven directory of ethical and family-friendly screening locations.
- **Verification:** All entries are `pending_review` by default. Admin must manually toggle `is_verified` in the database.
- **Ethical Pledge:** Mandatory certification that the venue is family-friendly and alcohol-free during screenings.

### 5. Official Watch Party Ticketing (cupcal Hosted)
- **Landing Page & RSVP:** Users view event FAQs and Rules (family-friendly, no-alcohol). Mandatory checkbox required to agree to terms before purchase.
- **Modern Ticket Flow (Login-less):** 
    - Guest checkout via Razorpay -> User provides Email & WhatsApp.
    - Upon successful payment, a unique secure URL (`/ticket/[uuid]`) containing their QR code is generated.
    - Ticket link is sent via Email/WhatsApp. User can also search for their ticket on the website (`/my-ticket`) using their contact details.
- **Frontend Progress Bar:** Displays progress up to `max_tickets + max_tickets_buffer`.
- **Waitlist/Sold Out:** Once `tickets_sold >= (max_tickets + max_tickets_buffer)`, the "Buy Tickets" CTA is blocked.

## 🔴 Non-Functional Requirements (Internal Only)
*These requirements are for internal engineering and business logic and are NOT communicated publically.*

### 1. Content & SEO/AEO Strategy
- **Optimization:** Highly optimized for both traditional Search Engines (Google) and Answer Engines (Perplexity, ChatGPT, etc.).
- **Inbound Traffic:** A dedicated `/blog` or `/news` section for basic FAQs to drive inbound traffic.
- **Technical SEO:** Structured data (Schema.org) for Matches, Events, and How-To guides.

### 2. Sponsorship Model
- **Banner Placement:** Single non-intrusive placement.
- **Reporting:** **Manual ROI Reports.**
    - The system generates an HTML summary of Impressions/CTR via the Umami API.
    - Reports are **not** sent automatically. The admin (hammaadworks) must verify the data and send the email manually.
- **Payments:** **Razorpay** integration for all community patronage and ticket sales.

### 4. Ticketing Buffer Logic (Internal)
- **DB Variables in Supabase:**
    - `max_tickets`: The base capacity (e.g., 200).
    - `max_tickets_buffer`: The hidden buffer to account for cancellations (e.g., 50).
- **Checkout Logic:** 
    - **Phase 1 (Normal):** When `tickets_sold < max_tickets`, the progress bar visually fills up. Text shows "X tickets left" (where X = `max_tickets - tickets_sold`).
    - **Phase 2 (Buffer Urgency):** When `tickets_sold >= max_tickets` and `tickets_sold < (max_tickets + max_tickets_buffer)`. The visual progress bar remains capped at 100% full. The text switches to: "Y buffer tickets left. Though the capacity is full, we are accepting a few more because we don't want you to miss out!" (where Y = `(max_tickets + max_tickets_buffer) - tickets_sold`). This creates immense urgency.
    - **Phase 3 (Sold Out):** When `tickets_sold >= (max_tickets + max_tickets_buffer)`, the "Buy Tickets" button is locked.

### 5. Watch Party Operations (Internal)
- **Sponsor Management:** Public lead capture form for inquiries. Offline negotiation and manual promise tracking by admin.
- **Digital Experience (Live Dashboard):** A custom `/final` web app for attendees to use during pre-game and half-time. Features include:
    - Guess the Score / Live Trivia
    - Digital rewards (e.g., Jersey winner announcement)
- **Post-Event Feedback:** Simple feedback form on the website.

### 5. Technical Architecture
- **Rendering:** Astro (SSG for speed, SSR for dynamic directory/stats/ticketing).
- **Data Source:** Static JSON for match data; Neon for analytics; Supabase for project data (matches, tickets, community submissions).
- see `TECH_STACK.md` for more details