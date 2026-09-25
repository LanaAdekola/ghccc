# Analytics & Ads Setup Guide

This guide describes how Google Tag Manager (GTM), Google Analytics 4 (GA4), Google Ads, and Meta Pixel are architected, connected, and maintained for Glory Hills Community Church.

---

## 1. Single Tag Management Architecture

> [!IMPORTANT]
> **Single Source of Truth**:
> Google Tag Manager is the sole tag-management and script-loading layer on the website. Google Analytics 4, Google Ads, and Meta Pixel scripts are **never** injected directly into the application source code.
> 
> * The active GTM container ID and enable/disable state are managed directly in the CMS at `/admin/marketing` and stored in the published Supabase `settings` content record.
> * The website runtime does **not** load GTM from environment variables (`NEXT_PUBLIC_GTM_ID` is deprecated and not used by the runtime).
> * GA4, Google Ads, Meta Pixel, and AdSense IDs stored in `/admin/marketing` are reference values for configuring tags inside the GTM container. Entering those IDs does not directly load vendor scripts.
> * No noscript iframe is injected or supported (Next.js renders asynchronously in client components).

---

## 2. Google Tag Manager Container Setup

1. Create a Web Container in [Google Tag Manager](https://tagmanager.google.com/) for Glory Hills Community Church.
2. In the church CMS (`/admin/marketing`), enter your GTM Container ID (`GTM-XXXXXXX`) and toggle **Enable Google Tag Manager**.
3. Save changes. GTM will load on public pages once user consent is granted.

---

## 3. Google Consent Mode v2 & Privacy Constraints

* **Consent Required**: All marketing and analytics tags require visitor consent. Tags load only after the visitor accepts optional services via the cookie banner.
* **Excluded Routes**: Admin dashboard (`/admin`), authentication routes (`/auth`), and prayer requests (`/prayer-request`) are strictly excluded from tracking.
* **Confidentiality Rule**: **Prayer requests are confidential pastoral communications and must NEVER be tracked.**
* **Localhost / Development**: Tracking is suppressed on localhost and non-production environments unless debug mode is explicitly toggled (`?gtm_debug=1` or `localStorage['ghcc-analytics-debug'] = 'true'`).

---

## 4. Connecting Google Analytics 4 (GA4) Inside GTM

1. In GTM, create a new **Google Tag** (GA4 Configuration).
2. Enter your GA4 Measurement ID (`G-XXXXXXXXXX`).
3. Set Trigger to **Custom Event: ghcc-consent** or **Consent Initialization - All Pages** (requiring `analytics_storage: 'granted'`).
4. Turn **OFF** automatic page views and Enhanced Measurement browser history changes in GA4 stream settings.
5. Create a GA4 Event tag for `page_view` triggered on the dataLayer event `page_view`.
6. Refer to [TRACKING_EVENT_DICTIONARY.md](TRACKING_EVENT_DICTIONARY.md) for the complete list of 18 client-side engagement and intent events.

---

## 5. Connecting Google Ads Conversions Inside GTM

1. In Google Ads, establish approved conversion actions with the church leadership.
2. In GTM, add a **Conversion Linker** tag set to fire on **All Pages**.
3. Create Google Ads Conversion Tracking tags using your Conversion ID (`AW-XXXXXXXXX`) and Conversion Labels for key intent events:
   * **Online Giving Intent**: Map to `online_giving_started` (checkout intent). **Do NOT map button clicks to completed donations.**
   * **Event Registration**: Map to `event_registration_click` or `event_interest_submitted`.
   * **Plan a Visit**: Map to `visit_request_submitted` (lead conversion) or `plan_visit_click`.
   * **Contact**: Map to `contact_form_submitted`.
4. Never configure prayer requests as an advertising conversion.

---

## 6. Connecting Meta (Facebook) Pixel Inside GTM

1. In GTM, add the Facebook Pixel tag (via community template or Custom HTML with consent checks).
2. Set base code to fire on consented page views: `fbq('init', '{{Pixel_ID}}'); fbq('track', 'PageView');`.
3. Map standard Meta events to consented dataLayer events:
   * `online_giving_started` → `fbq('track', 'InitiateCheckout');`
   * `event_registration_click` → `fbq('track', 'CompleteRegistration');`
   * `contact_form_submitted` → `fbq('track', 'Lead');`

---

## 7. Church Locations & Official Channels

* **Headquarters**: 3rd Floor of Tejumola House, Plot 24 Ogunnusi Road (beside CLAM) in Ojodu Berger, Lagos.
* **Isheri-Magodo**: 6 Ogun River Road, Isheri-Magodo, Lagos.
* **Official Website**: `https://www.ghccglobal.com`
* **Spotify Show**: `https://open.spotify.com/show/4OYlLXQq8Heh6fAkixCdVA`
