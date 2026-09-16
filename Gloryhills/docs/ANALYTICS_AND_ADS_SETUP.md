# Analytics & Ads Setup Guide

This guide describes how Google Tag Manager (GTM), Google Analytics 4 (GA4), Google Ads, and Meta Pixel are architected, connected, and maintained for Glory Hills Community Church.

---

## 1. Single Tag Management Architecture

> [!IMPORTANT]
> **Single Source of Truth**:
> Google Tag Manager is the sole tag-management and script-loading layer. Google Analytics 4, Google Ads, and Meta Pixel scripts are **never** injected directly into the application source code.
> 
> This eliminates duplicate scripts, prevents tracking conflicts, enforces consent rules across all vendors simultaneously, and allows the media team to manage marketing tags directly in GTM without developer redeployments.

---

## 2. Environment Variables Required

Configure the following variables in the deployment environment (e.g., Vercel / Netlify project settings):

```bash
# Google Tag Manager Container ID (Required for analytics)
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Google Analytics 4 Measurement ID (Configured inside GTM container)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Ads Customer / Conversion ID (Configured inside GTM container)
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX

# Meta (Facebook) Pixel ID (Configured inside GTM container)
NEXT_PUBLIC_META_PIXEL_ID=123456789012345

# Google Search Console Verification Token
GOOGLE_SEARCH_CONSOLE_VERIFICATION=your_gsc_token_here

# Public Production URL (Canonical root without trailing slash)
NEXT_PUBLIC_SITE_URL=https://gloryhillscommunitychurch.org
```

> [!NOTE]
> Do not commit `.env` or `.env.local` files containing secrets or credentials to source control.

---

## 3. Google Tag Manager Setup

### Step A: Create GTM Web Container
1. Log in to [Google Tag Manager](https://tagmanager.google.com/).
2. Create an Account for **Glory Hills Community Church** and a Container with Target Platform: **Web**.
3. Copy your Container ID (`GTM-XXXXXXX`) and save it as `NEXT_PUBLIC_GTM_ID` in your hosting environment.

### Step B: Configure Consent Mode
1. In GTM, go to **Admin** -> **Container Settings** -> check **Enable consent overview**.
2. Optional marketing and analytics tags should depend on `analytics_storage: 'granted'` and `ad_storage: 'granted'`.
3. The website's consent banner and `/cookies` page automatically update `localStorage['ghcc-consent']` and trigger tag initialization only after explicit consent.

---

## 4. Connecting Google Analytics 4 (GA4)

1. In GTM, navigate to **Tags** -> **New**.
2. Select **Google Tag** (or **Google Analytics: GA4 Configuration**).
3. In **Tag ID**, enter `{{NEXT_PUBLIC_GA_MEASUREMENT_ID}}` (or your static `G-XXXXXXXXXX` ID).
4. Under **Triggering**, select **Custom Event: ghcc-consent** or **Consent Initialization - All Pages**.
5. Create GA4 Event Tags for key actions corresponding to the events documented in [TRACKING_EVENT_DICTIONARY.md](TRACKING_EVENT_DICTIONARY.md):
   - `sermon_play`
   - `give_click`
   - `online_giving_completed`
   - `event_registration_click`
   - `plan_visit_click`
   - `bank_details_copied`
   - `contact_form_submitted`
   - `prayer_request_submitted`
   - `newsletter_signup`

---

## 5. Connecting Google Ads Conversions

1. In Google Ads, navigate to **Goals** -> **Conversions** -> **Summary**.
2. Create Conversion Actions:
   - **Give Intent**: Primary conversion on `online_giving_completed` or secondary on `give_click`.
   - **Event Registration**: Conversion on `event_registration_click`.
   - **Plan a Visit**: Lead conversion on `plan_visit_click`.
   - **Contact / Prayer**: Conversion on `contact_form_submitted` or `prayer_request_submitted`.
3. In GTM, add a **Conversion Linker** tag set to fire on **All Pages**.
4. Add **Google Ads Conversion Tracking** tags using your Conversion ID (`AW-XXXXXXXXX`) and Conversion Label for each event.

---

## 6. Connecting Meta (Facebook) Pixel

1. In Meta Events Manager, copy your Pixel ID (`NEXT_PUBLIC_META_PIXEL_ID`).
2. In GTM, install the **Facebook Pixel** community template (by Facebook Incubator) or use a Custom HTML tag with consent checks.
3. Configure standard Meta events:
   - Base Code: `fbq('init', '{{NEXT_PUBLIC_META_PIXEL_ID}}'); fbq('track', 'PageView');`
   - Giving started: `fbq('track', 'InitiateCheckout');`
   - Giving completed: `fbq('track', 'Donate');`
   - Event Registration: `fbq('track', 'CompleteRegistration');`
   - Plan Visit / Contact: `fbq('track', 'Lead');`

---

## 7. Tracking Exclusion Rules

Tracking is blocked in the following contexts:
1. **Admin Dashboard**: Any route beginning with `/admin` automatically unloads and disables GTM scripts to keep administrative sessions completely isolated from analytics.
2. **Local Development**: Hostnames `localhost`, `127.0.0.1`, and `::1` are blocked from firing tags unless testing mode (`?gtm_debug=true`) is explicitly requested.
3. **Without Consent**: Until the visitor clicks "Accept Analytics" on the banner or enables analytics in `/cookies`, zero tracking scripts are injected.

