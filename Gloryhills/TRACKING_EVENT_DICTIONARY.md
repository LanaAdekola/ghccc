# Tracking event dictionary

Generated from web/lib/events.mjs by web/scripts/sync-guides.mjs. There are 19 allowlisted event names, not 19 verified working user journeys. Reachability means code/UI availability, not configured production delivery. Some links require published content; forms require Supabase and Turnstile. online_giving_started requires an actual approved external checkout link; the internal /give placeholder does not emit it.

GTM is the sole tracking delivery layer. Published Supabase content(kind=settings, slug=marketing) supplies the active ID and enabled state. No environment fallback exists. Other vendor IDs are reference values only. All interaction events require consent. Consent Mode commands can be queued before consent; they are not interaction events. gtm.js is the loader lifecycle event. ghcc-consent is a DOM event, NOT a GTM data-layer custom event.

| Event | Trigger | Parameters | Implemented | UI path exists | Privacy |
|---|---|---|---|---|---|
| page_view | Client-side route change in Analytics component | page_path | Yes | Yes, prerequisites apply | Sanitized route path only. Query strings, search params, and PII are stripped. Excluded on /admin, /auth, /prayer-request. |
| event_view | Visiting an event details page (/events/[slug]) | route | Yes | Yes, prerequisites apply | Event route slug only. Never transmits attendee information. |
| listen_click | Clicking public links to /sermons, Spotify, or external YouTube playlists | None | Yes | Yes, prerequisites apply | Link engagement trigger. No user identifiers. |
| sermon_play_requested | Clicking the play facade button on an embedded YouTube sermon (YouTubeEmbed) | None | Yes | Yes, prerequisites apply | Records the user request to initiate video playback in privacy-enhanced iframe. Not a guaranteed video completion. |
| give_click | Clicking public navigation or action links to /give | None | Yes | Yes, prerequisites apply | Navigation engagement only. Evaluated after online_giving_started to prevent precedence blocking. |
| online_giving_started | Clicking an online giving action button (data-action="online-giving-start") or external payment gateway link | None | Yes | Yes, prerequisites apply | Checkout initiation intent only. Never contains bank details, card numbers, currency amounts, or donor identity. |
| giving_method_selected | Clicking a church-approved giving method card (.giving-method-card) | None | Yes | Yes, prerequisites apply | Card selection interaction only. Never transmits bank credentials or account numbers. |
| bank_details_copied | Clicking "Copy account number" on a giving method card (CopyAccount component) | None | Yes | Yes, prerequisites apply | Dispatched only after successful clipboard API write. Never includes the account number, bank name, or account holder name in the payload. |
| plan_visit_click | Clicking links pointing to /plan-your-visit | None | Yes | Yes, prerequisites apply | Navigation intent only. No personal visitor details. |
| phone_click | Clicking tel: telephone links | None | Yes | Yes, prerequisites apply | Telephone contact link interaction. Does not record the dialed number. |
| email_click | Clicking mailto: email links | None | Yes | Yes, prerequisites apply | Email contact link interaction. Does not record the email address. |
| whatsapp_click | Clicking WhatsApp community or inquiry links (wa.me / whatsapp.com) | None | Yes | Yes, prerequisites apply | Outbound messaging link interaction. Does not record phone number or message text. |
| directions_click | Clicking map directions links or Google Maps URLs | None | Yes | Yes, prerequisites apply | Location navigation interaction. Does not transmit user GPS or origin coordinates. |
| event_registration_click | Clicking event registration links (data-action="event-register") | None | Yes | Yes, prerequisites apply | Registration interest click only. No registration form data. |
| contact_form_submitted | Successful server response from contact form submission (PublicForm kind="contact") | None | Yes | Yes, prerequisites apply | Confirmed inquiry submission. Form inputs (name, email, message) are strictly excluded from analytics dataLayer. |
| newsletter_signup | Successful server response from newsletter subscription (PublicForm kind="newsletter") | None | Yes | Yes, prerequisites apply | Confirmed subscription. Subscriber email is strictly excluded from analytics dataLayer. |
| event_interest_submitted | Successful server response from event registration inquiry (PublicForm kind="event-interest") | None | Yes | No | Confirmed event inquiry. Registrant name and email are strictly excluded. |
| visit_request_submitted | Successful server response from plan-your-visit form (PublicForm kind="plan-your-visit") | None | Yes | Yes, prerequisites apply | Confirmed visit planning submission. Visitor name and contact details are strictly excluded. |
| google_ads_conversion | Manual helper trackGoogleAdsConversion() invocation | None | Yes | No | Uncalled helper reserved for verified external conversion callbacks. Does not fire in standard UI flows. |

Never configure sermon_play, sermon_complete or online_giving_completed as implemented outcomes. Prayer-request activity is excluded permanently. newsletter_signup means a request was stored for church review, not enrollment in an external email platform. Event registration clicks are interest only, never completed registration. google_ads_conversion is an uncalled helper, not a verified donation callback.

The historical 17-event list included unsupported names. A nine-item mapping list was a subset, not an implementation count. Current authoritative count: 19 names; event_interest_submitted has no mounted UI and google_ads_conversion has no caller.

Per-event parameter contracts are enforced; query strings, sensitive routes and unapproved properties are discarded. External GTM tags must independently avoid PII, full URLs/query strings, sensitive referrers, preview hosts and duplicate page views. No external receipt has been verified.
