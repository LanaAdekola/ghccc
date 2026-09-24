# Marketing & Analytics handoff

## What changed

The existing admin portal now includes `/admin/marketing`. It edits the existing
`content` table's `kind=settings, slug=marketing` record. There is no second
settings system and no new environment variable is required.

Fields: enable switch and validated ID for GA4, AdSense, GTM, Meta Pixel and
Google Ads, plus an optional Ads conversion label. No arbitrary HTML or scripts
can be entered. Only these public identifiers are sent to the browser.

The supplied GA4 ID `G-DDLP68EB2M` and AdSense publisher
`ca-pub-5953963705871784` are seeded **disabled**. Enable them in the dashboard
after setup. AdSense account approval, Auto ads/placements and any required
Google consent platform configuration remain external tasks; loading the script
alone does not guarantee advertisements.

## Database installation

On an existing project, run only the two new migrations, in order, in separate
SQL Editor executions (the enum addition must commit before the next migration):

1. `supabase/migrations/202609200001_marketing_role.sql`
2. `supabase/migrations/202609200002_marketing_settings.sql`

Do not rerun the initial schema or reset the database. Existing configuration is
preserved if the marketing record already exists. No live migrations have been
applied by this implementation.

## Media-team accounts

1. Create/invite each person using Supabase Authentication, or use an existing
   Auth account. Credentials must be delivered securely, not committed to Git.
2. As a super-admin, use the existing dashboard's administrator-access form to
   assign **Marketing administrator** to their Auth user UUID. Alternatively,
   run in the Supabase SQL Editor:

```sql
insert into public.user_roles(user_id,role)
values ('REPLACE-WITH-AUTH-USER-UUID','marketing_admin')
on conflict(user_id) do update set role=excluded.role;
```

3. They log in at `/admin/login` with their own email/password. The dashboard
   routes them to `/admin/marketing`.

`marketing_admin` can read/write marketing configuration only. It cannot manage
users, private submissions, storage, drafts, financial settings or other system
settings. It does not inherit the existing editor hierarchy. Content admins and
super-admins may also manage marketing; media editors may not. Existing role
permissions are retained. Server actions and RLS both enforce access.

## Tracking behavior

- Visitors must grant the existing optional-services consent before scripts load.
  The consent wording now covers analytics and advertising.
- Public routes only; entering admin reloads to unload active trackers.
- Local/development tracking remains off except the existing explicit debug mode.
- Disabled, invalid or missing IDs load no corresponding script.
- Direct GA4 and Google Ads share one Google tag script. Meta and AdSense have
  one loader each. Scripts are deduplicated across client-side navigation.
- If GTM is enabled it owns GA4, Google Ads and Meta. Their direct loaders are
  suppressed; configure those tags inside GTM exactly once. AdSense remains an
  independent loader. Do not also install AdSense in GTM.
- Disabling integrations applies on the next public page load. Already open
  tabs should refresh. Revoking consent unloads tags through a page reload.
- Existing named tracking events are retained. Direct GA receives sanitized
  events; GTM continues receiving dataLayer events. The exported
  `trackGoogleAdsConversion()` helper sends an actual conversion only when
  explicitly invoked; no payment completion is invented from a click.
- No GA/GTM/Meta/Ads environment variable fallback overrides dashboard switches.
  Move any former environment-based GTM ID into the dashboard.

The existing post-hydration, consent-aware loader is retained to avoid replacing
its lifecycle or adding a second analytics package. It uses Google's standard
argument queue and trusted vendor script URLs. Metadata, canonical URLs,
robots, sitemap and Open Graph infrastructure remain intact.

## Search Console (site owner)

Add the supplied TXT value in the domain's DNS console:

```text
google-site-verification=vrVND8lVJVsPUaYI5FrH5Z2W-ItuHLOWGbTBZwXQbjI
```

Then click Verify in Search Console. DNS, Search Console verification and Google
account configuration have not been performed or verified here. Do not put the
whole DNS TXT value into the HTML verification metadata field.

## Commands

From `Gloryhills/`, use Node 24 (installed locally):

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
npm ci --include=dev
npm run typecheck
npm run lint
npm run build
cd web
node --test tests/marketing.test.mjs tests/marketing-rls.test.mjs tests/validation.test.mjs tests/rls.test.mjs
npm run start
# In another terminal, from web/:
node --test tests/http.test.mjs tests/browser.test.mjs
```

Do not run `tests/live.test.mjs` casually against production: it creates and
deletes Auth users and records. Use a dedicated test project for live integration
checks. Local PostgreSQL role tests do not prove live Auth/login persistence.

After migrations and deploying the new code, verify actual login/save/logout/
login persistence and tag network requests with consent granted/denied. Use GA4
DebugView and the vendor tools to verify receipt. No public deployment or DNS
change has been performed by this work.

## Verification results

- Typecheck passed. Lint passed with three existing image warnings.
- All seven selected unit and PostgreSQL policy tests passed.
- Production build passed from an isolated source copy without local environment files, using installed dependencies.
- Production HTTP checks passed, including unauthenticated admin redirects.
- Browser automation was blocked by Chrome startup permissions (SIGABRT/EPERM); browser and live Supabase checks remain pending.
- No live migrations, deployment, DNS verification or vendor receipt checks were performed.

## Changed files

- Marketing UI and server action: `web/app/admin/(protected)/marketing/{page.tsx,form.tsx,actions.ts}`.
- Validation and script loading: `web/lib/marketing.ts`, `web/lib/marketing-runtime.ts`, `web/components/analytics.tsx`.
- Consent: `web/components/consent-banner.tsx`, `web/components/consent.tsx`.
- Settings and access: `web/lib/content.ts`, `web/lib/supabase.ts`, `web/app/layout.tsx`, and existing admin `layout.tsx`, `page.tsx`, `actions.ts`.
- Migrations: `supabase/migrations/202609200001_marketing_role.sql` and `202609200002_marketing_settings.sql`.
- Tests: `web/tests/marketing.test.mjs`, `web/tests/marketing-rls.test.mjs`.
- Small lint repairs: `web/components/animated-stats.tsx`, `web/app/meet-our-pastor/page.tsx`. Existing staged changes were preserved.
- Setup and handoff: this file.

## Owner inputs still needed

A git-ignored `web/.env.local` has been prepared with a generated rate-limit secret. Fill in the Supabase project URL, public anon key and server-only service-role key locally; do not send secret keys in chat. Put the same required values in the deployment environment and use the production domain for `NEXT_PUBLIC_SITE_URL`.

Provide the public production URL and confirm which Supabase project and Vercel project host this app. No local project links were present during inspection; this does not establish whether the remote accounts are configured.

For private forms, create Cloudflare Turnstile keys for your domains and fill in both Turnstile variables. For admin access, create an Auth user and assign its UUID using `ADMIN_SETUP.md`. Apply the initial schema and seed only if the database is new, followed by both marketing migrations in order.

Optional GTM, Meta Pixel and Google Ads identifiers can be entered later in `/admin/marketing`. Supplied GA4 and AdSense IDs need not be supplied again. An email provider is only needed if you want submission email notifications, which are not currently implemented.

Start locally from `Gloryhills/` using `npm run dev`; visit `http://localhost:3000` and `http://localhost:3000/admin/login`. Restart after editing environment values.
