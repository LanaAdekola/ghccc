# Performance report — 2026-09-15

Production build passes with Next.js 16.3.5, React 19.2.4 and Node 24.7. Public content is server rendered; images have reserved dimensions, hero priority and below-fold lazy loading. Fonts are locally bundled WOFF2; no third-party font request. Marketing tags are absent unless production, non-localhost, non-admin and consented. No animation library is installed.

**Lighthouse scores: not measured.** Browser-based measurement is blocked: Chrome aborts under the execution sandbox and the computer-use service is unavailable. No 90+ claim is made. Run Lighthouse against `/`, `/sermons`, `/give` and `/visit-us` on a production-like mobile configuration before launch. Retain HTML/JSON reports, evaluate LCP/CLS/INP and correct failures.

The true hero is optimized to WebP; originals remain in the old source. Dynamic storage images stream through a private no-store route to prevent draft leakage; this trades some cache performance for correct publication access. Consider immutable public derivatives only after an explicit publication/unpublication lifecycle is implemented and tested.
