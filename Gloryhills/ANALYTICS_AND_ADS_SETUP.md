# Analytics and ads setup

GTM is the single delivery layer. In /admin/marketing, enter the approved GTM container ID and enable it. Other vendor IDs are reference fields only; they do not install direct scripts. Configure GA4, Google Ads, Meta and any approved AdSense tags in GTM. Do not add a second container or duplicate direct scripts.

The app queues Consent Mode v2 defaults and updates. Tags load only with optional-services consent. Admin/auth and prayer-request routes are excluded. Localhost requires explicit debug opt-in. Production previews must be excluded with GTM hostname rules; confirm preview environment settings separately.

GA4: configure a Google tag with automatic page-view sending OFF and Enhanced Measurement history-based page changes OFF. Map the application's page_view event once using page_path and canonical origin. Never forward query strings, form text, names, email, phone, banking fields or prayer activity. If GTM uses built-in Page URL/referrer variables, sanitize query strings before sending them. Verify the configuration in Tag Assistant and GA4 DebugView.

Google Ads: identify conversion actions with the owner. Configure required conversion IDs/labels and Conversion Linker in GTM. Map only confirmed outcomes where appropriate. Give clicks and checkout starts are engagement, not completed donations. No verified donation completion or event-registration-completion integration exists. Do not configure prayer activity as an advertising conversion.

Meta: deliver approved tags through GTM with consent checks. Map safe engagement events only. Pixel/Ad Account ownership and data receipt require account verification. Conversions API is not implemented.

The website does not create campaigns, set budgets or manage billing. Use official advertising dashboards with individual permissions. No campaign has been created or launched by this audit.
