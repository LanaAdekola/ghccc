import type {Metadata} from 'next';
import {churchName} from './content';

export function origin() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export interface MetaOptions {
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  noindex?: boolean;
}

export function meta(title: string, description: string, path: string, options?: MetaOptions): Metadata {
  const rawImage=options?.image;
  const shareImage=rawImage ? (/^https:\/\//.test(rawImage)||rawImage.startsWith('/')?rawImage:`/api/media/${encodeURIComponent(rawImage)}`) : '/images/brand/default-social-share.jpg';
  const ogTitle = options?.ogTitle || `${title} | ${churchName}`;
  const ogDesc = options?.ogDescription || description;

  const metadata: Metadata = {
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

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
