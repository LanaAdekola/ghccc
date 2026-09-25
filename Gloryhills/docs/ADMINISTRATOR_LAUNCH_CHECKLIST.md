# Church Administrator Launch Checklist

A one-page operational checklist for the senior church leadership and IT administrator prior to public launch.

---

## 1. Required Church-Owned Accounts
Ensure the following accounts are registered under a central church-controlled organizational email (e.g. `gloryhillsministryng@gmail.com`), never a personal staff account:
- [ ] **Domain & DNS**: Registrar account for `ghccglobal.com`
- [ ] **Hosting**: Vercel Team account (Pro or Hobby)
- [ ] **Database & Storage**: Supabase Organization account
- [ ] **Google Cloud / Marketing Suite**:
  - [ ] Google Tag Manager (`GTM-XXXXXXX` Web container)
  - [ ] Google Analytics 4 (GA4 Web Stream)
  - [ ] Google Search Console
  - [ ] Google Ads (or Google for Nonprofits / Ad Grants)
- [ ] **Meta**: Meta Business Suite / Business Manager

---

## 2. Staff Delegations & Recommended Permissions
Invite staff via individual email invitations. **Never share administrative passwords.**

| Platform | Media Pastor Invitation | Content Editor Invitation | Technical Admin |
|---|---|---|---|
| **Church CMS (`/admin`)** | `media_editor` | `content_admin` | `super_admin` |
| **Google Tag Manager** | Container Edit, Approve, Publish | No access needed | Admin (Account & Container) |
| **Google Analytics 4** | Marketer | Viewer | Administrator |
| **Google Ads** | Standard | No access needed | Administrative |
| **Google Search Console** | Full User (not Owner) | No access needed | Verified Owner (DNS) |
| **Meta Business Manager** | Employee (Page & Ads access) | No access needed | Business Admin |

---

## 3. Production Environment Variables (Vercel)
Configure these variables in **Vercel Project Settings → Environment Variables** for the `Production` environment:
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://www.ghccglobal.com`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://<your-project-id>.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<public-anon-key>`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `<private-service-role-key>` (Never prefix with `NEXT_PUBLIC_`)
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = `<cloudflare-turnstile-site-key>` (Optional)
- [ ] `TURNSTILE_SECRET_KEY` = `<cloudflare-turnstile-secret-key>` (Optional)
- [ ] `RATE_LIMIT_SECRET` = `<32-character-random-secret>`
- [ ] `GOOGLE_SEARCH_CONSOLE_VERIFICATION` = `<verification-token>` (Optional fallback if DNS TXT is unavailable)

*(Note: GTM container ID is configured inside the CMS at `/admin/marketing` and stored in Supabase settings; it does not load from environment variables).*

---

## 4. Pre-Launch Verification Sequence
- [ ] **DNS & Domain Setup**: Apex (`@`) and `www` CNAME correctly configured in DNS to point to Vercel. SSL certificate provisioned.
- [ ] **Search Console Verification**: Verify ownership via DNS TXT record at domain registrar.
- [ ] **Sitemap Submission**: Submit `https://www.ghccglobal.com/sitemap.xml` inside Google Search Console. Verify 0 errors.
- [ ] **Robots.txt Health**: Open `https://www.ghccglobal.com/robots.txt` and ensure public routes are allowed while `/admin` and `/api` are disallowed.
- [ ] **GTM Publication**: Publish the initial workspace container containing GA4 Configuration tag and Google Ads conversion linkers.
- [ ] **Consent Mode Verification**: Open Tag Assistant (`tagassistant.google.com`) and test:
  - Tags are held before clicking "Accept".
  - Tags trigger once consent is granted.
  - No PII is passed in data-layer events.
  - Cross-tab consent synchronization functions properly.
- [ ] **Google Ads Conversion Linker**: Enable Conversion Linker in GTM.
- [ ] **Database & RLS Verification**: Ensure migrations are executed and verified in Supabase SQL editor.
- [ ] **Backup Super-Administrator**: Confirm that at least **two** trusted church leaders have `super_admin` accounts in `/admin`.
