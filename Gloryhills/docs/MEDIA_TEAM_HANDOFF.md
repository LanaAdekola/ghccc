# Media Team Handover Guide

Welcome to the Glory Hills Community Church web platform handover document. This guide is crafted specifically for the church media and communications team, detailing how the website operates, how analytics and advertising tags connect, how SEO is managed, and which tasks can be performed without writing code.

---

## 1. What Has Been Installed

1. **Google Tag Manager (GTM) Container Layer**: Single tag-management container dynamically injected when `NEXT_PUBLIC_GTM_ID` is defined.
2. **Interactive YouTube Sermon Embedding**: Embedded players supporting official church messages and archive playlists with privacy-respecting embeds (`youtube-nocookie.com`).
3. **Hero Media Optimization**: Responsive media rendering — high-resolution imagery (`teenagers.png`) on laptop/desktop viewports and a converted 30fps web-optimized MP4 video on mobile/tablet viewports.
4. **Lead Pastor Spotlight**: Dedicated home screen feature section introducing Pastor Tobi Omojowo with direct links to his YouTube, Instagram, TikTok, Facebook channels, and online search.
5. **Full SEO Architecture**: Automatic `/sitemap.xml`, `/robots.txt`, canonical URLs, Open Graph / Twitter Card social previews, search icons/favicons, and Schema.org structured data for Church, Events, and Sermon VideoObjects.
6. **Admin-Editable SEO Fields**: In-dashboard control over `seo_title` and `seo_description` across pages, sermons, and events.
7. **17 Data-Layer Conversion Events**: Safe event triggers covering every essential congregational action (listening, giving, event registration, visit planning, phone/email contact, newsletter).
8. **Strict Privacy Protection**: Client-side parameter filter blocking any transmission of names, emails, phones, prayer requests, bank accounts, or financial details.
9. **Cookie Consent System**: User-friendly bottom banner on first visit linked to a granular `/cookies` preference page.

---

## 2. Exact Code Locations

| System Component | File Path | Description |
|---|---|---|
| **Tag Manager & DataLayer** | `web/components/analytics.tsx` | GTM script injector, dev/admin exclusions, and event dispatch logic |
| **Cookie Consent Banner** | `web/components/consent-banner.tsx` | First-visit notification banner managing user analytics consent |
| **Cookie Preferences Page** | `web/components/consent.tsx` | Granular consent controls on `/cookies` |
| **YouTube Sermon Embeds** | `web/components/youtube-embed.tsx` | Privacy-enhanced YouTube player with play tracking |
| **Homepage & Hero Media** | `web/app/page.tsx` | Hero responsive layout, Lead Pastor section, featured sermon |
| **Global Styles & Layout** | `web/app/globals.css` | Typography, media queries, channel pill styles, layout grids |
| **Root Layout & Meta Tags** | `web/app/layout.tsx` | Favicons, fonts, GSC verification, Church Schema.org JSON-LD |
| **SEO Metadata Generator** | `web/lib/seo.ts` | Dynamic Open Graph, Twitter cards, canonical tags, JSON-LD encoder |
| **XML Sitemap** | `web/app/sitemap.ts` | Dynamic index of public pages, sermons, events, and galleries |
| **Robots Exclusion** | `web/app/robots.ts` | Crawler directives allowing public content and blocking `/admin` |
| **Admin Content Management** | `web/app/admin/(protected)/edit/[id]/page.tsx` | Dashboard editor with SEO title/description inputs |
| **Form Event Tracking** | `web/components/public-form.tsx` | Safe tracking for contact, prayer, and newsletter submissions |
| **Bank Account Copying** | `web/components/copy-account.tsx` | Safe tracking for `bank_details_copied` |

---

## 3. Environment Variables Required

Add these in your production hosting dashboard (e.g. Vercel / Netlify environment settings):

```ini
# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Google Analytics 4 (Referenced in GTM)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads (Referenced in GTM)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX

# Meta Pixel (Referenced in GTM)
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Google Search Console Verification Token
GOOGLE_SEARCH_CONSOLE_VERIFICATION=google1234567890abcdef.html

# Production Site URL
NEXT_PUBLIC_SITE_URL=https://gloryhillscommunitychurch.org
```

---

## 4. Connecting GTM, GA4, Google Ads, and Meta Pixel

