# Test results — 2026-09-15 (updated 2026-09-16)

## Passed

- Next.js production build and TypeScript compilation (Node 24.7).
- Standalone TypeScript noEmit check.
- HTTP checks: 11 public pages return 200, each has one H1, unique server-rendered title and canonical metadata.
- Confirmed headquarters address/schedule, Isheri location and Spotify URL appear in rendered HTML.
- Legacy redirects return 308; unknown/draft detail paths return 404.
- Unconfigured/unauthenticated admin dashboard, edit and preview redirect to login; login has noindex.
- Favicon sizes, manifest and social image return 200.
- Sitemap excludes admin; robots excludes admin; forged-origin form requests are denied.
- PostgreSQL policy tests using PGlite execute the migration: anonymous publication filtering, future/draft exclusion, private submissions, storage publication rules, normal-user escalation denial, admin/super-admin distinction, unpublish revocation and atomic rate limiting.
- New app dependency audit: zero known vulnerabilities. Legacy: 98 (2 critical, 45 high, 39 moderate, 12 low).

### 2026-09-16 run (Node 24.19, Linux, production server, live Supabase project connected)

- `npm run build`, `npm run typecheck`, `npm run lint`: passed.
- `node --test tests/validation.test.mjs tests/rls.test.mjs tests/http.test.mjs`: passed, including new cases for structured service times, settings link/email rules and admin form data extraction.
- `node --test tests/browser.test.mjs`: passed. 11 public routes, zero axe (WCAG 2A/2AA/2.1AA) violations, no horizontal overflow at 320/360/390/768/1024/1280/1440/1920. Previous failure was the harness: `@axe-core/playwright` requires a page from `browser.newContext()`.
- Lighthouse (Chrome, production server) on `/`, `/sermons`, `/give`, `/visit-us`: performance 97–99, accessibility 100, best practices 100, SEO 69. The only failing SEO audit is `is-crawlable`: the app deliberately emits `noindex` unless `NEXT_PUBLIC_SITE_URL` is https. Must be re-run against the real https origin before launch.
- `node --test tests/live.test.mjs` against the real Supabase project: schema and seed present; anonymous requests see only published, non-future content; `user_roles`, `submissions`, `rate_limits` and `audit_logs` return nothing to anonymous requests; anonymous writes to content, submissions, roles and `consume_rate_limit` are rejected; `church-media` is private and anonymous list/upload fail; a signed-in user without a role cannot write content; an admin can create, publish and unpublish content (public reads gain and lose the row accordingly) but cannot grant roles; a super-admin can change roles. Temporary `devin-live-check-*` Auth users and rows are created and deleted by the test.

## Blocked / pending

- Lighthouse SEO against a real https `NEXT_PUBLIC_SITE_URL`: not yet run; expected to clear `is-crawlable`.
- Administrator browser workflows (sign-in, editing with the new structured forms, preview, publish/unpublish, image upload, role management): API-level behaviour verified in `tests/live.test.mjs`; UI verification pending.
- Supabase Auth dashboard settings (public signup disabled, password policy, rate limits, redirect URLs) are project settings and still need manual confirmation; they are not verifiable from the anon/service keys.
- No real administrator account exists yet in the project: create it in the Supabase dashboard and assign `super_admin` per ADMIN_SETUP.md.
- Form successful persistence/CAPTCHA and live rate limiting: require configured Supabase + Turnstile + server secrets.
- Real giving copy interaction and administrator workflows: browser + populated project required.
- GTM Preview/GA4/Ads/Meta validation: no identifiers/accounts supplied.
- Email notifications and payment flow: providers unconfirmed, not implemented.

## Commands

Run from `web/` with Node 22.12+:

```sh
npm ci
npm run build
npm run typecheck
npm run lint
npm run start
node --test tests/validation.test.mjs tests/rls.test.mjs tests/http.test.mjs
node --test tests/browser.test.mjs
node --test tests/live.test.mjs   # needs web/.env.local with the real project keys
```

`npm test` includes the browser suite. It passes on Linux with Chrome installed for Playwright. Do not remove that gate to claim completion.
