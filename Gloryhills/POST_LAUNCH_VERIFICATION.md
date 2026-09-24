# Post-launch verification

Do not sign off from a successful build. Use production with temporary test content and individual test accounts.

1. Verify intended commit, branch/root, production-only environment and canonical HTTPS domain.
2. Test sign-in, invalid credentials, sign-out and recovery email end to end.
3. As media editor, create draft sermon/event/schedule/gallery image/announcement; preview, publish, inspect live page, edit, unpublish and archive.
4. Upload approved image, confirm private preview and public access only after publishing; reject unsupported and oversized files. Recheck after sign-out and deployment.
5. Attempt restricted URLs/actions with each role. No prayer submissions or role management for media/marketing staff.
6. In a clean browser, test consent reject/accept/change, exactly one GTM loader, no admin tracking, SPA page-view deduplication, safe parameters and vendor receipt.
7. Inspect GA4 DebugView, Ads test conversions, Meta test events, Search Console verification and sitemap submission.
8. Run keyboard, Axe, responsive 320–1920px, internal-link and Lighthouse checks. Record warnings and failures honestly.
9. Archive temporary records and remove test accounts after the supervised exercise.

See PRODUCTION_READINESS_AUDIT.md for the current blockers. External-platform links or IDs are not evidence of a working connection.
