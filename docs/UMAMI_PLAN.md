# Umami Analytics Integration Plan (Approved & Implemented)

## Overview
This document outlines the architecture and implementation details for the Umami Analytics integration, primarily serving as a transparent "pitch deck" for sponsors at `/stats`.

## Architecture
- **Analytics Database:** Neon (Serverless Postgres). Chosen to keep analytics separate from core project data (which resides in Supabase) while maintaining a frugal $0 stack.
- **Project Database:** Supabase (Matches, Tickets, Watch Parties).
- **Compute:** Self-hosted Umami instance deployed via Vercel connecting to the Neon DB.

## The `/stats` Page ("Sponsor Magnet")
A public-facing page (`src/pages/stats/index.astro`) designed to prove engagement to potential sponsors.
- **Hybrid Layout:** 
  - **Custom App Data:** Showcases mocked/dynamic data like "Matches Viewed", "Reminders Set", and YouTube/Instagram Reel views.
  - **Live Proof Iframe:** Embeds the public cryptographic Umami share URL so sponsors can verify live traffic without leaving the site.
  - **Call to Action:** Direct email link for sponsorship inquiries.

## Advanced Tracking (Custom Events)
To prove deep engagement beyond page views, we utilize Umami's declarative tracking via `data-umami-event` attributes:
- **Calendar Syncs:** `data-umami-event="calendar_export_single"` and `calendar_export_bulk` on calendar download buttons.
- **Match Specifics:** Tracks which specific match (e.g., `Brazil vs Argentina`) and stage (e.g., `Semi Finals`) the user added to their calendar. Sponsors can view these breakdowns directly in the "Events" tab of the embedded dashboard.

## Database Management (Cost Control)
Because Umami logs every click, a 500MB free Neon tier could fill up during massive traffic spikes.
- **Rolling Window Script:** A manual SQL script (`docs/umami_cleanup.sql`) is provided. It runs `DELETE FROM website_event WHERE created_at < NOW() - INTERVAL '3 days';`. This clears granular logs while retaining high-level aggregated stats, saving disk space.
