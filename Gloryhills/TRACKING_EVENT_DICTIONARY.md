# Tracking Event Dictionary

This document is the authoritative tracking event registry and dictionary for Glory Hills Community Church.

---

## 1. Core Architecture & Governance

* **Single Delivery Layer**: Google Tag Manager (GTM) is the sole script-loading layer on the website.
* **GTM Configuration**: The GTM container ID and enable switch are configured inside the CMS at `/admin/marketing` and stored in published Supabase settings. GTM does not load from environment variables.
* **Consent Gating**: All dataLayer events and tracking tags fire **only after explicit user consent** is granted (`localStorage['ghcc-consent'] === 'granted'`).
* **Zero PII Policy**: Event payloads are strictly sanitized. Personal identifying information (names, emails, phone numbers, prayer requests, bank details, passwords, tokens) is stripped client-side before any dataLayer dispatch.
* **Confidentiality Rule**: **Prayer requests are confidential pastoral communications and must NEVER be tracked.** The `/prayer-request` route disables the analytics engine, and submission of prayer requests emits no analytics events.

---

## 2. Authoritative Event Registry

The table below catalogs all 18 active client engagement and intent events, plus 1 uncalled helper.

| Event Name | Trigger | Allowed Parameters | Implemented | Reachable in UI | GA4 Event | Google Ads Conversion | Privacy Constraints |
|---|---|---|:---:|:---:|:---:|:---:|---|
| `page_view` | Client-side route change | `page_path` | Yes | Yes | Yes | No | Sanitized path only. Query strings stripped. Excluded on `/admin`, `/auth`, `/prayer-request`. |
| `event_view` | Visiting `/events/[slug]` | `route` | Yes | Yes | Yes | No | Sanitized route slug only. Never transmits attendee information. |
| `listen_click` | Clicking links to `/sermons`, Spotify, or YouTube playlists | None | Yes | Yes | Yes | No | Outbound or internal navigation click. No personal identifiers. |
| `sermon_play_requested` | Clicking play on sermon YouTube embed facade (`YouTubeEmbed`) | None | Yes | Yes | Yes | No | Records user request to initiate video playback in privacy-enhanced iframe. Not a guaranteed completion. |
| `give_click` | Clicking navigation or callout links to `/give` | None | Yes | Yes | Yes | Secondary | Navigation intent only. Evaluated after `online_giving_started` to prevent precedence blocking. |
| `online_giving_started` | Clicking online giving action button (`data-action="online-giving-start"`) or payment gateway link | None | Yes | Yes | Yes | Yes (Intent) | Checkout initiation intent only. Never contains bank details, card numbers, or amounts. |
| `giving_method_selected` | Clicking a giving method card (`.giving-method-card`) | None | Yes | Yes | Yes | No | Card selection interaction only. Never transmits bank credentials or account numbers. |
| `bank_details_copied` | Clicking "Copy account number" on a giving card | None | Yes | Yes | Yes | No | Dispatched only after successful clipboard API write. Never includes the account number or bank name. |
| `plan_visit_click` | Clicking links to `/plan-your-visit` | None | Yes | Yes | Yes | Yes (Lead) | Navigation intent only. No personal visitor details. |
| `phone_click` | Clicking `tel:` phone links | None | Yes | Yes | Yes | Yes (Lead) | Telephone link interaction. Does not record the dialed phone number. |
| `email_click` | Clicking `mailto:` email links | None | Yes | Yes | Yes | Yes (Lead) | Email link interaction. Does not record the recipient address. |
| `whatsapp_click` | Clicking WhatsApp links (`wa.me` / `whatsapp.com`) | None | Yes | Yes | Yes | Yes (Lead) | Messaging link interaction. Does not record phone number or message text. |
| `directions_click` | Clicking map directions links or Google Maps URLs | None | Yes | Yes | Yes | Yes (Lead) | Navigation interaction. Does not transmit user GPS or location coordinates. |
| `event_registration_click` | Clicking event register button (`data-action="event-register"`) | None | Yes | Yes | Yes | Yes | Registration intent click. No attendee data. |
| `contact_form_submitted` | Successful server response from general contact form | None | Yes | Yes | Yes | Yes (Lead) | Confirmed inquiry. Form inputs (name, email, message) are strictly excluded. |
| `newsletter_signup` | Successful server response from newsletter subscription | None | Yes | Yes | Yes | Yes (Lead) | Confirmed subscription. Subscriber email is strictly excluded. |
| `event_interest_submitted` | Successful server response from event interest inquiry | None | Yes | Yes | Yes | Yes | Confirmed event interest. Registrant name and email are strictly excluded. |
| `visit_request_submitted` | Successful server response from plan-your-visit form | None | Yes | Yes | Yes | Yes (Lead) | Confirmed visit inquiry. Visitor name and contact details are strictly excluded. |
| `google_ads_conversion` | Manual `trackGoogleAdsConversion()` helper call | None | Yes | No | No | Yes | Uncalled helper reserved for verified external conversion callbacks. Does not fire in UI flows. |

---

## 3. Reserved / Unimplemented Events (Do NOT Configure in GTM)

The following events are **not implemented** in the current application and must not be configured as active triggers:

* `sermon_play`: Replaced by `sermon_play_requested`. Without YouTube IFrame Player API postMessage instrumentation, full video playback cannot be verified.
* `sermon_complete`: Reserved for future dedicated media player completion instrumentation.
* `online_giving_completed`: Reserved. The website redirects or links to external donation methods (e.g. bank transfer or external payment processor) without an integrated server-side payment completion webhook. **Never infer payment completion from a button click or landing page visit.**
* `prayer_request_submitted`: **Permanently excluded**. Pastoral prayer requests are strictly private and never tracked.
