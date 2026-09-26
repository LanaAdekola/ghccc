# Codex security review — 2026-09-26

## 1. Antigravity work: accepted with corrections

Reviewed commit 9258c47 (`chore: align marketing docs events consent seo and tests`) against previous audited 8ae0787. All 47 changed paths were inventoried; application/test changes, document sources and generated copies were reviewed. Historical migrations and authentication primitives were unchanged. The default test command excludes live tests. No real secret value, second GTM loader or direct GA4/Ads/Meta/AdSense loader was found in the introduced application code.

Corrections were necessary:
- GTM removal had lost full-document teardown, leaving executed vendor code active; DOM-only tests did not prove consent revocation.
- Event documentation overstated 18 reachable events, included an unmounted event-interest form and described an internal /give link as checkout initiation. There are 19 allowlisted names, with explicit reachability/prerequisites; no payment completion exists.
- The event sanitizer ignored each event's parameter contract. It now enforces that contract and rejects sensitive routes/query strings.
- SEO origin validation accepted arbitrary non-local origins; YouTube parsing accepted embedded lookalike URL text.
- Decorative checkbox state could remain true after unchecking, and application alt rules conflicted with the historical database constraint. Decorative images now save empty alt; unchecking clears the flag.
- Live tests assumed RLS denial must return HTTP 403, had fixed slugs and incomplete cleanup, and their npm script supplied its own opt-in. Tests now require separate explicit opt-in/target confirmation, use unique test content, check row survival, and clean exact tracked IDs.
- Documentation incorrectly treated ghcc-consent as a GTM custom event, mapped registration clicks to completed registrations, called combined consent granular and claimed unsupported consent verification. These claims were corrected.

## 2. Codex implementation

Authentication: exact own-value role allowlist, stronger direct editor/preview/action boundaries, canonical recovery origin validation, request-origin rejection before PKCE exchange, no-store/no-referrer callback responses, preview recovery disabled. No signup flow was added; disabling external Supabase signup remains mandatory.

GTM: published Supabase marketing settings remain the only configuration source. No environment fallback. Vendor IDs remain reference-only. Consent revocation, storage clearing and entry to sensitive routes reload an already-loaded document to tear down executed tags. External GTM hostname/path/consent checks remain required.

Storage: shared MIME/extension/header-signature/size checks; sanitized UUID image paths; verified raster response type rather than trusting upstream blob metadata; private,no-store/nosniff success and denial responses; public-key/cookie client maintains Storage RLS. No service-role bypass or signed URLs in the media route.

SEO: fixed production canonical origin, preview noindex, exact HTTPS YouTube host parsing, retained sitemap addition. Documentation: canonical sources, reproducible generated event dictionary/docs/admin guides, blank example secrets, exact production variables and rollout plan.

## 3. New migration

`supabase/migrations/202609250001_security_boundaries.sql` is forward-only, transactional and repeatable. Existing migration files were not modified. It preserves content, allows explicit decorative empty alt text, blocks null/blank/filename alt text for other new/updated images, reconciles role/content/storage policies and private bucket settings, and adds restrictive guards against broader permissive policies. Unrelated constraints and bucket policies are preserved.

Legacy invalid alt rows remain untouched under a NOT VALID constraint; updates to them require correction. The migration validates the constraint automatically only if existing rows comply. Applying it can change visibility/permissions and bucket settings, but does not delete or rewrite production content. Inspect actual prior state before applying; missing historical schema requires a tailored reconciliation.

## 4. Verification evidence

Personally run locally, without production credentials or mutations:

| Check | Actual result |
|---|---|
| Typecheck | Passed on Node 24.7.0 (also Node 20), incremental writes disabled |
| ESLint | Passed on Node 24.7.0 (also Node 20), no errors/warnings |
| Safe default suite | 30 tests passed on Node 20.19.2 and Node 24.7.0: auth, cookie refresh, callback, storage route, event/privacy, consent, validation, SEO and policy simulations |
| Full migration chain | Fresh install and upgrade passed, including repeat correction and legacy-data preservation; unrelated CHECK constraints retained |
| Storage policy simulation | Role insert/update/delete, published visibility and unpublish revocation passed within migration tests |
| Production build | Passed in an isolated /private/tmp copy with Supabase/server credentials explicitly blank on Node 24.7.0; also passed on Node 20 with Supabase deprecation warnings |
| HTTP | Passed against isolated Node 24 production server; public metadata/assets/redirects and protected route checks |
| Accessibility and responsive browser suite | Attempted; blocked before page checks by Chrome launch SIGABRT (Playwright also reported EPERM during cleanup). No accessibility/responsive pass claimed |
| Guide consistency | sync-guides.mjs --check matched generated sources |
| Real login/recovery/Storage and vendor delivery | Not executed; still unverified |

