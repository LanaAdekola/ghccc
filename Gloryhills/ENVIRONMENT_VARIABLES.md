# Environment variables

Use Node 22.12+ (verified with Node 24.7). Application root is `web/`.

| Name | Scope | Purpose |
|---|---|---|
| NEXT_PUBLIC_SITE_URL | Public | Local origin or confirmed canonical HTTPS domain |
| NEXT_PUBLIC_SUPABASE_URL | Public | Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | Public project key; protected by RLS |
| SUPABASE_SERVICE_ROLE_KEY | Server secret | Validated private form writes only |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Public | CAPTCHA widget |
| TURNSTILE_SECRET_KEY | Server secret | CAPTCHA server verification |
| RATE_LIMIT_SECRET | Server secret | Random 32+ byte HMAC secret |
| NEXT_PUBLIC_GTM_ID | Public, optional | Only marketing script inserted by app |
| NEXT_PUBLIC_GA_MEASUREMENT_ID | Public, optional | GTM setup reference; no direct script |
| NEXT_PUBLIC_GOOGLE_ADS_ID | Public, optional | GTM setup reference; no direct script |
| NEXT_PUBLIC_META_PIXEL_ID | Public, optional | GTM setup reference; no direct script |
| NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_VERIFICATION | Public, optional | Metadata verification |

No payment or email secret is required until provider selection. Do not configure speculative keys. Restart/rebuild after public variables change. `.env.local` stays ignored; Vercel settings hold deployment values securely. Do not share screenshots of secret fields.
