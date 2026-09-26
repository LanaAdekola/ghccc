# Media Team Handover Guide

Welcome to the Glory Hills Community Church web platform handover document. This guide is crafted specifically for the church media and communications team, detailing how the website operates, how analytics and advertising tags connect, how SEO is managed, and which tasks can be performed without writing code.

---

## 1. Local capabilities; production verification pending

1. **Google Tag Manager (GTM) Container Layer**: Single tag-management container dynamically loaded from published Supabase marketing settings when configured and enabled in `/admin/marketing`. The runtime does not load GTM from environment variables.
2. **Interactive YouTube Sermon Embedding**: Embedded players supporting official church messages and archive playlists with privacy-respecting embeds (`youtube-nocookie.com`). Play requests emit `sermon_play_requested`.
3. **Hero Media Optimization**: Responsive media rendering — high-resolution photography on desktop viewports and web-optimized video on mobile viewports.
4. **Lead Pastor Spotlight**: Dedicated home screen feature section introducing Pastor Tobi Omojowo — Apostle, Prophet and Psalmist — with direct links to his ministry channels and dedicated bio page (`/meet-our-pastor`).
5. **Full SEO Architecture**: Automatic `/sitemap.xml`, `/robots.txt`, canonical URLs (`https://www.ghccglobal.com`), Open Graph / Twitter Card social previews, search icons/favicons, and Schema.org structured data for Church, Events, and Sermon VideoObjects.
6. **Admin-Editable SEO & Alt Text**: In-dashboard control over `seo_title` and `seo_description`. Meaningful alt text is required for public images; raw filenames are rejected, and decorative images can be intentionally marked.
7. **19 Allowlisted Event Names**: See the generated dictionary for reachability and configuration prerequisites; event handlers cover congregational engagement (listening, giving intent, event registration, visit planning, phone/email contact, newsletter).
8. **Strict Privacy Protection**: Client-side parameter filter limiting application event parameters and excluding names, emails, phones, prayer requests, bank accounts, or financial credentials.
9. **Confidentiality Rule**: **Prayer requests are confidential pastoral communications and must NEVER be tracked.** The `/prayer-request` route disables the analytics engine.
10. **Cookie Consent System**: User-friendly bottom banner on first visit linked to a combined optional-services `/cookies` preference page with cross-tab consent synchronization.

---

## 2. Exact Code Locations

| System Component | File Path | Description |
|---|---|---|
| **Tag Manager & DataLayer** | `web/components/analytics.tsx` | GTM script injector, dev/admin exclusions, and event dispatch logic |
| **Event Registry & Privacy** | `web/lib/events.mjs` | Authoritative event catalog and PII sanitization filter |
| **Cookie Consent Banner** | `web/components/consent-banner.tsx` | First-visit notification banner managing user analytics consent |
| **Cookie Preferences Page** | `web/components/consent.tsx` | Granular consent controls on `/cookies` |
| **YouTube Sermon Embeds** | `web/components/youtube-embed.tsx` | Privacy-enhanced YouTube player with play request tracking |
| **Homepage & Hero Media** | `web/app/page.tsx` | Hero responsive layout, Lead Pastor section, featured sermon |
| **Global Styles & Layout** | `web/app/globals.css` | Typography, media queries, channel pill styles, layout grids |
| **Root Layout & Meta Tags** | `web/app/layout.tsx` | Favicons, fonts, canonical tags, Church Schema.org JSON-LD |
| **SEO Metadata Generator** | `web/lib/seo.mjs` | Dynamic Open Graph, Twitter cards, canonical tags, JSON-LD encoder |
| **XML Sitemap** | `web/app/sitemap.ts` | Dynamic index of public pages, sermons, events, and galleries |
| **Robots Exclusion** | `web/app/robots.ts` | Crawler directives allowing public content and blocking `/admin` |
| **Admin Content Management** | `web/app/admin/(protected)/edit/[id]/page.tsx` | Dashboard editor with SEO title/description and alt text inputs |
| **Form Event Tracking** | `web/components/public-form.tsx` | Safe tracking for contact, visit, and newsletter submissions |
| **Bank Account Copying** | `web/components/copy-account.tsx` | Safe tracking for `bank_details_copied` |

---

## 3. Marketing Settings in the CMS (`/admin/marketing`)

The media team manages tracking directly inside the CMS at `/admin/marketing`:
* **Google Tag Manager**: Enter the container ID (`GTM-XXXXXXX`) and toggle **Enable Google Tag Manager**.
* **Reference Fields**: Enter GA4 ID (`G-XXXXXXXXXX`), Google Ads ID (`AW-XXXXXXXXX`), and Meta Pixel ID (`\d+`) for team reference when configuring GTM tags. Saving reference IDs does not activate tags directly.
* Tags only fire after the visitor explicitly grants consent on the public website.

---

## 4. Church Locations & Schedule

* **Headquarters**: 3rd Floor of Tejumola House, Plot 24 Ogunnusi Road (beside CLAM) in Ojodu Berger, Lagos.
  * Sunday: 8:00 AM – 1:00 PM (WAT)
  * Wednesday Prayer Meeting: 6:00 PM – 8:30 PM (WAT)
  * Friday Disciple’s Hub: 6:00 PM – 8:00 PM (WAT)
* **Isheri-Magodo**: 6 Ogun River Road, Isheri-Magodo, Lagos.

Production rollout and test limitations are recorded in PRODUCTION_EXECUTION_PLAN.md and PRODUCTION_READINESS_AUDIT.md. A saved identifier is not evidence that a tag is published or received.
