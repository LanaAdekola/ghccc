# Vercel deployment guide

Use PRODUCTION_EXECUTION_PLAN.md for the exact reviewed order and rollback. No deployment is authorized by the local security work.

Git root: /Users/mac/Desktop/projects/ghccc. Application Root Directory in Vercel: Gloryhills/web. Framework: Next.js. Use app-level web/vercel.json: install `cd .. && npm ci --include=dev`, build `npm run build`, default Next.js output directory. Do not combine it with the root-level web/.next override. Verify actual dashboard overrides before deployment.

Use Node 24 in Vercel and run the candidate's tests/build on that runtime. Manifests currently allow >=20; local validation passed on Node 20.19.2 and Node 24.7.0; the older runtime emitted Supabase's Node 20 deprecation warning. No locally linked Vercel metadata was found; project identity/deployed SHA require dashboard/API access.

Set variables from ENVIRONMENT_VARIABLES.md in Production scope, then redeploy the reviewed immutable commit. NEXT_PUBLIC_SITE_URL must be https://www.ghccglobal.com. Preview remains noindex, uses separate credentials and cannot initiate production password recovery. There is no GTM environment fallback.

Review all four historical migration states first. Apply only the missing forward security correction after prerequisites are verified. Do not rerun the initial schema or seed against an existing project. Disable public signup, configure exact Auth URLs and verify every role before opening admin access. External IDs and a successful build do not establish a working integration.
