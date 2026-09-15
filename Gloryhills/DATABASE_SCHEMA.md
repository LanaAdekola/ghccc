# Database schema

A shared `content` table avoids repeating the same publication envelope across 15 collections. `kind` is database-constrained. It supports homepage, settings, SEO, sermons, events, service times, ministries, announcements, gallery albums/images, leadership, giving methods/campaigns and editorial pages.

Each record includes UUID, kind, unique kind/slug, title, description, body, image path/alt, external URL, start time, draft/published status, publication time, display order, featured flag, SEO title/description, structured data, creator and timestamps. Structured data contains only public editorial values. No secrets/private requests belong here.

`user_roles`: Auth UUID → admin/super_admin. `submissions`: private contact/prayer/visit/newsletter/event-interest messages, consent timestamp and expiry. `rate_limits`: HMAC request buckets, no raw IP. `audit_logs`: actor, table, record, operation, timestamp; deliberately excludes sensitive content bodies.

RLS permits public reads of published content only when published_at ≤ now. Editors can manage content and review/delete private submissions. Super-admin alone manages roles and reads audit logs. Public submission inserts go through a CAPTCHA-validated server endpoint; the service role performs the insert and atomic rate-limit RPC.

Storage is private; image SELECT depends on a currently published content record or administrator role. No public draft URL. The application streams authorized images without shared caching.

Not created: redundant profiles table (Auth owns identity), unused series/speakers/slides tables. Add them through a later migration when actual editorial requirements need them.
