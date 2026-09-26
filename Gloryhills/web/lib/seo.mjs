const churchName = 'Glory Hills Community Church';

export function origin() {
  if (process.env.NODE_ENV === 'production') return 'https://www.ghccglobal.com';
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return 'http://localhost:3000';
  const url = new URL(configured);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid site origin.');
  return url.origin;
}

export function meta(title, description, path, options) {
  const rawImage = options?.image;
  const shareImage = rawImage
    ? (/^https:\/\//.test(rawImage) || rawImage.startsWith('/')
        ? rawImage
        : `/api/media/${encodeURIComponent(rawImage)}`)
    : '/images/brand/default-social-share.jpg';
  const ogTitle = options?.ogTitle || `${title} | ${churchName}`;
  const ogDesc = options?.ogDescription || description;

  const metadata = {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: path,
      type: 'website',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [shareImage],
    },
  };

  if (options?.noindex) {
    metadata.robots = {
      index: false,
      follow: true,
    };
  }

  return metadata;
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
