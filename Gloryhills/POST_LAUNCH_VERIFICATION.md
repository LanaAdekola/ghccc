# Post-Launch Verification Protocol

This document provides the mandatory step-by-step verification protocol for the church media and engineering team following deployment.

> [!NOTE]
> External platform connectivity (Tag Assistant, GA4 DebugView, Google Ads conversion receipt, Meta Test Events, and Search Console indexing) must be verified through supervised end-to-end testing with authorized church accounts.

---

## 1. Consent & Tag Delivery Verification

1. Open a clean browser window in Incognito/Private mode.
2. Navigate to `https://www.ghccglobal.com`.
3. Open browser Developer Tools → Network tab. Filter by `gtm.js`.
4. **Before Consent**: Confirm that no `gtm.js` network request is made.
5. In the cookie banner at the bottom of the screen, click **Accept**.
6. **After Consent**: Confirm that exactly one `gtm.js` script tag loads.
7. Open a second tab to `https://www.ghccglobal.com/cookies`. Select **Decline** or revoke analytics consent.
8. Switch back to the first tab. Confirm that the `#ghcc-gtm` script element is removed, the document reloads, and no tracking loader or subsequent vendor requests start after reload. Previously sent requests cannot be recalled.

---

## 2. Event Dispatch & Zero PII Verification

1. In the console, inspect `window.dataLayer`.
2. Confirm the `page_view` event has fired with `{event: 'page_view', page_path: '/'}`.
3. Test key interactions:
   * Click the YouTube sermon play button: verify `sermon_play_requested` is pushed.
   * If an approved external checkout link exists, click it and verify `online_giving_started` is pushed instead of generic give_click. The internal /give placeholder is not checkout.
   * Click a giving method card and copy account number: verify `bank_details_copied` is pushed without account number parameters.
   * Submit a test contact form: verify `contact_form_submitted` is pushed without name, email, or message parameters.
4. Navigate to `/prayer-request`: verify tracking is completely disabled and dataLayer events are suppressed.

---

## 3. SEO & Sitemap Verification

1. Visit `https://www.ghccglobal.com/robots.txt`: verify crawler access to `/` is allowed and `/admin` and `/api` are disallowed.
2. Visit `https://www.ghccglobal.com/sitemap.xml`: verify all URLs use `https://www.ghccglobal.com/` and `/meet-our-pastor` is present. Confirm draft or future records are not listed.
3. Inspect `<head>` of `https://www.ghccglobal.com/`: confirm canonical points to `https://www.ghccglobal.com`.
4. Test a sermon page (`/sermons/[slug]`): inspect `<script type="application/ld+json">` and confirm `VideoObject` is only emitted when a valid YouTube URL is attached.

---

## 4. Accessibility & Responsive Verification

1. Test responsive layouts across standard viewports:
   * 320px (compact mobile)
   * 375px / 390px (modern smartphones)
   * 768px / 834px (tablets)
   * 1024px / 1280px / 1440px / 1920px (desktops)
2. Verify keyboard navigation: `Tab`, `Shift+Tab`, `Enter`, and `Space` must navigate through all interactive controls and skip links cleanly.
3. Ensure all public images carry meaningful descriptive alt text or are explicitly marked decorative.
