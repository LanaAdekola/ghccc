# Environment Variables Reference

Node requirement: `>=20.0.0` (as declared in `package.json`). Application root is `web/`.

| Variable | Scope | Required | Feature / Purpose | Redeploy Required |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public | Yes (Prod) | Canonical URL origin (e.g. `https://www.ghccglobal.com`), sitemap, robots, auth callbacks | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | Supabase project origin (never append `/rest/v1/`) | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | Supabase public anon key, protected by RLS | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Secret | Yes | Validated private form writes and rate-limit counter persistence | Yes |
| `RATE_LIMIT_SECRET` | Server Secret | Yes | 32+ character random secret for HMAC hashing in rate limiting | Yes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Optional | Cloudflare Turnstile public CAPTCHA widget on public forms | Yes |
| `TURNSTILE_SECRET_KEY` | Server Secret | Optional | Cloudflare Turnstile server verification key | Yes |
| `GOOGLE_SEARCH_CONSOLE_VERIFICATION` | Public / Server | Optional | Google Search Console verification token for HTML metadata | Yes |

---

### Marketing & Analytics Architecture Note

> [!IMPORTANT]
> **Single Tag Delivery Layer**: Google Tag Manager is the only tracking-script delivery layer.
>
> The active GTM container ID and enable/disable state are managed directly in the CMS at `/admin/marketing` and stored in the published Supabase `settings` content record.
>
> **The active runtime does NOT load GTM from environment variables.**
> Do not configure `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, or `NEXT_PUBLIC_META_PIXEL_ID` as environment variables for active tracking. GA4, Google Ads, Meta, and AdSense IDs stored in `/admin/marketing` remain reference values for configuring tags inside the GTM web container.

Never commit `.env` or `.env.local` to source control. Set production values in your hosting dashboard (e.g. Vercel Project Settings → Environment Variables).
