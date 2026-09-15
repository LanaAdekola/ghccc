# Domain and DNS checklist

- Confirm ownership of historic ghccglobal.org, registrar, DNS provider, existing mail records and chosen canonical apex/www.
- Export existing DNS before changes. Preserve MX, SPF, DKIM and DMARC.
- Obtain explicit public deployment/DNS approval.
- Use Vercel-provided records, verify both hostnames, canonical redirect and HTTPS.
- Validate /sermon → /sermons, /event → /events, /otherdata → /; add additional historic redirects only from evidence.
- Confirm Supabase Auth production URLs and Turnstile hostname allowlist.
