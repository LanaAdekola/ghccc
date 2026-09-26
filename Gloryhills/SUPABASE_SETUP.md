# Supabase setup

1. Create the new Supabase project in your preferred region. Keep the database password in your password manager.
2. Copy `web/.env.example` to `web/.env.local`. Enter the project URL and public anon/publishable key under the documented names. Enter the service-role key only in `SUPABASE_SERVICE_ROLE_KEY` in that local file and Vercel's server environment. Never paste secrets into chat or commit the file.
3. In Supabase SQL Editor, run `supabase/migrations/202609150001_initial.sql`, then the remaining migrations in filename order on the empty project (commit the marketing enum addition before the next migration). Seed only explicitly approved content; never reseed an existing project. Alternatively link the Supabase CLI to your project and use `supabase db push`; seed separately. Do not reset an existing project.
4. Confirm all four public tables plus user_roles use RLS and storage bucket church-media is private. Anonymous users must see only published, non-future content; no submissions or roles.
5. Disable public signups in Auth. Create the first user using the dashboard, then assign super_admin using ADMIN_SETUP.md. Configure password policies, Auth rate limits and production/local redirect URLs.
6. Restart the app. Test real sign-in, edit, publish, unpublish, upload and unauthorized requests. Local PostgreSQL policy tests do not verify the project's grants, gateway, Auth settings or Storage service.

Private submissions require Turnstile keys and RATE_LIMIT_SECRET. Without them the form remains disabled or returns a truthful unavailable response. No email provider has been selected; administrators currently review received requests in the dashboard.

The forward correction is 202609250001_security_boundaries.sql. Follow PRODUCTION_EXECUTION_PLAN.md for production inventory, prerequisite checks, NOT VALID legacy alt-text remediation, storage verification and rollback. Local policy tests are not a production migration ledger.
