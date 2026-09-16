import Link from 'next/link';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {meta, jsonLd, origin} from '@/lib/seo';
import {mission, published, settings} from '@/lib/content';
import about from '@/lib/content/legacy-about.json';
import PublicForm from '@/components/public-form';
import CopyAccount from '@/components/copy-account';
import Consent from '@/components/consent';
import YouTubeEmbed from '@/components/youtube-embed';
import {getYouTubeId} from '@/lib/youtube';
import {YouTubeIcon, InstagramIcon, TikTokIcon, FacebookIcon, SpotifyIcon} from '@/components/icons';
import LocationMap from '@/components/location-map';

const heroImages: Record<string, string> = {
  'about-us': '/images/heroes/h1.jpg',
  leadership: '/images/heroes/h1.jpg',
  sermons: '/images/heroes/h2.jpg',
  events: '/images/heroes/h3.jpg',
  'visit-us': '/images/heroes/h4.jpg',
  'plan-your-visit': '/images/heroes/h4.jpg',
  give: '/images/heroes/h5.jpg',
  contact: '/images/heroes/h1.jpg',
  'prayer-request': '/images/heroes/h3.jpg',
  ministries: '/images/heroes/h2.jpg',
  gallery: '/images/heroes/h5.jpg',
  cookies: '/images/heroes/h1.jpg',
};

const pages: Record<string, [string, string]> = {
  'about-us': ['Our story. His purpose.', 'A community committed to making disciples and building up the body of Christ.'],
  leadership: ['Our Leadership', 'Serving the church through teaching, discipleship and worship.'],
  sermons: ['A word for your walk.', 'Listen, reflect and grow in the knowledge of Christ.'],
  events: ['Life together.', 'Gatherings, services and opportunities to grow in faith.'],
  give: ['A generous heart.', 'Support the life and ministry of Glory Hills Community Church.'],
  'visit-us': ['There is a place for you.', 'We look forward to worshipping with you.'],
  contact: ['Let’s connect.', 'Get in touch with the church team.'],
  'prayer-request': ['You do not walk alone.', 'Share a prayer request with our pastoral team.'],
  'plan-your-visit': ['Your first Sunday starts here.', 'Let us know you are coming.'],
  cookies: ['Cookie preferences', 'Choose whether to allow optional analytics.'],
  ministries: ['Find your community.', 'Ways to grow and serve together.'],
  gallery: ['Our life in pictures.', 'Moments from our church family.'],
};

const defaultArchiveSermons: [string, string, string][] = [
  [
    'The Gospel of God',
    'https://youtu.be/l4_ji36Lisg',
    'A discussion of the trinitarian nature of God by Pastor Tobi Omojowo.',
  ],
  [
    'One Lord, One Faith, One Baptism',
    'https://www.youtube.com/watch?v=xTEio7mLZ8c',
    'Understanding unity in the Body of Christ and growing into spiritual maturity through the Word by Pastor Tobi Omojowo.',
  ],
  [
    'Dominion Summit (Subdue The Earth)',
    'https://www.youtube.com/watch?v=HsIlFfsRt4c',
    'Exercising kingdom authority and walking in divine dominion by Prophet Ayo Jeje.',
  ],
  [
    'Faith Series (Part 9)',
    'https://www.youtube.com/watch?v=0lVoeZf9FFQ&t=3776s',
    'Deep biblical exposition on faith, spiritual growth, and victory by Pastor Seyi Adefemi.',
  ],
  [
    'The Book of Romans (Chapter 15)',
    'https://www.youtube.com/watch?v=srj86o_9PBU&t=4s',
    'Discipleship exposition and spiritual alignment from the Book of Romans by Pastor Tobi Omojowo.',
  ],
];

const defaultUpcomingEvents: [string, string, string, string][] = [
  [
    'Acts 13:2',
    'Every Last Saturday of the Month',
    'A monthly prayer meeting taking place at the Church Auditorium, waiting upon the Lord in fasting and prayer.',
    '/images/events/acts13-2.png',
  ],
  [
    'Believer’s Gathering (BEGAT)',
    'Annual Conference in December',
    'Interdenominational conference gathering believers from all walks of life for spiritual renewal and revival.',
    '/images/events/begat.png',
  ],
  [
    'Teenagers Conference',
    'Coming August',
    'Inspiring messages, dynamic worship, workshops, and spiritual grounding for young people and teens.',
    '/images/events/teenagers.png',
  ],
  [
    'Lagos Prayer Conference',
    'Coming June',
    'A powerful gathering of believers seeking spiritual awakening and kingdom impact across Lagos State.',
    '/images/home/hero-section.png',
  ],
  [
    'Village Outreach',
    'Quarterly',
    'Sharing the gospel of Christ, medical care, and essential supplies in rural communities.',
    '/images/about/envagelism.png',
  ],
  [
    'University Outreach',
    'Weekly',
    'Weekly campus fellowships and student gatherings to study the scriptures and pray together.',
    '/images/home/community.png',
  ],
];

