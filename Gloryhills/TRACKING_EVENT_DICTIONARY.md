# Tracking event dictionary

| Event | Current implementation / prerequisite |
|---|---|
| listen_click | Public links to sermons, YouTube or Spotify |
| give_click | Public Give links |
| bank_details_copied | Successful clipboard write only; no account properties |
| plan_visit_click | Plan-your-visit link |
| phone_click | tel link |
| email_click | mailto link |
| prayer_request_submitted | Confirmed successful server response |
| contact_form_submitted | Confirmed successful server response |
| sermon_play | Reserved; requires consented media player instrumentation |
| sermon_complete | Reserved; only measurable player completion, not outbound links |
| giving_method_selected | Reserved until selection interaction is implemented |
| online_giving_started | Reserved until approved checkout integration |
| online_giving_completed | Reserved until verified server-side payment completion |
| event_view | Reserved for event route view tracking |
| event_registration_click | Reserved for approved event registration links |
| directions_click | Reserved for confirmed map interaction |
| whatsapp_click | Reserved until confirmed WhatsApp URL |
| newsletter_signup | Reserved until newsletter consent/provider workflow |

Reserved events must not be represented as configured. Never infer sermon play/completion from clicking an external link. GTM owns GA4/Ads/Meta routing, conversion configuration, vendor consent and hostname exclusions. Payment conversion must not fire from an unverified browser success URL.
