# Test results — 2026-09-15

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

## Blocked / pending

- Browser suite, screenshots, all viewport review, axe and Lighthouse: Chrome SIGABRT under sandbox; computer-use service unavailable. No results fabricated.
- Real Supabase Auth, Storage and API workflows: user is creating project; no project configuration supplied yet. PGlite results do not replace this verification.
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
node --test tests/rls.test.mjs tests/http.test.mjs
node --test tests/browser.test.mjs
```

`npm test` includes the browser suite and therefore currently fails at browser startup in this environment. Do not remove that gate to claim completion.
