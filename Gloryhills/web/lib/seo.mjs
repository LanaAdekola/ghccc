const churchName = 'Glory Hills Community Church';

export function origin() {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production') {
    if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
      return configured;
    }
    return 'https://www.ghccglobal.com';
  }
  return configured || 'http://localhost:3000';
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
