# Glory Hills — Next.js migration

Requires Node 22.12+; verified with Node 24.7. Start from this directory:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Leave Supabase variables unset to review confirmed fallback content. Admin sign-in and submission delivery remain unavailable until configured. Read ../SUPABASE_SETUP.md before connecting a project.

```sh
npm run build
npm run start
npm run typecheck
npm run lint
node --test tests/rls.test.mjs tests/http.test.mjs
node --test tests/browser.test.mjs
```

HTTP/browser tests require the production server on port 3000. Browser tests require permission to launch Chrome. The current sandbox blocks browser startup; do not treat that test as passed. RLS tests execute the migration in local PostgreSQL via PGlite, not a live Supabase project.

The old Gatsby application is retained at the parent root until parity/security gates pass. Vercel must use this directory as its root; do not deploy parent public/admin files.
