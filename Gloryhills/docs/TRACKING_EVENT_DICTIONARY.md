# Tracking Event Dictionary

This document details all 17 analytics data-layer events implemented in the Glory Hills Community Church web application.

---

## Strict Privacy Safeguards

> [!IMPORTANT]
> **Zero Personally Identifiable Information (PII) & Sensitive Data**:
> Under no circumstances does the website transmit names, email addresses, phone numbers, prayer request messages, contact comments, bank account numbers, SWIFT codes, card details, or payment credentials to Google Tag Manager, Google Analytics, Google Ads, Meta Pixel, or any third-party marketing platform.
> 
> The client-side tracking layer (`web/components/analytics.tsx`) features an automated key filter that blocks fields such as `name`, `email`, `phone`, `prayer`, `message`, `account`, `bank`, and `card`.

---

## Event Catalog

| Event Name | Trigger Location / User Action | Safe Payload Parameters | Mapped Platform Tags |
|---|---|---|---|
| **`listen_click`** | Clicking any sermon listening link, Spotify podcast button, or YouTube sermon link | `{ route }` | GA4: `listen_click`<br/>Meta: Custom `ListenClick` |
| **`sermon_play`** | Clicking play or initiating playback on an embedded YouTube sermon player | `{ route }` | GA4: `sermon_play`<br/>Meta: Custom `SermonPlay` |
| **`give_click`** | Clicking any primary or secondary "Give" button/link in header, hero, or pages | `{ route }` | GA4: `give_click`<br/>Google Ads: Lead/Give Intent<br/>Meta: `InitiateCheckout` |
| **`giving_method_selected`** | Selecting or interacting with a giving method card (Naira, Domiciliary, Online Transfer) | None | GA4: `giving_method_selected`<br/>Meta: Custom `GivingMethodSelected` |
| **`bank_details_copied`** | Clicking the "Copy account number" button on a giving card | None (No account number sent) | GA4: `bank_details_copied`<br/>Google Ads: Conversion candidate<br/>Meta: Custom `BankDetailsCopied` |
| **`online_giving_started`** | Clicking the online giving button or electronic transfer gateway link | None | GA4: `online_giving_started`<br/>Google Ads: Conversion<br/>Meta: `AddPaymentInfo` |
| **`online_giving_completed`** | Confirmation of electronic payment completion | None (No financial data sent) | GA4: `online_giving_completed`<br/>Google Ads: Primary Purchase/Donate<br/>Meta: `Donate` / `Purchase` |
| **`event_view`** | Viewing an individual event detail page (`/events/[slug]`) | `{ route }` | GA4: `view_item`<br/>Meta: `ViewContent` |
| **`event_registration_click`** | Clicking "Register interest" or an event registration action button | None | GA4: `event_registration_click`<br/>Google Ads: Sign-up Conversion<br/>Meta: `CompleteRegistration` |
| **`plan_visit_click`** | Clicking "Plan your visit" or "Let us know you are coming" call-to-action buttons | None | GA4: `plan_visit_click`<br/>Google Ads: Lead Conversion<br/>Meta: `Schedule` |
| **`directions_click`** | Clicking "Get directions" or Google Maps links to church locations | None | GA4: `directions_click`<br/>Meta: `FindLocation` |
| **`phone_click`** | Clicking a phone link (`tel:+234...`) | None (No phone numbers sent) | GA4: `phone_click`<br/>Google Ads: Phone Lead<br/>Meta: `Contact` |
| **`email_click`** | Clicking an email link (`mailto:...`) | None (No email addresses sent) | GA4: `email_click`<br/>Google Ads: Email Lead<br/>Meta: `Contact` |
| **`whatsapp_click`** | Clicking a WhatsApp contact link (`wa.me/...` or WhatsApp action) | None | GA4: `whatsapp_click`<br/>Google Ads: Chat Lead<br/>Meta: `Contact` |
| **`prayer_request_submitted`** | Successfully submitting a prayer request through `/prayer-request` | None (Zero prayer text or sender info sent) | GA4: `prayer_request_submitted`<br/>Meta: `Lead` |
| **`contact_form_submitted`** | Successfully submitting a message through `/contact` or general inquiry form | None (Zero form text or sender info sent) | GA4: `contact_form_submitted`<br/>Google Ads: Contact Conversion<br/>Meta: `Lead` |
| **`newsletter_signup`** | Successfully subscribing to church email updates and announcements | None (Zero email addresses sent) | GA4: `newsletter_signup`<br/>Google Ads: Sign-up Conversion<br/>Meta: `CompleteRegistration` |

---

## DataLayer Push Specifications

### Sample Push from Codebase

```javascript
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'sermon_play'
});
```

### Verification in Browser Console

To verify an event firing during media team testing:
1. Open the website with `?gtm_debug=true` or run `localStorage.setItem('ghcc-consent', 'granted'); localStorage.setItem('ghcc-analytics-debug', 'true'); location.reload();`.
2. Open Developer Tools (F12) -> **Console**.
3. Type `window.dataLayer` and press Enter.
4. Expand the array to inspect the pushed event objects.

