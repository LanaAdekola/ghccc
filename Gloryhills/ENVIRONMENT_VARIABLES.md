# Production configuration

Application root: `Gloryhills/web` relative to the Git repository `/Users/mac/Desktop/projects/ghccc`. The current manifests declare Node >=20; verification passed on Node 20.19.2 and Node 24.7.0. The Node 20 build emitted a Supabase deprecation warning. Use Node 24 in Vercel and rerun checks for the final committed candidate before promotion.

No values or secrets are included below. Keep secrets in Vercel's encrypted environment settings. Never prefix server secrets with NEXT_PUBLIC_. Changes to Vercel variables require a new deployment.

| Variable | Public/secret | Required | Vercel scope | Consumer | Source | New deployment |
|---|---|---|---|---|---|---|
| NEXT_PUBLIC_SITE_URL | Public | Yes | Production | SEO, recovery, submissions origin, indexing | Confirmed canonical origin https://www.ghccglobal.com | Yes |
| NEXT_PUBLIC_SUPABASE_URL | Public | Yes for auth/content/media/GTM settings | Production | content.ts, supabase.ts, proxy.ts, submissions | Intended Supabase project settings | Yes |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | Yes for auth/content/media/GTM settings | Production | content.ts, supabase.ts, proxy.ts | Same project's publishable/anon key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Secret | Yes for public submissions; not login | Production, server only | api/submissions/route.ts | Same project's privileged server key | Yes |
| RATE_LIMIT_SECRET | Secret | Yes for public submissions | Production, server only | api/submissions/route.ts | Cryptographically random 32+ byte value | Yes |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Public | Yes for public submissions | Production | turnstile.tsx, public-form.tsx | Cloudflare Turnstile site for approved domain | Yes |
| TURNSTILE_SECRET_KEY | Secret | Yes for public submissions | Production, server only | api/submissions/route.ts | Matching Turnstile secret | Yes |
| GOOGLE_SEARCH_CONSOLE_VERIFICATION | Public token, server-read | Optional if DNS verification used | Production | layout.tsx | Search Console HTML verification token | Yes |
| NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_VERIFICATION | Public | Optional legacy alternative | Production | layout.tsx | Same purpose; server-read variable takes precedence | Yes |

Vercel supplies VERCEL and VERCEL_ENV. NODE_ENV and NEXT_RUNTIME are framework managed. VERCEL chooses the trusted forwarded IP header for rate limits; VERCEL_ENV=production plus the exact canonical site URL enables public indexing. Preview deployments remain noindex and password recovery is disabled there. Use separate non-production backend credentials for preview environments; do not automatically share Production secrets.

GTM and GA4/Ads/Meta/AdSense identifiers are configured through /admin/marketing. NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_GOOGLE_ADS_ID and NEXT_PUBLIC_META_PIXEL_ID are unused and unnecessary. There is no environment-variable GTM fallback.

TEST_BASE_URL is a local test target only. RUN_LIVE_TESTS and LIVE_TEST_PROJECT_URL are explicit live-test controls, not application variables. npm test never runs live tests; npm run test:live also skips unless RUN_LIVE_TESTS=true is separately supplied. Only use live tests after explicit approval against a disposable project.
