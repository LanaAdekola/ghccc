# SEO Setup & Architecture Guide

This document describes the search engine optimization (SEO) architecture, metadata rules, sitemap generation, and structured data standards for Glory Hills Community Church.

---

## 1. Canonical URLs & Production Origin Rules

* **Canonical Domain**: `https://www.ghccglobal.com`
* **Production Origin Protection**: In production (`NODE_ENV === 'production'`), metadata generation and sitemap generation safely resolve to `https://www.ghccglobal.com`. The application will **never** silently fall back to `http://localhost:3000` in production.
* **Development**: Local development environments safely default to `http://localhost:3000`.

---

## 2. Dynamic XML Sitemap (`/sitemap.xml`)

* Generated dynamically at `/sitemap.xml`.
* **Fixed Public Routes**:
  * `/` (Home)
  * `/about-us`
  * `/leadership`
  * `/meet-our-pastor`
  * `/sermons`
  * `/events`
  * `/give`
  * `/visit-us`
  * `/contact`
  * `/prayer-request`
  * `/plan-your-visit`
  * `/cookies`
* **Dynamic Database Records**: Automatically includes published pages, sermons, events, and gallery albums.
* **Strict Publication Filtering**:
  * `draft` and `archived` records are excluded.
  * Records with `published_at` in the future are excluded.
  * Content with `noindex = true` is excluded.
  * Admin, authentication, and password reset routes are strictly excluded.

---

## 3. Crawler Directives (`/robots.txt`)

* **Public Crawlers**: Allowed on all public pages (`Allow: /`).
* **Protected Paths**: Disallows crawler access to `/admin` and `/api`.
* **Sitemap Reference**: References `https://www.ghccglobal.com/sitemap.xml`.
* **Noindex Pages**: Admin pages emit noindex,nofollow; the auth callback is a no-store redirect, not an indexable content page. Public indexing requires VERCEL_ENV=production and the canonical NEXT_PUBLIC_SITE_URL; previews are noindex.

---

## 4. Structured Data (Schema.org)

* **Church Organization**: Emitted on root layout with Church name, logo, official social channels, and headquarters address.
* **Events**: Emitted on event details pages (`/events/[slug]`) with title, description, start date, Africa/Lagos timezone, and venue.
* **Sermon VideoObject**: Emitted on sermon details pages (`/sermons/[slug]`) **only when the sermon external URL is a recognized video destination** (valid YouTube URL). Arbitrary HTTPS links (e.g. audio links, Spotify podcasts, notes) do not emit VideoObject markup.

---

## 5. Media Alt-Text & Accessibility Standards

* **Meaningful Descriptions**: Public images require meaningful descriptive alternative text.
* **Filename Rejection**: Raw filenames (e.g. `banner.jpg`, `photo.png`) are rejected by server-action validation and the forward database constraint.
* **Decorative Images**: Supported only when explicitly marked as decorative by the editor (`is_decorative = true`), which saves empty alt text for assistive technology. Legacy invalid records are preserved by a NOT VALID database check until editors correct them.
