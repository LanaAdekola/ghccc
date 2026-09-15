# Migration plan

1. Audit source, data provenance, assets and old runtime; preserve user changes.
2. Create isolated web/ Next.js App Router + TypeScript application and reusable burgundy/ivory design tokens; migrate real content.
3. Implement published content model, admin and super-admin roles, private storage, versioned migrations and RLS tests.
4. Build public routes, detail pages, giving states, accessible forms and consent-based GTM integration.
5. Build protected administration, preview/publish workflows and image upload.
6. Verify production build, type checking, lint, navigation, metadata, forms, mobile layouts, accessibility and Lighthouse. Execute RLS and administrator tests against configured Supabase.
7. Confirm launch content, provider settings and domain; deploy only with explicit approval. Remove legacy dependencies only after parity and security gates pass.

## Proposed sitemap
Home; About; Beliefs; Leadership; Sermons + detail; Events + detail; Ministries; Gallery + album; Give; Visit; Contact; Prayer request; Plan your visit; Privacy; Cookies; Terms; 404. Beliefs, ministries, legal copy and gallery records must have approved content before publication. Do not fabricate pages to fill this list.

Admin: dashboard, homepage, sermons, events, service times, gallery, announcements, ministries, giving, leadership, site/SEO settings, private submissions and super-admin-only administrator roles.

## Proposed schema
profiles, user_roles; site_settings and homepage_content; sermons, events, service_times, ministries, announcements, gallery_albums/gallery_images, leadership_profiles, giving_methods/giving_campaigns, private form submissions, seo_settings and audit_logs. Add separate speakers/series/slides only when used. Every public record has publication controls; public clients cannot read drafts or private submissions.

## Visual direction
Authentic worship photography, warm ivory sections, burgundy actions and strong charcoal typography. Recommend locally bundled Barlow Condensed for display and Manrope for body. Refine after examining the real sanctuary and logo. Avoid stock church imagery and fictional testimonials.

## Cutover gates
Do not call the migration complete until production build, tests, responsive review and real Supabase policies pass. No payment integration until bank/provider details are confirmed. No production DNS or public deployment without explicit approval.
