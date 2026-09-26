# Controlled production execution plan

Prepared 2026-09-26. No production mutations, deployment, Auth changes, GTM publication or credential changes were performed during this work. Base reviewed: Antigravity 9258c47 over audited 8ae0787. Codex changes remain uncommitted; select an immutable candidate SHA after review and successful checks. Do not deploy a moving branch without recording its SHA.

## Preconditions and state inventory (read only)

Vercel root is Gloryhills/web relative to Git root /Users/mac/Desktop/projects/ghccc. Use the app-level vercel.json, Next.js framework, Node 24, install `cd .. && npm ci --include=dev`, build `npm run build`, default Next.js output. Do not combine this with root-level web/.next output overrides. No .vercel/project.json exists at repository root, project root or web root. Linked Vercel project and deployed SHA cannot be inferred. Inspect Vercel's Production deployment source SHA, project Root Directory and effective Production variable names without copying values into logs.

In the intended Supabase project, inspect these queries in the SQL editor (read-only):

```sql
select version, name from supabase_migrations.schema_migrations order by version;
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname;
select n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname in ('public','storage') and c.relkind='r';
select conname,convalidated,pg_get_constraintdef(oid)
from pg_constraint where conrelid='public.content'::regclass;
select id,name,public,file_size_limit,allowed_mime_types from storage.buckets where id='church-media';
select role,count(*) from public.user_roles group by role;
select kind,status,count(*) from public.content group by kind,status;
select grantee,table_schema,table_name,privilege_type from information_schema.role_table_grants
where table_schema in ('public','storage') and grantee in ('anon','authenticated','service_role');
select slug,status,published_at,data->>'gtm_enabled' as gtm_enabled,
 coalesce(length(data->>'gtm_id'),0)>0 as gtm_id_present
from public.content where kind='settings' and slug='marketing';
```

If the migration ledger does not exist because migrations were run manually, compare actual schema, function definitions and policies with all four historical migrations. Do not create or repair the ledger speculatively. Review triggers and SECURITY DEFINER function ownership/search_path, especially has_role, content_staff, can_manage_marketing, consume_rate_limit and audit_change. Inventory unknown policies: the corrective restrictive policies limit broad permissive policies, but unknown restrictive policies can still deny legitimate access. Unexpected grants, owner roles, service keys or other callable SECURITY DEFINER functions require review; RLS cannot restrict table owners or BYPASSRLS roles.

## Exact rollout order

