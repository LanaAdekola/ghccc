import ContentImage from './content-image';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {published} from '@/lib/content';
import {jsonLd, origin} from '@/lib/seo';
import YouTubeEmbed from './youtube-embed';
import {getYouTubeId} from '@/lib/youtube';

export default async function Detail({kind, slug}: {kind: string; slug: string}) {
  const row = (await published(kind)).find((x) => x.slug === slug);
  if (!row) notFound();

  const images = kind === 'gallery_albums' ? (await published('gallery_images')).filter((x) => x.data.album_slug === slug) : [];
  const url = row.external_url?.startsWith('https://') ? row.external_url : null;
  const isYouTube = url ? Boolean(getYouTubeId(url)) : false;

  return (
    <main id="main">
      <header className="page-heading">
        <Link href={`/${kind === 'gallery_albums' ? 'gallery' : kind}`}>← Back to {kind.replace('_albums', '')}</Link>
        <h1>{row.title}</h1>
        <p className="lead">{row.description}</p>
      </header>
      <article className="content-section prose">
        {kind === 'sermons' && url && isYouTube ? (
          <div style={{marginBottom: '32px'}}>
            <YouTubeEmbed url={url} title={row.title} />
          </div>
        ) : (
          <ContentImage path={row.image_url} alt={row.image_alt} />
        )}
        <p>{row.body}</p>
        {images.map((x) => (
          <figure key={x.id}>
            <ContentImage path={x.image_url} alt={x.image_alt} />
            <figcaption>{x.description}</figcaption>
          </figure>
        ))}
        {row.starts_at && <p>{new Date(row.starts_at).toLocaleString('en-GB', {timeZone: 'Africa/Lagos'})} WAT</p>}
        {url && (
          <p style={{marginTop: '24px'}}>
            <a className="button" href={url} target="_blank" rel="noreferrer">
              {kind === 'sermons' ? 'Open on YouTube' : 'More information'}
            </a>
          </p>
        )}
        {kind === 'events' && (
          <p style={{marginTop: '16px'}}>
            <Link className="button small light event-register-button" data-action="event-register" href="/contact">
              Register interest
            </Link>
          </p>
        )}
        {kind === 'events' && row.starts_at && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd({
                '@context': 'https://schema.org',
                '@type': 'Event',
                name: row.title,
                description: row.description,
                startDate: row.starts_at,
                url: `${origin()}/events/${slug}`,
                location: {
                  '@type': 'Place',
                  name: row.data.venue || 'Glory Hills Community Church',
                  address: 'Ojodu Berger / Isheri Magodo, Lagos, Nigeria',
                },
                organizer: {
                  '@type': 'Organization',
                  name: 'Glory Hills Community Church',
                  url: origin(),
                },
              }),
            }}
          />
        )}
        {kind === 'sermons' && url && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: jsonLd({
                '@context': 'https://schema.org',
                '@type': 'VideoObject',
                name: row.title,
                description: row.description,
                thumbnailUrl: getYouTubeId(url)
                  ? `https://i.ytimg.com/vi/${getYouTubeId(url)}/hqdefault.jpg`
                  : `${origin()}/images/brand/default-social-share.jpg`,
                uploadDate: row.starts_at || row.published_at || '2026-01-01T00:00:00Z',
                embedUrl: getYouTubeId(url) ? `https://www.youtube-nocookie.com/embed/${getYouTubeId(url)}` : url,
                contentUrl: url,
              }),
            }}
          />
        )}
      </article>
    </main>
  );
}
