import Detail from '@/components/detail';
import {published} from '@/lib/content';
import {meta} from '@/lib/seo';

export async function generateMetadata({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const row = (await published('events')).find((x) => x.slug === slug);
  return row
    ? meta(row.seo_title || row.title, row.seo_description || row.description, `/events/${slug}`, {
        ogTitle: row.data?.og_title,
        ogDescription: row.data?.og_description,
        image: row.data?.og_image || row.image_url,
        noindex: row.data?.noindex === 'true',
      })
    : {};
}

export default async function Page({params}: {params: Promise<{slug: string}>}) {
  return <Detail kind="events" slug={(await params).slug} />;
}
