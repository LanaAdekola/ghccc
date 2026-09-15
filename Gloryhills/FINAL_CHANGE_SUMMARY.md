# Migration status

A separate Next.js App Router/TypeScript application exists in web/. The legacy source remains at the root. No public deployment or DNS changes have been made. The migration is **not yet complete**: browser review and live Supabase workflows are launch gates.

Implemented locally: redesigned homepage, about/leadership, sermon archive and dynamic details, events, giving with configurable bank fields, two-location visit information, contact/prayer/visit forms, protected content dashboard, editable records and image uploads, role schema/RLS, icons/social image, metadata/sitemap/redirects, consent-gated GTM foundation and operational documentation.

Confirmed additions: Ojodu Berger headquarters; headquarters-only Sunday 8am–1pm and Wednesday 6pm–8:30pm schedule; separate Isheri Magodo location; supplied Spotify podcast.

Deferred until approved content/configuration: current Isheri schedule, contact details, beliefs/legal pages, populated ministries/gallery, validated giving accounts/payment processor, email provider/notifications, live analytics and deployment. Empty editorial destinations remain unpublished.

Current editorial limitations: structured fields use a JSON editor; administrator account creation is performed in Supabase while role management is in the app; preview shows content rather than full public layout; automatic retention cleanup, notification sending and measured player events are not yet implemented. Do not represent those as finished workflows.

Legacy runtime attempts regenerate Gatsby's admin bundles and cache artifacts. Newly generated untracked artifacts were cleaned up and previously clean tracked bundles restored. Bundles already modified before the task were not reverted; inspect those generated diffs separately from authored work. Existing root package manifests were not replaced.
