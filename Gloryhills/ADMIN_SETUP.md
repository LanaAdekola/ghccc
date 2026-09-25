# Administrator setup and user guide

Create approved users in Supabase Authentication. Public signup is not part of the website. Assign the first super-admin in the Supabase SQL Editor using their actual Auth user UUID:

```sql
insert into public.user_roles(user_id,role)
values ('REPLACE-WITH-AUTH-USER-UUID','super_admin');
```

Sign in at `/admin/login`. Unauthorized users cannot access dashboard, edit, preview or actions. A super-admin can grant/change/remove roles for existing Auth users. The UI does not permit changing your own role. Auth account invitation/deletion currently happens in Supabase, not the website.

## Editing

Choose a content type, create a draft, supply slug/title/description/body, save, preview, then change status to published. Change back to draft to unpublish. Display order controls sorting. Events use UTC in the editor and display in Africa/Lagos. Enter headquarters 18:00 as 17:00 UTC.

Image upload accepts JPEG/PNG/WebP ≤5 MB. Save text before uploading. The uploaded path fills the image field; add meaningful alt text and save again. Images must have descriptive alt text (filenames are rejected); mark as decorative only if intentionally decorative. Images are private until attached to published content. An unpublished record's image is no longer available to anonymous requests.

Additional structured fields use labelled forms per content type, not JSON. Giving methods ask for bank, account name, account number, currency and SWIFT. Settings ask for the two location names, address, phone, public email, Spotify show and map link. Service times ask for location, day, 24-hour start and end times and timezone. Gallery images ask for the album. Announcements, leadership, giving campaigns and homepage ordering have their own fields. Required fields are enforced when you publish: giving methods need bank, account name, account number and currency; service times need location, day, start, end and timezone; gallery images need an album. Public email must be a valid address, links must start with https://, times use HH:MM and a service must end after it starts. Any older saved values that do not match the current fields stay editable under “Other saved fields”. Never put credentials into content.

Homepage title/description replace the hero copy; body edits the welcome text. Homepage section order is set with the ordered dropdowns in the editor rather than by typing a list. Featured checkbox and display order prioritize records. Sermons/events have detail routes and SEO fields. Gallery images attach to album_slug. Published settings override the versioned confirmed fallback. Other collection workflows and preview fidelity should be verified against the new project before handing over to the media team.

Private submissions appear only to administrators. Delete after responding according to the approved retention policy. No notification email is sent yet. Database defaults suggest 90 days but do not automatically delete expired records; approve retention and configure a scheduled cleanup before accepting public submissions.

## Password recovery

The login page links to `/admin/forgot-password`. In Supabase Authentication →
URL Configuration, allow `http://localhost:3000/auth/callback` and the production
`https://www.ghccglobal.com/auth/callback`. Set `NEXT_PUBLIC_SITE_URL` to the current
site origin. Keep the reset email template's standard `{{ .ConfirmationURL }}`
link. Request the reset from this website and open the email in the same browser
so the PKCE verifier cookie is available. The callback establishes a session,
then `/admin/reset-password` accepts and confirms the new password. Expired links
show a recovery message. Configure Supabase SMTP if email delivery is unavailable
or its testing limits prevent delivery.

The app launched by the root workspace scripts reads `web/.env.local`.
`NEXT_PUBLIC_SUPABASE_URL` must be the project origin, never its `/rest/v1/`
endpoint. Restart Next.js after changing environment files; update Vercel's
values separately and redeploy. Do not copy secret values into Git or chat.
