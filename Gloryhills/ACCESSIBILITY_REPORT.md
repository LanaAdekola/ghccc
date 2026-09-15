# Accessibility report — 2026-09-15

Implemented: semantic landmarks, one H1 per public page, skip link, explicit form labels, visible focus styles, Escape-close mobile navigation, aria-expanded, copy-account live status, meaningful image alt text, reduced-motion media query, ≥44px main controls and no-JavaScript navigation fallback.

Automated browser accessibility and responsive checks are **blocked, not passed**. `web/tests/browser.test.mjs` runs axe WCAG A/AA checks and tests 320, 360, 390, 768, 1024, 1280, 1440 and 1920px widths, but Chrome startup aborts in this sandbox. Computer-use preview is also unavailable. Run these checks and manually inspect keyboard behavior, 200% zoom, mobile crops and form errors before launch.

No sermon captions/transcripts were supplied. External media links are used; do not claim caption compliance for third-party videos. Preserve descriptive transcripts when the church supplies them.