1. **Review production state.** Confirm intended Supabase project and Vercel deployment/project; export schema/policies and confirm a restorable backup. Record current deployment SHA and the reviewed candidate SHA. Execute the read-only inventory above. Finish local/CI browser and Node 24 checks before promotion.
2. **Apply only the missing correction after prerequisites are verified.** Confirm 202609150001_initial, 202609200001_marketing_role, 202609200002_marketing_settings and 202609240001_editor_boundaries are present or their exact schema state is verified. If earlier migrations are missing or incompatible, stop and prepare a tailored reconciliation rather than rerunning initial.sql or seed.sql. If the correction is absent, execute exactly supabase/migrations/202609250001_security_boundaries.sql using the migration runner or SQL editor. It is transactional, repeatable, and contains no content deletion/update. It reconciles bucket settings and policies. Confirm resulting guards, helper privileges, private bucket and content_image_alt_safe validation state. Existing invalid alt rows remain untouched; editors must supply truthful descriptions or explicitly mark truly decorative images before updating those records. Validate the constraint after remediation. Do not fabricate descriptions or mark images decorative just to satisfy SQL.
3. **Set Vercel Production variables.** Use ENVIRONMENT_VARIABLES.md. Supply the intended Supabase URL/public key; add service-role, Turnstile pair and random rate-limit secret for forms. Set NEXT_PUBLIC_SITE_URL=https://www.ghccglobal.com. Keep Production secrets separate from preview. Do not configure tracking environment variables.
4. **Redeploy the reviewed immutable candidate.** Verify Root Directory Gloryhills/web and app-level commands. Use Node 24, rerun checks, then deploy with the updated Production environment. Record deployed SHA and URL. Keep GTM disabled while authentication and storage are verified. Smoke-test canonical URLs, noindex admin pages and unauthenticated redirects.
5. **Disable Supabase public signup before opening admin access.** Confirm Auth's “Allow new users to sign up” is OFF. This is an external control, not a UI flag. If already disabled, preserve it; do not temporarily enable it. Application code contains no public signup path.
6. **Configure recovery and Auth URLs.** Site URL: https://www.ghccglobal.com. Exact production redirect allowlist: https://www.ghccglobal.com/auth/callback. Avoid wildcard production redirects. Configure recovery mail/SMTP delivery and password policies. Use localhost callbacks only on a separate development project. Production callback rejects any other request origin; recovery is disabled on Vercel preview. Test recovery in the browser that requested the link (PKCE verifier cookie), expired codes and sign-out after password update.
7. **Create individual administrator accounts and assign exact roles.** Use the Supabase dashboard with signup still disabled. Assign first super_admin via a reviewed user UUID, never by a browser-supplied claim. Add media_editor, marketing_admin and content_admin only as needed. Verify both direct URLs and actual server actions for every role; unsupported/no-role users must be refused. Confirm session refresh and sign-out. Do not share credentials.
8. **Test storage and publishing with approved temporary records.** Upload JPEG/PNG/WebP ≤5 MiB; try unsupported formats, MIME/extension mismatch and oversized uploads. Verify private preview, anonymous access only when referenced by current published content, and revocation after unpublish. Media editors must not update/delete stored files, delete content, modify giving/settings or access pastoral submissions. Marketing users must only manage marketing settings. Inspect cache/type headers. Archive/remove only the exact temporary records/objects/accounts created for this exercise. Test forms and Turnstile separately; no real personal or pastoral data in fixtures.
9. **Save/enable GTM through /admin/marketing.** Use the approved container. GA4/Ads/Meta/AdSense fields are reference IDs, not activation controls. A valid ID plus enabled published settings permits loading after consent; configuration status is not delivery verification.
10. **Test consent in Tag Assistant.** Before consent: no loader/vendor requests. Accept: one loader and one page_view. Decline/revoke across tabs or clear storage: a loaded document reloads and no tags restart. Navigate to admin/auth/prayer routes and verify exclusions both in the app and GTM. Verify default/update signals for analytics_storage, ad_storage, ad_user_data and ad_personalization. Sanitize URL/referrer data and prohibit PII. Include SPA route changes and preview-host exclusions.
11. **Verify external receipt.** Inspect GA4 DebugView and Google Ads diagnostics/test conversions with account owners. Map consented page_view exactly once. Treat click intent as engagement, never a completed donation or registration. Do not configure unavailable events as conversions. Test Meta only if approved; no claim of receipt until visible in the actual property/account.
12. **Complete Search Console.** Verify property ownership through DNS or the optional metadata token, submit https://www.ghccglobal.com/sitemap.xml, inspect canonical/indexability and structured data. Search-engine indexing is asynchronous. Finish accessibility, responsive, keyboard and media-team acceptance checks before handover.

## What the local simulations establish

PGlite applies the complete ordered chain to an isolated database, then checks fresh installation, upgrade with invalid legacy alt rows, missing known policies, repeated corrective application, role boundaries, publication timing and storage object row access. Deliberately permissive extra policies/grants are included to exercise restrictive guards.

It does not reproduce Supabase Auth/JWT verification, PostgREST response semantics, connection roles/pooling, Storage HTTP APIs, bucket MIME/size enforcement, actual file persistence/CDN behavior, signed URLs, SMTP, external grants/triggers or dashboard settings. Unit auth/consent tests execute real entry points with mocked local dependencies; they do not prove real sign-in or vendor teardown timing in a browser. File signatures are a basic raster header check, not a full image decoder or malware scanner. Downloads use the caller's cookie/public-key session and storage RLS, never service_role. Responses are private,no-store and nosniff. Revocation blocks future access, not already downloaded copies. Already-issued signed URLs and bucket public-URL caches must be inventoried separately.

## Rollback

Retain the previous deployment SHA and sanitized environment-variable inventory. For application failure, pause rollout and promote a reviewed compatible deployment; do not reopen signup, restore broad policies, or publish analytics to work around a defect. Disable GTM in marketing settings and require existing tabs to reload if tracking misbehaves. Environment rollback requires a redeployment and secure prior values, not secrets in this document.

The corrective SQL transaction rolls back on failure. After successful application, do not run historical down/reset migrations or restore permissive policies: retain security boundaries and use a reviewed forward fix. The NOT VALID alt constraint preserves old records; correct their descriptions before modifying them. No content was rewritten by the correction. If recovery from an unrelated incident requires a database backup, the owner must approve the data-loss window and recovery procedure first. Track temporary test IDs for precise cleanup; never delete by a broad slug prefix.