Auth and consent tests execute real TypeScript entry points with local mocks, not actual Supabase sessions or vendor tags. PGlite simulates PostgreSQL policies, not Supabase Auth, Storage HTTP/MIME handling, CDN cache, real grants/JWTs, SMTP or account settings. See PRODUCTION_EXECUTION_PLAN.md for limitations. Existing historical TEST_RESULTS.md results are not current certification.

## 5. Configuration and deployment state

Required variables and sources are in ENVIRONMENT_VARIABLES.md; no values are exposed. Vercel application root is Gloryhills/web relative to Git root. No linked .vercel/project.json exists in the inspected locations. Project identity, Root Directory overrides and latest production SHA remain unverified. Use Node 24 in Vercel and repeat candidate verification there; manifests permit >=20 and local builds passed on Node 20.19.2 and Node 24.7.0.

## 6. External actions and manual work

Account owners must confirm the intended Supabase/Vercel projects, inspect migration history/policies, configure Production variables, disable public signup, configure exact Auth URLs and recovery email, create individual administrators, approve controlled fixture writes, and verify storage/publishing. GTM, GA4, Ads and Search Console require actual account access/configuration. No external working connection is claimed. Do not paste keys into chat.

## 7. Rollout and rollback

Follow the exact 12-step PRODUCTION_EXECUTION_PLAN.md. No external step has been executed. Changes remain local/uncommitted; create and review an immutable candidate SHA before promotion. Preserve prior deployment and backups; rollback application code only to a compatible reviewed release. Keep restrictive policies/signup controls; repair SQL forward instead of reopening access or resetting data. GTM can be disabled in marketing settings, with refresh required for existing tabs.

## Verdict

Ready for Production Configuration. This means the local code and forward migration are prepared for owner review/configuration, not approval to deploy or a claim of production readiness. Browser accessibility/responsive checks, actual Supabase state/auth/storage and all external marketing receipt remain gates before controlled production testing and handover.

## Exact Codex file manifest

Changes relative to 9258c47; the four historical migrations and web/.env.local were not edited.

- `.env.example`
- `ANALYTICS_AND_ADS_SETUP.md`
- `DEPLOYMENT_GUIDE.md`
- `ENVIRONMENT_VARIABLES.md`
- `MEDIA_TEAM_HANDOFF.md`
- `POST_LAUNCH_VERIFICATION.md`
- `PRODUCTION_EXECUTION_PLAN.md`
- `PRODUCTION_READINESS_AUDIT.md`
- `SEO_GUIDE.md`
- `SUPABASE_SETUP.md`
- `TRACKING_EVENT_DICTIONARY.md`
- `docs/ANALYTICS_AND_ADS_SETUP.md`
- `docs/MEDIA_TEAM_HANDOFF.md`
- `docs/POST_LAUNCH_VERIFICATION.md`
- `docs/SEO_SETUP.md`
- `docs/TRACKING_EVENT_DICTIONARY.md`
- `supabase/migrations/202609250001_security_boundaries.sql`
- `web/.env.example`
- `web/app/[page]/page.tsx`
- `web/app/admin/(protected)/actions.ts`
- `web/app/admin/(protected)/edit/[id]/page.tsx`
- `web/app/admin/(protected)/preview/[id]/page.tsx`
- `web/app/admin/forgot-password/actions.ts`
- `web/app/admin/login/actions.ts`
- `web/app/api/media/[path]/route.ts`
- `web/app/auth/callback/route.ts`
- `web/app/layout.tsx`
- `web/components/analytics.tsx`
- `web/lib/admin-guides.json`
- `web/lib/auth-policy.mjs`
- `web/lib/environment.ts`
- `web/lib/events.mjs`
- `web/lib/marketing-runtime.mjs`
- `web/lib/marketing.mjs`
- `web/lib/media-security.mjs`
- `web/lib/seo.mjs`
- `web/lib/seo.ts`
- `web/lib/supabase.ts`
- `web/lib/validation.mjs`
- `web/lib/youtube.mjs`
- `web/package.json`
- `web/scripts/sync-guides.mjs`
- `web/tests/auth.test.mjs`
- `web/tests/browser.test.mjs`
- `web/tests/consent.test.mjs`
- `web/tests/harness.mjs`
- `web/tests/http.test.mjs`
- `web/tests/live.test.mjs`
- `web/tests/marketing.test.mjs`
- `web/tests/migration-chain.test.mjs`
- `web/tests/security.test.mjs`
- `web/tests/unit.test.mjs`
