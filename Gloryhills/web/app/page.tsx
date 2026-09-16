import Image from 'next/image';
import Link from 'next/link';
import {mission, published} from '@/lib/content';
import {meta} from '@/lib/seo';
import YouTubeEmbed from '@/components/youtube-embed';
import {YouTubeIcon, InstagramIcon, TikTokIcon, FacebookIcon} from '@/components/icons';
import LocationMap from '@/components/location-map';

export const metadata = meta(
  'Welcome home',
  'A community committed to evangelizing the world and discipling the nations.',
  '/'
);

export default async function Home() {
  const [sermons, services, homepage, announcements, ministries, albums] = await Promise.all([
    published('sermons'),
    published('service_times'),
    published('homepage'),
    published('announcements'),
    published('ministries'),
    published('gallery_albums'),
  ]);

  const home = homepage[0];

  const sections: Record<string, React.ReactNode> = {
    lead_pastor: (
      <section className="section lead-pastor-section">
        <div className="split">
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
            <p className="eyebrow">MEET OUR LEAD PASTOR</p>
            <h2>Pastor Tobi Omojowo</h2>
            <p className="lead">Apostle · Prophet · Psalmist</p>
            <p>
              Pastor Tobi Omojowo is an Apostle and a Prophet who teaches God&apos;s Word with power, clarity and simplicity.
            </p>
            <p>
              He is also a Psalmist who has written tonnes of songs, blessing lives everywhere.
            </p>
            <p>
              He is also an author, itinerant preacher, a devoted missionary and the Lead Pastor of Glory Hills Community Church.
            </p>
            <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'}}>
              <Link className="button" href="/meet-our-pastor">
                Learn more about Pastor Tobi
              </Link>
              <a
                className="button light"
                href="https://wa.me/2348102858665?text=Hello%20Pastor%20Tobi%20Office%2C%20I%20would%20like%20to%20invite%20Pastor%20Tobi%20Omojowo%20to%20minister."
                target="_blank"
                rel="noreferrer"
              >
                Invite Pastor Tobi
              </a>
            </div>
            <div style={{marginTop: '22px'}}>
              <p className="eyebrow" style={{marginBottom: '8px'}}>CONNECT WITH PASTOR TOBI</p>
              <div className="social-icons-row">
                <a
                  href="https://www.youtube.com/@tobiomojowo"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  aria-label="Pastor Tobi Omojowo on YouTube"
                  title="YouTube"
                >
                  <YouTubeIcon size={22} />
                </a>
                <a
                  href="https://www.instagram.com/tobiomojowo/"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  aria-label="Pastor Tobi Omojowo on Instagram"
                  title="Instagram"
                >
                  <InstagramIcon size={22} />
                </a>
                <a
                  href="https://www.tiktok.com/@tobiomojowo"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  aria-label="Pastor Tobi Omojowo on TikTok"
                  title="TikTok"
                >
                  <TikTokIcon size={20} />
                </a>
                <a
                  href="https://www.facebook.com/Philip4christinme"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon-btn"
                  aria-label="Pastor Tobi Omojowo on Facebook"
                  title="Facebook"
                >
                  <FacebookIcon size={22} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    ),

    welcome: (
      <section className="section split">
        <div>
          <p className="eyebrow">WELCOME TO GLORY HILLS</p>
          <h2>
            A family of faith.
            <br />
            A life of purpose.
          </h2>
          <p className="lead">We are committed to evangelizing the world and discipling the nations.</p>
          <p>{home?.body || mission}</p>
          <Link className="text-link" href="/about-us">
            Get to know us
          </Link>
        </div>
        <div className="photo-frame">
          <Image
            src="/images/home/teenagers.png"
            alt="Members of the Glory Hills congregation during worship"
            width={783}
            height={645}
          />
          <span>ONE BODY. MANY STORIES.</span>
        </div>
      </section>
    ),

    sermon: (
      <section className="section sermon-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">GROW IN THE WORD</p>
            <h2>Faith comes by hearing.</h2>
          </div>
          <Link className="text-link" href="/sermons">
            Explore messages
          </Link>
        </div>
        <article className="feature-sermon">
          <div style={{width: '100%'}}>
            <YouTubeEmbed
              url={sermons[0]?.external_url || 'https://youtu.be/l4_ji36Lisg'}
              title={sermons[0]?.title || 'The Gospel of God'}
            />
          </div>
          <div>
            <p className="eyebrow">{sermons[0] ? 'FROM OUR SERMON LIBRARY' : 'FEATURED MESSAGE'}</p>
            <h3>{sermons[0]?.title || 'The Gospel of God'}</h3>
            <p>
              {sermons[0]?.description ||
                'A discussion of the trinitarian nature of God.'}
            </p>
            <Link className="button" href={sermons[0] ? `/sermons/${sermons[0].slug}` : '/sermons'}>
              Listen to more messages
            </Link>
          </div>
        </article>
      </section>
    ),

    announcements:
      announcements.length > 0 ? (
        <section className="section">
          <p className="eyebrow">CHURCH FAMILY UPDATES</p>
          <div className="cards">
            {announcements.map((x) => (
              <article className="card" key={x.id}>
                <h2>{x.title}</h2>
                <p>{x.description}</p>
                <p>{x.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null,

    ministries:
      ministries.length > 0 ? (
        <section className="section">
          <h2>Grow and serve.</h2>
          <p>Find your community in the life of the church.</p>
          <Link className="button" href="/ministries">
            Explore ministries
          </Link>
        </section>
      ) : null,

    gallery:
      albums.length > 0 ? (
        <section className="section">
          <h2>Life in our church family.</h2>
          <Link className="button" href="/gallery">
            View Sunday pictures
          </Link>
        </section>
      ) : null,

    visit: (
      <section className="section visit-callout">
        <p className="eyebrow">LOCATE US · YOU ARE WELCOME HERE</p>
        <h2>
          Let’s walk this
          <br />
          journey together.
        </h2>
        <div style={{maxWidth: '960px', margin: '36px auto 32px', textAlign: 'left'}}>
          <LocationMap />
        </div>
        <Link className="button" href="/plan-your-visit">
          Plan your visit
        </Link>
      </section>
    ),

    giving: (
      <section className="giving-strip">
        <div>
          <p className="eyebrow">A GENEROUS HEART</p>
          <h2>Give with purpose.</h2>
        </div>
        <Link className="button light" href="/give">
          Ways to give
        </Link>
      </section>
    ),
  };

  const configuredOrder =
    home?.data.section_order
      ?.split(',')
      .map((x) => x.trim())
      .filter((x) => x in sections) || [];

  const defaultOrder = ['lead_pastor', 'welcome', 'sermon', 'visit', 'giving'];
  const order = [...new Set([...configuredOrder, ...defaultOrder, ...Object.keys(sections)])];

  return (
    <main id="main">
      <section className="hero">
        <div className="hero-media">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/home/hero-mobile-poster.jpg"
            aria-hidden="true"
          >
            <source src="/images/home/hero-mobile.mp4" type="video/mp4" />
          </video>
          <Image
            className="hero-image"
            src="/images/home/main-bg.png"
            alt={home?.image_alt || 'Glory Hills Community Church worship gathering'}
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">A PEOPLE. A PURPOSE. A LIFE IN CHRIST.</p>
          <h1>
            {home?.title || (
              <>
                Know Him.
                <br />
                Make Him known.
              </>
            )}
          </h1>
          <p>
            {home?.description || (
              <>
                Evangelizing the world.
                <br className="mobile-break" /> Discipling the nations.
              </>
            )}
          </p>
          <div className="actions">
            <Link className="button" href="/sermons">
              Listen
            </Link>
            <Link className="button light" href="/give">
              Give
            </Link>
          </div>
        </div>
        <div className="hero-foot">
          <span>GLORY HILLS COMMUNITY CHURCH</span>
          <span>SCROLL TO DISCOVER ↓</span>
        </div>
      </section>

      <section className="service-strip">
        <div className="service-strip-content">
          <span className="eyebrow">LET’S GATHER</span>
          <p>{services[0]?.description || 'Sunday 8 AM · Wednesday 6 PM · Friday 6 PM · Ojodu Berger HQ'}</p>
        </div>
        <Link href="/visit-us">Service information</Link>
      </section>

      {order.map((key) => (
        <div key={key}>{sections[key]}</div>
      ))}
    </main>
  );
}
