# Google Search Console Setup Guide

This guide describes how to verify ownership of `https://www.ghccglobal.com` in Google Search Console and submit the sitemap.

---

## 1. Primary Verification Method: DNS TXT Record (Recommended)

1. Log into [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** property type and enter `ghccglobal.com`.
3. Copy the `google-site-verification` TXT record token provided by Google.
4. Add the TXT record in your domain registrar's DNS settings (e.g. Namecheap, Cloudflare, GoDaddy).
5. Click **Verify** in Search Console.

---

## 2. Alternative Fallback Method: HTML Meta Tag

If DNS management is inaccessible:
1. In Search Console, select **URL prefix**: `https://www.ghccglobal.com`.
2. Choose the **HTML tag** verification method.
3. Copy the token string inside `content="..."`.
4. In your hosting dashboard, set the environment variable:
   ```bash
   GOOGLE_SEARCH_CONSOLE_VERIFICATION=your_token_here
   ```
5. Trigger a deployment. The token will be rendered in `<meta name="google-site-verification" content="...">`.
6. Click **Verify** in Search Console.

---

## 3. Submit XML Sitemap

1. In Search Console, navigate to **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter:
   ```text
   https://www.ghccglobal.com/sitemap.xml
   ```
3. Click **Submit**. Google will periodically crawl and index new sermons, events, and pages.
