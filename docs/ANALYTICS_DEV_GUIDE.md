# Analytics Developer Guide

This guide is for future developers taking over the `cupcal.online` project to understand how Umami analytics is implemented and how to add tracking for new events.

## 1. Global Setup
The core Umami tracking script is injected globally inside `src/layouts/BaseLayout.astro`. 
Because `BaseLayout` is used on every page (and contains the `<SponsorBanner />`), every page view automatically counts towards sponsor impressions without any extra code.

**Environment Variables Required:**
If you are running the project locally or deploying to Vercel, ensure your `.env` contains:
```env
UMAMI_WEBSITE_ID=ec0060bb-9aef-41d4-af2b-954c6184a2e1
```
*(See `.env.example` for the full list of variables).*

## 2. The `/stats` Page
The `src/pages/stats/index.astro` page is the public dashboard for sponsors.
- **Dynamic Content:** It currently contains mocked data arrays (`customStats` and `socialStats`). When connecting new Supabase data, replace these arrays with Supabase fetch queries.
- **Iframe Integration:** The page embeds the live Umami Share URL inside an `iframe` for transparent proof.

## 3. Custom Event Tracking (How to add new events)
We use **declarative tracking** via HTML data attributes. This is the cleanest way to track events without writing custom Javascript `onClick` handlers.

### Example: Tracking a Button Click
To track when a user clicks a button (e.g., "Share to WhatsApp"), simply add the `data-umami-event` attribute to the HTML element:

```html
<button data-umami-event="whatsapp_share">Share</button>
```

### Passing Custom Data Properties
You can pass additional metadata with the event (e.g., which team they shared, or which match). Append properties using the `data-umami-event-{propertyname}` format.

**Example from our Match Modal (`src/components/MatchModalReact.tsx`):**
```html
<button 
  data-umami-event="add_to_calendar"
  data-umami-event-match="Brazil vs Argentina"
  data-umami-event-stage="Semi Finals"
>
  Add to Calendar
</button>
```
When this button is clicked, Umami logs:
- **Event:** `add_to_calendar`
- **match:** `Brazil vs Argentina`
- **stage:** `Semi Finals`

Sponsors can view these exact properties dynamically in the "Events" tab of the Umami dashboard.

### Future Events to Implement
When adding new features, consider tracking:
- `data-umami-event="sponsor_click"` (when a user clicks the sponsor banner)
- `data-umami-event="watch_party_search"`
- `data-umami-event="download_match_graphic"`
