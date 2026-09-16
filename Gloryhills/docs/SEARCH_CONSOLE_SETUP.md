# Google Search Console Setup Guide

This guide walks the media team through claiming, verifying, and monitoring the church website on Google Search Console (GSC).

---

## 1. Adding the Property

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property**.
3. Choose **URL prefix** and enter your production site URL:
   `https://gloryhillscommunitychurch.org` (or current live domain).

---

## 2. Verification Methods

The codebase supports **HTML tag verification** natively without touching source code:

### Method: HTML Tag (Recommended)
1. In Search Console, select **HTML tag** as the verification method.
2. Google provides a `<meta>` tag like:
   `<meta name="google-site-verification" content="abcdef1234567890..." />`
3. Copy only the `content` string (e.g. `abcdef1234567890...`).
4. Set the environment variable in your deployment settings:
   ```bash
   GOOGLE_SEARCH_CONSOLE_VERIFICATION=abcdef1234567890...
   ```
5. Trigger a deployment.
6. Return to Search Console and click **Verify**.

> [!NOTE]
> The layout also supports DNS TXT record verification via your domain registrar (e.g. Cloudflare / Namecheap) if preferred by your web administrator.

---

## 3. Submitting the XML Sitemap

1. In the Search Console sidebar, navigate to **Indexing** -> **Sitemaps**.
2. In the **Add a new sitemap** input field, enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**.
4. Status should show **Success**.
5. Google will read all routes dynamically served by Next.js at `/sitemap.xml`, including:
   - All static pages (`/`, `/about-us`, `/leadership`, `/sermons`, `/events`, `/give`, `/visit-us`, `/contact`, `/prayer-request`, `/plan-your-visit`, `/cookies`)
   - All dynamic editorial pages
   - All published sermon detail routes (`/sermons/[slug]`)
   - All published event detail routes (`/events/[slug]`)
   - All published photo gallery albums (`/gallery/[slug]`)

---

## 4. Checking robots.txt

Verify that `/robots.txt` is accessible and active:
- Direct URL: `https://yourdomain.com/robots.txt`
- In Search Console: Use the **robots.txt report** or URL Inspection.
- Expected content:
  ```txt
  User-Agent: *
  Allow: /
  Disallow: /admin
  Disallow: /api

  Sitemap: https://yourdomain.com/sitemap.xml
  ```
- Public pages are fully accessible, while administrative routes are protected from crawler indexing.

---

## 5. Ongoing Monitoring Workflow

| Check Item | Frequency | What to Look For |
|---|---|---|
| **Coverage / Pages** | Monthly | Check for indexing spikes or 404 errors |
| **Performance** | Bi-weekly | Top queries for church location, sermons, and service times |
| **Enhancements** | Monthly | Validate that Videos and Events report zero critical schema errors |
| **Security & Manual Actions** | Quarterly | Ensure "No issues detected" status remains clean |