All marketing scripts route through **GTM** (`NEXT_PUBLIC_GTM_ID`):
1. **Google Analytics 4**: Inside GTM, add a **Google Tag** with your `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
2. **Google Ads**: Inside GTM, create **Google Ads Conversion Tracking** tags linked to data-layer events (`give_click`, `plan_visit_click`, `event_registration_click`, `contact_form_submitted`).
3. **Meta Pixel**: Inside GTM, add the Meta Pixel tag with `NEXT_PUBLIC_META_PIXEL_ID` to fire on PageView and map custom/standard events (`Donate`, `Lead`, `CompleteRegistration`).

See [ANALYTICS_AND_ADS_SETUP.md](ANALYTICS_AND_ADS_SETUP.md) for step-by-step setup screenshots and guides.

---

## 5. Available Conversion Events

See [TRACKING_EVENT_DICTIONARY.md](TRACKING_EVENT_DICTIONARY.md) for full details on all 17 supported events:
- `listen_click`
- `sermon_play`
- `give_click`
- `giving_method_selected`
- `bank_details_copied`
- `online_giving_started`
- `online_giving_completed`
- `event_view`
- `event_registration_click`
- `plan_visit_click`
- `directions_click`
- `phone_click`
- `email_click`
- `whatsapp_click`
- `prayer_request_submitted`
- `contact_form_submitted`
- `newsletter_signup`

---

## 6. How to Test Events Before Publishing

1. In GTM, click **Preview** in the upper right corner.
2. Enter the test website URL with `?gtm_debug=true` (e.g., `https://staging.gloryhillscommunitychurch.org?gtm_debug=true`).
3. In the GTM Debug Window / Tag Assistant tab:
   - Click "Accept Analytics" on the cookie banner.
   - Click "Listen" or play a sermon -> verify `sermon_play` appears in the left timeline and tags fire.
   - Click "Copy account number" on the Give page -> verify `bank_details_copied` fires.
   - Fill and submit the prayer request or contact form -> verify `prayer_request_submitted` or `contact_form_submitted` fires.
   - Verify that **no** personal names, emails, phone numbers, or account details exist in any dataLayer payload.

---

## 7. How to Submit the Sitemap

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select the verified **Glory Hills Community Church** property.
3. In the left sidebar, click **Sitemaps**.
4. Under **Add a new sitemap**, type: `sitemap.xml`
5. Click **Submit**.
6. Google will report "Success" and automatically discover all current and newly published sermon and event URLs.

---

## 8. How to Monitor Search Console

- **Indexing -> Pages**: Review indexed vs. not indexed pages. Disallowed `/admin` pages will correctly report as blocked by `robots.txt`.
- **Performance -> Search results**: Monitor search queries bringing visitors to the church website, impressions, and clicks.
- **Enhancements -> Videos / Events**: Check that YouTube sermons and Church events appear with rich result snippets.

---

## 9. How SEO Titles, Descriptions, and Social Images Are Edited

### Method A: Admin Dashboard (No Code Needed)
1. Sign in to `/admin`.
2. Edit an existing sermon, event, or page, or create a new one.
3. Scroll down to the **SEO Title** and **SEO Description** input fields.
4. Enter your custom headline (up to 60–70 characters for title) and summary (up to 155–160 characters for description).
5. Click **Save content**. Changes propagate to search engines automatically.

### Method B: Default Social Share Image
The default social sharing card is stored at `web/public/images/brand/default-social-share.jpg` (1200 × 630 px). To update the global social card across WhatsApp, Facebook, and Twitter, simply replace this image with a new 1200×630 graphic.

---

## 10. Role Division: Developer vs. Media Team

### Tasks Handled by the Media Team (No Code Required):
- Creating, editing, and publishing sermons, podcasts, and event notices in `/admin`.
- Editing SEO titles, meta descriptions, and image alt text in `/admin`.
- Managing tags, triggers, and conversion goals in Google Tag Manager.
- Creating campaign ad sets in Google Ads and Meta Ads Manager.
- Monitoring search performance, keywords, and sitemap crawling in Google Search Console.
- Adding YouTube video links to sermons for instant embedded playback.

### Tasks Requiring a Developer:
- Changing brand font files or global CSS color palettes.
- Adding new custom tracking event triggers not in the 17 standard events.
- Integrating a custom automated payment gateway backend (e.g. direct Paystack/Flutterwave webhook verification).
- Creating new top-level page routes or database migrations.

