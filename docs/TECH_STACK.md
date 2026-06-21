# 🏗️ Final Tech Stack: cupcal.online

This stack is selected for **extreme performance**, **zero-cost scaling**, and **sponsorship transparency**.

## 1. Core Engine: [Astro](https://astro.build/)
- **Strategy:** Static Site Generation (SSG) + Interactive Islands.
- **Why:** Delivers 100/100 Lighthouse scores. Raw HTML is served via CDN. 
- **Interactive Islands:** **React** or **Preact** is used for the "App-like" features:
    - **Country Selector:** Searchable multi-select for instant schedule filtering.
    - **Alert Center:** Horizontal scroller for multi-alert `.ics` configuration.
    - **Branded Exporter:** Raw **HTML Canvas API** to generate personalized PNG/JPGs without external server dependencies.

## 2. Deployment: [Vercel](https://vercel.com/)
- **Strategy:** Edge Network Distribution.
- **Why:** The closest server to a fan in Bengaluru or London will serve the file. Vercel's free tier is robust enough for high-volume static traffic.
- **Custom Domain:** `cupcal.online` mapping.

## 3. The "Sponsor Magnet": [Umami Analytics](https://umami.is/)
- **Strategy:** Public-facing, Privacy-focused Analytics.
- **Why:** To attract sponsors, you need **proof**. Umami allows you to share a "Public Link" (mapped to `cupcal.online/stats`). 
- **Implementation:** Self-hosted (Frugal) on Neon. Shows real-time visitors, countries, and device types to potential patrons.

## 4. Business Layer: "Community Patron" System
- **Banner Engine:** Simple Astro components that pull sponsor data from a `sponsors.json`.
- **Payments:** **Razorpay** (Tailored for the Indian ecosystem and global support).
- **Patron Landing Pages:** Lightweight, dedicated routes (e.g., `/patrons/brand-name`).

## 5. Persistence
- **Analytics Database:** [Neon](https://neon.tech/) (Serverless Postgres) for Umami Analytics.
- **Project Database:** [Supabase](https://supabase.com/) for all project-related data (matches, tickets, watch parties).
- **Why:** Keeps analytics separate from core project data.

---

## 🚨 Cost & Limit Audit (The "Red Flag" Report)

As a frugal, bootstrapped application, we must monitor the "Free Tiers" of our chosen stack.

### 1. Vercel (Hosting & Middleware)
- **Tier:** Hobby (Free)
- **Limits:** 100 GB Bandwidth, 1,000,000 Edge Middleware invocations.
- **🛡️ Mitigation:** Configure `middleware.ts` to ignore all `/assets`, `.css`, and `.js` files.

### 2. Postgres Database (Neon)
- **Tier:** Free (500 MB)
- **🚩 RED FLAG:** Umami logs every click. 1M events = ~150MB.
- **🛡️ Mitigation:** Implement a rolling 3-day "Hot Storage" window in Neon. A Vercel Cron job will export older events to Vercel Blob and delete them from Neon daily.

### 3. Resend (Email Reports)
- **Tier:** Free (3,000 emails / month).
- **Status:** **🟢 Safe.** Used for manual ROI report generation.

### 4. Cloudflare Turnstile (Anti-Bot)
- **Tier:** Free (1M widget solves / month).
- **Status:** **🟢 Safe.** Used for Watch Party and Sponsor submissions.

### 5. Razorpay (Payments)
- **Tier:** Pay-as-you-go.
- **Status:** **🟢 Safe.** Fees apply only on successful transactions.

---

### 💸 OpEx Summary
- **Total Monthly OpEx:** **$0.** (Excluding domain renewal).
