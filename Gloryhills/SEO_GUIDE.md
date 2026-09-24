# SEO guide

No WordPress plugin is needed. In each approved content record, use SEO title, meta description, Open Graph title/description, social image and noindex. Leave optional fields blank to use defaults. A social image can be an uploaded media filename or a local image path. Prefer landscape 1200×630 artwork.

Use a descriptive title and a concise summary. The search snippet is an illustration of the saved content, not a guarantee of Google's result. Check the actual public page after publishing. Noindex removes eligible content from the generated sitemap but does not make a page private; use Draft for privacy.

Production canonicals and sitemap depend on Vercel's NEXT_PUBLIC_SITE_URL. It must be the canonical HTTPS domain. Changing localhost environment files does not configure production.

Homepage SEO override and all fixed-route behavior are not fully verified. Renamed slugs do not automatically create redirects. Rich Results and Search Console checks remain required; valid JSON alone is not a rich-results pass.
