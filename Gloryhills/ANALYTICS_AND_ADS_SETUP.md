# Analytics and ads setup

GTM is the only script loader. GA4, Google Ads and Meta Pixel IDs are documented for the media team; the app does not insert their direct scripts. Set NEXT_PUBLIC_GTM_ID in the deployment environment, rebuild, and configure vendor tags inside GTM.

Optional tags load only in production, outside `/admin`, after explicit analytics consent through `/cookies`. No consent means no GTM request. Rejecting optional analytics reloads the page to stop loaded tags. Implement vendor-specific consent behavior and cookie cleanup in GTM before activation; do not publish tags that ignore consent.

No IDs have been supplied; no production analytics has been activated or validated. Local production-like testing must use a test container, not the production container. The media team must exclude preview/local hostnames and /admin in GTM triggers as defense in depth.

Validate with GTM Preview, GA4 DebugView, consent granted/denied, route changes, admin pages and tag deduplication. Do not send names, email, phone, account numbers, payment details or prayer/contact text. Code emits event names only, without content or personal properties.
