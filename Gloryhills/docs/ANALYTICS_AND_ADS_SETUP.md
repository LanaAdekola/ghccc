# Analytics and ads setup

GTM is the only tracking-script delivery layer. Root layout reads the published Supabase `content` row with `kind=settings, slug=marketing`; normalization requires a valid GTM ID and enabled=true. Missing, unpublished, future or disabled settings fail closed. There is no NEXT_PUBLIC_GTM_ID fallback. The media pastor needs marketing_admin, content_admin or super_admin to save settings at /admin/marketing. media_editor can read Media Tools but cannot save marketing settings.

GA4, Google Ads (ID and conversion label), Meta and AdSense IDs in the form are reference values only. They do not install scripts, verify accounts or publish tags. Media Tools reports saved configuration and explicitly leaves delivery unverified.

1. Obtain access to the church's intended GTM container and vendor properties.
2. Configure the approved tags externally in that container. Require the appropriate Consent Mode v2 signals; all four signals are queued before loader insertion. Never track prayer, admin or auth activity, or send submitted form/banking values.
3. Use GTM's initialization/container-load mechanism for the consented Google tag, not a custom event named ghcc-consent: that is only a DOM notification. Disable automatic page views and history-based Enhanced Measurement; map the application's page_view once.
4. Sanitize page/referrer/query data and exclude preview hostnames. Restrict tags to the canonical production hostname. Configure sensitive-path exclusions inside GTM too: an SPA history change can precede the React teardown effect.
5. Publish the approved container only after review. Save and enable its ID through /admin/marketing after the backend is configured. A public settings cache may take up to 60 seconds; existing tabs need refresh for changed settings.
6. Test before consent, accept, decline, cross-tab revocation, storage clearing and public-to-sensitive-route navigation. Revocation and sensitive navigation trigger a full reload after an installed loader: removing a DOM script cannot undo executed vendor JavaScript. Prior network requests cannot be recalled.
7. Inspect Tag Assistant and GA4 DebugView for exactly one loader/page view and only the allowed event parameters. GTM only loads in production unless local debug is explicitly enabled. Debug never overrides consent or sensitive-route exclusions.
8. Configure Ads conversions for approved outcomes. Clicks and interest are secondary engagement, not completed registrations or donations. event_interest_submitted has no UI entry point and google_ads_conversion has no caller. newsletter_signup records a request, not external mailing-list enrollment.
9. Verify actual GA4/Ads/Meta receipt and consent behavior with the account owner. No service is considered connected solely because an ID is saved.

See TRACKING_EVENT_DICTIONARY.md for 19 allowlisted names and their prerequisites. No verified payment completion, player completion or Meta Conversions API integration exists. No noscript GTM iframe is used, so JavaScript-disabled users do not bypass consent. Consent is a single combined optional-services choice, not per-vendor consent.
