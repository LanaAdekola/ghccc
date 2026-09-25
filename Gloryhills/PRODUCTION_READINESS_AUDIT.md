# Production Readiness Audit & Status Report

**Repository**: `Gloryhills/web`  
**Node Engine**: `>=20.0.0` (declared in `package.json`)  
**Production Domain**: `https://www.ghccglobal.com`  

---

## 1. Architecture Locks & Verification Status

| Component | Architecture Decision | Current Status | Notes |
|---|---|---|---|
| **Tag Delivery Layer** | Single delivery layer via Google Tag Manager (GTM) | Locked & Enforced | GTM is configured via CMS at `/admin/marketing` and stored in Supabase `settings`. Runtime does not load from environment variables. Direct GA4/Ads/Meta scripts are excluded. |
| **Tracking Events** | Authoritative 18-event registry with strict PII filtering | Locked & Verified | Documented in `TRACKING_EVENT_DICTIONARY.md`. Code implements `sermon_play_requested`. `sermon_play` and `online_giving_completed` removed from active triggers. Prayer requests are strictly untracked. |
| **Giving Precedence** | `online_giving_started` before `give_click` | Verified | Links with `data-action="online-giving-start"` or payment gateways fire `online_giving_started` without being blocked by generic `/give` routing. |
| **Consent Synchronization** | Cross-tab synchronization via `storage` & `ghcc-consent` | Implemented & Tested | Accepting in one tab activates GTM; revoking in another tab safely unloads GTM. Admin/auth routes remain excluded. |
| **SEO Origin Resolution** | Never fall back to localhost in production | Verified | In `NODE_ENV === 'production'`, `origin()` resolves to `https://www.ghccglobal.com`. |
| **Structured Data** | `VideoObject` restricted to recognized video destinations | Verified | Only sermons with valid YouTube links emit Schema.org VideoObject. |
| **Sitemap Coverage** | `/meet-our-pastor` included in fixed routes | Verified | Dynamically excludes draft, archived, future, and noindex records. |
| **Media Alt-Text** | Required meaningful alt text; reject raw filenames | Verified | Refined validation rejects filenames (`photo.jpg`) and requires meaningful text unless explicitly marked decorative (`is_decorative = true`). |

---

## 2. Test Suite Status

The local test suite has been repaired and separated into safe, deterministic commands:

* `npm test`: Runs safe unit, validation, marketing, RLS simulation, and SEO tests (12/12 passing). Does not mutate production.
* `npm run test:unit`: Runs event registry, validation, and SEO tests.
* `npm run test:marketing`: Runs GTM singleton, identifier validation, and unloader tests.
* `npm run test:rls`: Runs isolated in-memory PostgreSQL RLS simulation tests.
* `npm run test:live`: Live Supabase mutation tests. Requires explicit `RUN_LIVE_TESTS=true` opt-in and service role key.

---

## 3. Items Pending Codex / Production Administrator Review

The following items are intentionally left for separate review by Codex and the church administrators:

1. **Remote Production Database & RLS**: Live Supabase migration status, production user roles, and remote policy verification.
2. **External Marketing Accounts**: Creating church containers in GTM, configuring GA4 tags, setting up Google Ads conversion actions, and Meta Events Manager integration.
3. **DNS Ownership Verification**: Adding domain TXT verification record at the domain registrar for Google Search Console.
4. **Live Deployment & Vercel Environment**: Final production promotion and deployment.
