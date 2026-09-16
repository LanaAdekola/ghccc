# Search Engine Optimization (SEO) Setup Guide

This document outlines the complete SEO architecture, metadata generation, and structured data implementation for Glory Hills Community Church.

---

## 1. Canonical URLs

- **Specification**: Every public page includes a self-referencing `<link rel="canonical" href="..." />` tag in the `<head>` to prevent duplicate content penalties between HTTP/HTTPS, `www`/non-`www`, and query parameters.
- **Implementation**: Defined via Next.js metadata in `web/lib/seo.ts`:
  ```typescript
  export function meta(title: string, description: string, path: string): Metadata {
    return {
      title,
      description,
      alternates: { canonical: path },
      ...
    };
  }
  ```
- **Base Domain**: Set dynamically from `NEXT_PUBLIC_SITE_URL` (defaults to `https://gloryhillscommunitychurch.org`).

---

## 2. Unique Page Titles & Meta Descriptions

Every route features an intentional, keyword-rich title and meta description:

| Route | Page Title | Purpose / Snippet Preview |
|---|---|---|
| `/` | `Welcome home \| Glory Hills Community Church` | Core home page and community identity |
| `/about-us` | `Our story. His purpose. \| Glory Hills Community Church` | Church vision, mission, and foundational scripture |
| `/leadership` | `Meet our pastors \| Glory Hills Community Church` | Senior Pastor Tobi Omojowo and pastoral team profiles |
| `/sermons` | `A word for your walk. \| Glory Hills Community Church` | Sermon library, YouTube embeds, and Spotify podcast |
| `/events` | `Life together. \| Glory Hills Community Church` | Gatherings, conferences (BEGAT, Acts 13:2, Youth), and outreach |
| `/give` | `A generous heart. \| Glory Hills Community Church` | Tithes, offerings, missions support, and verified bank details |
| `/visit-us` | `There is a place for you. \| Glory Hills Community Church` | Ojodu Berger HQ and Isheri Magodo locations, service times |
| `/contact` | `Let’s connect. \| Glory Hills Community Church` | Direct inquiries, church office contacts, and newsletter signup |
| `/prayer-request` | `You do not walk alone. \| Glory Hills Community Church` | Confidential pastoral prayer intercession |
| `/plan-your-visit` | `Your first Sunday starts here. \| Glory Hills Community Church` | First-time visitor welcome and orientation |
| `/cookies` | `Cookie preferences \| Glory Hills Community Church` | Visitor analytics consent management |

For dynamic content, editors can customize the title and description in `/admin` via the `seo_title` and `seo_description` fields.

---

## 3. Social Sharing & Open Graph Metadata

When pages or sermons are shared on WhatsApp, Facebook, iMessage, LinkedIn, or Twitter, rich previews are automatically rendered:
- **`og:title`** and **`twitter:title`**: Page or sermon title.
- **`og:description`** and **`twitter:description`**: Curated excerpt or custom SEO description.
- **`og:type`**: `website`.
- **`og:image`** and **`twitter:image`**: High-resolution image (`1200 × 630 px`) located at `/images/brand/default-social-share.jpg` or individual sermon thumbnail.
- **`twitter:card`**: `summary_large_image`.

---

## 4. Favicon and Search Result Icons

Located in `web/public/` and declared in `web/app/layout.tsx`:
- `favicon.ico` (Multi-resolution 16/32/48px standard icon)
- `favicon-16x16.png` & `favicon-32x32.png` & `favicon-48x48.png`
- `apple-touch-icon.png` (180 × 180 px iOS home-screen icon)
- `icon-192.png` & `icon-512.png` (Progressive web manifest icons)
- `site.webmanifest` (Web app manifest providing search engines and mobile devices with application metadata)

---

## 5. Schema.org Structured Data (JSON-LD)

Structured data is injected in valid JSON-LD format with HTML escaping to prevent XSS.

### A. Church / Organization Schema (`web/app/layout.tsx`)
Injected on every page for church knowledge graph ranking:
```json
{
  "@context": "https://schema.org",
  "@type": "Church",
  "name": "Glory Hills Community Church",
  "url": "https://gloryhillscommunitychurch.org",
  "logo": "https://gloryhillscommunitychurch.org/images/brand/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "3rd Floor, Tejumola House, Plot 24 Ogunnusi Road (beside CLAM)",
    "addressLocality": "Ojodu Berger",
    "addressRegion": "Lagos",
    "addressCountry": "NG"
  },
  "department": {
    "@type": "Church",
    "name": "Glory Hills Isheri Magodo",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "4 Ogun River Road",
      "addressLocality": "Isheri Magodo",
      "addressRegion": "Lagos",
      "addressCountry": "NG"
    }
  },
  "sameAs": [
    "https://www.youtube.com/@gloryhillscommunitychurch",
    "https://www.instagram.com/gloryhillchurch/",
    "https://www.youtube.com/@tobiomojowo",
    "https://www.instagram.com/tobiomojowo/",
    "https://www.facebook.com/Philip4christinme",
    "https://www.tiktok.com/@tobiomojowo"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday"],
      "opens": "08:00",
      "closes": "13:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Wednesday"],
      "opens": "18:00",
      "closes": "20:30"
    }
  ]
}
```

### B. Event Schema (`web/app/[page]/page.tsx` & `web/components/detail.tsx`)
Enables Google Event rich results for conferences and services:
- `@type`: `Event`
- `name`: Title of the gathering (e.g. Believer's Gathering (BEGAT), Acts 13:2)
- `startDate`: Scheduled start datetime in ISO 8601 format
- `location`: Church address or conference venue
- `organizer`: Glory Hills Community Church

### C. Sermon VideoObject Schema (`web/app/[page]/page.tsx` & `web/components/detail.tsx`)
Enables Google Video search indexing and rich video cards in search results:
- `@type`: `VideoObject`
- `name`: Sermon title
- `description`: Sermon overview
- `thumbnailUrl`: YouTube high-resolution thumbnail (`https://i.ytimg.com/vi/{ID}/hqdefault.jpg`)
- `uploadDate`: ISO 8601 published date
- `embedUrl`: `https://www.youtube-nocookie.com/embed/{ID}`
- `contentUrl`: Direct YouTube watch link