export async function generateMetadata({params}: {params: Promise<{page: string}>}) {
  const {page} = await params;
  const p = pages[page];
  const editorial = (await published('pages')).find((x) => x.slug === page);
  return editorial
    ? meta(editorial.seo_title || editorial.title, editorial.seo_description || editorial.description, `/${page}`, {
        ogTitle: editorial.data?.og_title,
        ogDescription: editorial.data?.og_description,
        image: editorial.data?.og_image || editorial.image_url,
        noindex: editorial.data?.noindex === 'true',
      })
    : p
    ? meta(p[0], p[1], `/${page}`)
    : {};
}

export default async function Page({params}: {params: Promise<{page: string}>}) {
  const {page} = await params;
  const p = pages[page];

  if (!p) {
    const editorial = (await published('pages')).find((x) => x.slug === page);
    if (!editorial) notFound();
    return (
      <main id="main">
        <header className="page-hero">
          <div className="page-hero-media">
            <Image
              src={heroImages[page] || '/images/heroes/h1.jpg'}
              alt=""
              fill
              priority
              sizes="100vw"
              style={{objectFit: 'cover', objectPosition: 'center'}}
            />
            <div className="hero-shade" />
          </div>
          <div className="page-hero-content">
            <p className="eyebrow">GLORY HILLS COMMUNITY CHURCH</p>
            <h1>{editorial.title}</h1>
            {editorial.description && <p className="lead">{editorial.description}</p>}
          </div>
        </header>
        <article className="content-section prose">
          <p>{editorial.body}</p>
        </article>
      </main>
    );
  }

  const [rows, s] = await Promise.all([published(page === 'gallery' ? 'gallery_albums' : page), settings()]);

  if (['ministries', 'gallery'].includes(page) && !rows.length) notFound();

  return (
    <main id="main">
      <header className="page-hero">
        <div className="page-hero-media">
          <Image
            src={heroImages[page] || '/images/heroes/h1.jpg'}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{objectFit: 'cover', objectPosition: 'center'}}
          />
          <div className="hero-shade" />
        </div>
        <div className="page-hero-content">
          <p className="eyebrow">GLORY HILLS COMMUNITY CHURCH</p>
          <h1>{p[0]}</h1>
          <p className="lead">{p[1]}</p>
        </div>
      </header>

      <section className="content-section">
        {page === 'about-us' && (
          <div className="prose">
            <h2>Our mission</h2>
            <p>{mission}</p>
            <div style={{margin: '30px 0'}}>
              <Image
                src="/images/about/envagelism.png"
                alt="Glory Hills evangelism and community outreach"
                width={1420}
                height={828}
                style={{borderRadius: 'var(--radius)'}}
              />
            </div>
            <h2>Our vision</h2>
            <p>Evangelizing the world, discipling the nations.</p>
            <p>{about.vision_grid.content[0].body[2]}</p>
            <p>Matthew 28:17–20</p>
            <div style={{marginTop: '30px'}}>
              <Link className="button" href="/meet-our-pastor">
                Meet our lead pastor
              </Link>
            </div>
          </div>
        )}

        {page === 'leadership' && (
          <article className="split">
            <div className="pastor-photo-frame">
              <Image
                src="/images/leadership/lead-pastor.png"
                alt="Pastor Tobi Omojowo, Lead Pastor of Glory Hills Community Church"
                width={768}
                height={511}
                style={{objectFit: 'cover'}}
              />
              <span>LEAD PASTOR · GLORY HILLS</span>
            </div>
            <div>
              <p className="eyebrow">LEAD PASTOR</p>
              <h2>Pastor Tobi Omojowo</h2>
              {about.lead_pastor.content[0].body.map((b: string, i: number) => (
                <p key={i}>{b}</p>
              ))}
              <div style={{marginTop: '24px'}}>
                <p className="eyebrow" style={{marginBottom: '12px'}}>CONNECT WITH PASTOR TOBI</p>
                <div className="channel-links" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                  <a
                    href="https://www.youtube.com/@tobiomojowo"
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon-btn"
                    aria-label="Pastor Tobi Omojowo on YouTube"
                    title="YouTube"
                  >
                    <YouTubeIcon size={18} />
                  </a>
                  <a
                    href="https://www.instagram.com/tobiomojowo/"
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon-btn"
                    aria-label="Pastor Tobi Omojowo on Instagram"
                    title="Instagram"
                  >
                    <InstagramIcon size={18} />
                  </a>
                  <a
                    href="https://www.tiktok.com/@tobiomojowo"
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon-btn"
                    aria-label="Pastor Tobi Omojowo on TikTok"
                    title="TikTok"
                  >
                    <TikTokIcon size={18} />
                  </a>
                  <a
                    href="https://www.facebook.com/Philip4christinme"
                    target="_blank"
                    rel="noreferrer"
                    className="social-icon-btn"
                    aria-label="Pastor Tobi Omojowo on Facebook"
                    title="Facebook"
                  >
                    <FacebookIcon size={18} />
                  </a>
                </div>
              </div>
            </div>
          </article>
        )}

        {page === 'sermons' && (
          <>
            <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '30px', alignItems: 'center'}}>
              <a
                className="button"
                href="https://www.youtube.com/@gloryhillscommunitychurch"
                target="_blank"
                rel="noreferrer"
                style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
              >
                <YouTubeIcon size={18} />
                <span>YouTube</span>
              </a>
              <a
                className="button light"
                href={s.spotify}
                target="_blank"
                rel="noreferrer"
                style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
              >
                <SpotifyIcon size={18} />
                <span>Spotify</span>
              </a>
            </div>

            {rows.length > 0 ? (
              <div className="cards">
                {rows.map((x) => (
                  <article className="card" key={x.id}>
                    {x.external_url && getYouTubeId(x.external_url) ? (
                      <div style={{marginBottom: '16px'}}>
                        <YouTubeEmbed url={x.external_url} title={x.title} />
                      </div>
                    ) : null}
                    <h2>
                      <Link href={`/sermons/${x.slug}`}>{x.title}</Link>
                    </h2>
                    <p>{x.description}</p>
                    <Link className="text-link" href={`/sermons/${x.slug}`}>
                      Listen
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <>
                <div className="notice">
                  Our sermon library is being restored. You can stream messages directly below or visit our official channels.
                </div>
                <div className="cards">
                  {defaultArchiveSermons.map(([title, url, desc]) => (
                    <article className="card sermon-card" key={url}>
                      <div style={{marginBottom: '16px'}}>
                        <YouTubeEmbed url={url} title={title} />
                      </div>
                      <p className="eyebrow">YOUTUBE ARCHIVE</p>
                      <h2>{title}</h2>
                      <p>{desc}</p>
                      <a className="text-link" href={url} target="_blank" rel="noreferrer">
                        Watch directly on YouTube
                      </a>
                    </article>
                  ))}
                </div>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: jsonLd({
                      '@context': 'https://schema.org',
                      '@type': 'ItemList',
                      itemListElement: defaultArchiveSermons.map(([title, url, desc], index) => ({
                        '@type': 'VideoObject',
                        position: index + 1,
                        name: title,
                        description: desc,
                        thumbnailUrl: `https://i.ytimg.com/vi/${getYouTubeId(url)}/hqdefault.jpg`,
                        uploadDate: '2026-01-01T00:00:00Z',
                        embedUrl: `https://www.youtube-nocookie.com/embed/${getYouTubeId(url)}`,
                        contentUrl: url,
                      })),
                    }),
                  }}
                />
              </>
            )}
          </>
        )}

        {page === 'events' && (
          <>
            {rows.filter((x) => x.starts_at && new Date(x.starts_at) > new Date()).length > 0 ? (
              <div className="cards">
                {rows
                  .filter((x) => x.starts_at && new Date(x.starts_at) > new Date())
                  .map((x) => (
                    <article className="card" key={x.id}>
                      <h2>
                        <Link href={`/events/${x.slug}`}>{x.title}</Link>
                      </h2>
                      <p>{new Date(x.starts_at!).toLocaleString('en-GB', {timeZone: 'Africa/Lagos'})} WAT</p>
                      <p>{x.description}</p>
                      <Link
                        className="button small light event-register-button"
                        data-action="event-register"
                        href="/contact"
                      >
                        Register interest
                      </Link>
                    </article>
                  ))}
              </div>
            ) : (
              <>
                <div className="cards">
                  {defaultUpcomingEvents.map(([title, time, desc, img]) => (
                    <article className="card" key={title}>
                      <div style={{marginBottom: '16px', borderRadius: 'var(--radius)', overflow: 'hidden'}}>
                        <Image src={img} alt={title} width={780} height={450} style={{objectFit: 'cover', width: '100%', height: 'auto'}} />
                      </div>
                      <p className="eyebrow">UPCOMING GATHERING</p>
                      <h2>{title}</h2>
                      <p>
                        <strong>{time}</strong>
                      </p>
                      <p>{desc}</p>
                      <Link
                        className="button small light event-register-button"
                        data-action="event-register"
                        href="/contact"
                        style={{marginTop: '12px'}}
                      >
                        Register interest
                      </Link>
                    </article>
                  ))}
                </div>
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: jsonLd({
                      '@context': 'https://schema.org',
                      '@type': 'ItemList',
                      itemListElement: defaultUpcomingEvents.map(([title, time, desc], index) => ({
                        '@type': 'Event',
                        position: index + 1,
                        name: title,
                        description: desc,
                        startDate: '2026-10-01T08:00:00+01:00',
                        location: {
                          '@type': 'Place',
                          name: 'Glory Hills Community Church',
                          address: '3rd Floor, Tejumola House, Ojodu Berger, Lagos',
                        },
                      })),
                    }),
                  }}
                />
              </>
            )}
          </>
        )}

        {page === 'give' && (
          <>
            <div className="prose">
              <h2>Giving is an expression of faith.</h2>
              <p>
                Thank you for your heart to support the work of the church. Choose a church-approved giving method below.
              </p>
            </div>
            <Giving />
            <Campaigns />
            <div className="prose">
              <h2>Giving with confidence</h2>
              <details>
                <summary>How can I confirm the account details?</summary>
                <p>
                  Use only giving details published here by the church (Zenith Bank · 1229943495 · Glory Hills Community
                  Church). Contact the church team if you are unsure.
                </p>
              </details>
              <details>
                <summary>Can I give in foreign currency (USD / GBP / EUR)?</summary>
                <p>Domiciliary account details are available on request from church administration.</p>
              </details>
              <details>
                <summary>Can I give online?</summary>
                <p>
                  Online electronic transfers and card payments can be coordinated through church administration. We never ask for your card PIN through this website.
                </p>
              </details>
              <p>
                <Link href="/contact">Contact us for giving assistance</Link>
              </p>
            </div>
          </>
        )}

        {page === 'visit-us' && (
          <>
            <Services />
            <div className="prose">
              <p className="eyebrow" style={{marginBottom: '6px'}}>LOCATE US</p>
              <h2>Where We Gather</h2>
            </div>
            <LocationMap headquarters={s.headquarters} isheri={s.isheri} />
            <div className="prose" style={{marginTop: '36px'}}>
              <p>
                <Link className="button light" href="/plan-your-visit">
                  Let us know you are coming
                </Link>
              </p>
            </div>
          </>
        )}

        {['contact', 'prayer-request', 'plan-your-visit'].includes(page) && (
          <>
            <div className="notice">
              {s.phone ? (
                <a href={`tel:${s.phone.replace(/[^+0-9]/g, '')}`}>{s.phone}</a>
              ) : (
                'The church’s contact information is being confirmed.'
              )}
              {s.email && (
                <p>
                  <a href={`mailto:${s.email}`}>{s.email}</a>
                </p>
              )}
            </div>
            <PublicForm kind={page} />
            {page === 'contact' && (
              <div
                style={{
                  marginTop: '60px',
                  paddingTop: '40px',
                  borderTop: '1px solid var(--border)',
                  maxWidth: '650px',
                }}
              >
                <h2>Stay connected with church updates</h2>
                <p style={{marginBottom: '20px'}}>
                  Subscribe to receive sermon alerts, event announcements, and spiritual reflections.
                </p>
                <PublicForm kind="newsletter" />
              </div>
            )}
          </>
        )}

        {page === 'cookies' && (
          <div className="prose">
            <p>
              Essential administrator session cookies are used only when administrators sign in. Optional marketing tags stay
              off until you choose to allow analytics. You can change your choice here.
            </p>
            <Consent />
          </div>
        )}

        {['ministries', 'gallery'].includes(page) &&
          (rows.length ? (
            <div className="cards">
              {rows.map((x) => (
                <article className="card" key={x.id}>
                  <h2>{page === 'gallery' ? <Link href={`/gallery/${x.slug}`}>{x.title}</Link> : x.title}</h2>
                  <p>{x.description}</p>
                  <p>{x.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="notice">
              This collection is being restored. <Link href="/contact">Contact the church for information.</Link>
            </div>
          ))}
      </section>
    </main>
  );
}

async function Services() {
  const rows = await published('service_times');
  return rows.length ? (
    <div className="cards">
      {rows.map((x) => (
        <article className="card" key={x.id}>
          <h2>{x.title}</h2>
          <p>{x.description}</p>
        </article>
      ))}
    </div>
  ) : (
    <div className="service-cards-grid">
      <article className="service-image-card">
        <img className="service-card-img" src="/images/services/sunday.jpg" alt="Sunday Worship Service at Glory Hills" />
        <div className="service-card-body">
          <h3>Sunday Worship Service</h3>
          <p className="service-time">8:00 AM – 1:00 PM (WAT)</p>
          <p>Ojodu Berger Headquarters &amp; Isheri Magodo</p>
        </div>
      </article>
      <article className="service-image-card">
        <img className="service-card-img" src="/images/services/wednesday.jpg" alt="Wednesday Prayer Meeting at Glory Hills" />
        <div className="service-card-body">
          <h3>Wednesday Prayer Meeting</h3>
          <p className="service-time">6:00 PM – 8:30 PM (WAT)</p>
          <p>Ojodu Berger Headquarters</p>
        </div>
      </article>
      <article className="service-image-card">
        <img className="service-card-img" src="/images/services/friday.jpg" alt="Friday Disciple's Hub at Glory Hills" />
        <div className="service-card-body">
          <h3>Friday Disciple&apos;s Hub</h3>
          <p className="service-time">6:00 PM – 8:00 PM (WAT)</p>
          <p>Ojodu Berger Headquarters</p>
        </div>
      </article>
    </div>
  );
}

async function Giving() {
  const rows = await published('giving_methods');
  return rows.length ? (
    <div className="cards">
      {rows.map((x) => (
        <article className="card giving-method-card" key={x.id} data-giving-method={x.title}>
          <p className="eyebrow">{x.data.currency}</p>
          <h2>{x.title}</h2>
          <p>
            {x.data.bank_name}
            <br />
            {x.data.account_name}
          </p>
          <p>{x.data.account_number}</p>
          {x.data.swift && <p>SWIFT: {x.data.swift}</p>}
          <CopyAccount account={x.data.account_number} category={x.title} />
        </article>
      ))}
    </div>
  ) : (
    <div className="cards">
      <article className="card giving-method-card" data-giving-method="Zenith Bank">
        <p className="eyebrow">NGN · NAIRA</p>
        <h2>Zenith Bank</h2>
        <p>
          Zenith Bank
          <br />
          Glory Hills Community Church
        </p>
        <p style={{fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.05em'}}>1229943495</p>
        <CopyAccount account="1229943495" category="Zenith Bank" />
      </article>
      <article className="card giving-method-card" data-giving-method="Domiciliary Account">
        <p className="eyebrow">DOMICILIARY</p>
        <h2>Domiciliary Account</h2>
        <p>USD · GBP · EUR</p>
        <p>Available on request. Please contact the church office for international wire routing details.</p>
        <Link className="button small" href="/contact">
          Contact Church Office
        </Link>
      </article>
      <article className="card giving-method-card" data-giving-method="Online Transfer">
        <p className="eyebrow">ONLINE GIVING</p>
        <h2>Electronic Transfer</h2>
        <p>Fast, direct electronic transfer through your bank mobile app or internet banking platform.</p>
        <Link className="button small light" href="/give" data-action="online-giving-start">
          Online Giving Details
        </Link>
      </article>
    </div>
  );
}

async function Campaigns() {
  const rows = await published('giving_campaigns');
  return rows.length ? (
    <section>
      <h2>Projects and missions</h2>
      <div className="cards">
        {rows.map((x) => (
          <article className="card" key={x.id}>
            <h3>{x.title}</h3>
            <p>{x.description}</p>
            <p>{x.body}</p>
          </article>
        ))}
      </div>
    </section>
  ) : null;
}
