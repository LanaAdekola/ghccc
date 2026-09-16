import type {MetadataRoute} from 'next';
import {published} from '@/lib/content';
import {origin} from '@/lib/seo';

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    '',
    '/about-us',
    '/leadership',
    '/sermons',
    '/events',
    '/give',
    '/visit-us',
    '/contact',
    '/prayer-request',
    '/plan-your-visit',
    '/cookies',
  ];

  const editorial = await published('pages');
  editorial
    .filter((x) => x.data?.noindex !== 'true')
    .forEach((x) => routes.push('/' + x.slug));

  const rows = await Promise.all(['sermons', 'events', 'gallery_albums'].map(published));
  rows.forEach((items, i) =>
    items
      .filter((x) => x.data?.noindex !== 'true')
      .forEach((x) => routes.push(`/${['sermons', 'events', 'gallery'][i]}/${x.slug}`))
  );

  return routes.map((x) => ({url: origin() + x}));
}
