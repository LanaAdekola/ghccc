# Vercel deployment guide

Deployment has not been performed. Obtain explicit approval before public deployment or DNS changes.

1. Use Vercel with Root Directory `Gloryhills/web` if importing the parent repository, or `web` if importing this directory alone. Framework: Next.js. Node: 24.x. Install `npm ci`; build `npm run build`.
2. Configure environments using ENVIRONMENT_VARIABLES.md. Use the confirmed canonical domain for NEXT_PUBLIC_SITE_URL. Keep preview deployments noindex and protect admin/private routes.
3. Apply Supabase migrations, seed confirmed records, configure Auth and bootstrap super-admin. Run real anonymous/admin/super-admin, storage and submission verification.
4. Complete legal/consent/retention review, confirm church content, giving accounts, media rights and sender settings. Missing content remains unpublished.
5. Run lint, typecheck, production build, tests and Lighthouse against the deployment candidate. Inspect all pages at the documented widths.
6. Request approval to deploy publicly. Add the approved apex/www domain and follow Vercel's current domain-specific records. Do not guess DNS values.
7. Verify HTTPS, redirects, sitemap, favicon, structured data, Search Console and consented GTM events. Search engines control favicon display timing.

Rollback: retain the previous Vercel deployment, promote it if needed, and disable problematic published records. Avoid destructive schema changes; use forward migrations. Preserve the legacy source until equivalent routes and security gates pass. The old Netlify CMS bundles must never be copied into the Next.js public directory.

## Fix for Node engine and Next.js detection errors

This Git repository is rooted at `ghccc`, so set Vercel **Root Directory** to
`Gloryhills/web` (case-sensitive), not `Gloryhills` or the repository root.
The app-level `web/vercel.json` runs `npm ci` and `npm run build` from that directory.
Remove old dashboard command overrides containing `--prefix web` and output
`web/.next`. Use Framework Preset Next.js, Node 24.x, and the default Next.js
output directory. Package manifests pin the Node major to 24.x.

Commit and push these changes, then deploy the new commit without reusing the
old build cache. The ESLint deprecation notice is unrelated to Next.js detection.
