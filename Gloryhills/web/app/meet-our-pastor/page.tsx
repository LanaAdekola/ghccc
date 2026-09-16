import Image from 'next/image';
import Link from 'next/link';
import {meta} from '@/lib/seo';
import YouTubeEmbed from '@/components/youtube-embed';
import {YouTubeIcon, InstagramIcon, TikTokIcon, FacebookIcon, SpotifyIcon} from '@/components/icons';

export const metadata = meta(
  'Meet Our Pastor — Pastor Tobi Omojowo',
  'Psalmist, pastor, missionary. Learn about the life and ministry of Pastor Tobi Omojowo, Lead Pastor of Glory Hills Community Church.',
  '/meet-our-pastor'
);

export default function MeetOurPastor() {
  return (
    <main id="main">
      {/* ── Hero ────────────────────────────────────── */}
      <section className="pastor-hero">
        <Image
          src="/images/pastor/hero.jpg"
          alt="Pastor Tobi Omojowo ministering at Kingdom Summit"
          fill
          priority
          sizes="100vw"
          style={{objectFit: 'cover', objectPosition: 'center 20%'}}
        />
        <div className="hero-shade" />
        <div className="pastor-hero-content">
          <p className="eyebrow">GLORY HILLS COMMUNITY CHURCH</p>
          <h1>Meet Our Pastor</h1>
          <p className="lead">Pastor Tobi Omojowo</p>
          <p>Psalmist · Pastor · Missionary</p>
        </div>
      </section>

      {/* ── Bio ─────────────────────────────────────── */}
      <section className="section pastor-bio">
        <div className="split">
          <div className="pastor-bio-image">
            <Image
              src="/images/pastor/bio.jpg"
              alt="Pastor Tobi Omojowo ministering at Kingdom Summit"
              width={768}
              height={512}
              style={{objectFit: 'cover', borderRadius: 'var(--radius)'}}
            />
          </div>
          <div>
            <p className="eyebrow">WHO IS PASTOR TOBI?</p>
            <h2>A life given to Christ and His kingdom.</h2>
            <p>
              Pastor Tobi Omojowo is a psalmist, pastor, missionary, and the Lead Pastor of Glory Hills Community Church,
              Lagos State, Nigeria.
            </p>
            <p>
              An itinerant preacher and passionate worshipper, his love and passion for God and His Kingdom has made him
              serve in different capacities over his many years of walking with the Lord — right before his days in the
              University, during, and even after.
            </p>
            <p>
              He has gone ahead to nurture and raise men through discipleship and has over the years, discipled a large
              number of young people across the nations of the earth who are committed and growing in faith to the glory of God.
            </p>
            <p>
              Pastor Tobi Omojowo is based in the city of Lagos from where he reaches the ends of the earth. He is happily
              married to his beloved wife, Iretayo Tobi-Omojowo, who also pastors with him in the ministry, and they are
              blessed with a lovely son.
            </p>
            <div style={{marginTop: '22px'}}>
              <p className="eyebrow" style={{marginBottom: '8px'}}>CONNECT WITH PASTOR TOBI</p>
              <div className="social-icons-row">
                <a href="https://www.youtube.com/@tobiomojowo" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube" title="YouTube">
                  <YouTubeIcon size={22} />
                </a>
                <a href="https://www.instagram.com/tobiomojowo/" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram" title="Instagram">
                  <InstagramIcon size={22} />
                </a>
                <a href="https://www.tiktok.com/@tobiomojowo" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="TikTok" title="TikTok">
                  <TikTokIcon size={20} />
                </a>
                <a href="https://www.facebook.com/Philip4christinme" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook" title="Facebook">
                  <FacebookIcon size={22} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────── */}
      <section className="pastor-stats">
        <div className="pastor-stats-grid">
          <div className="stat-item">
            <span className="stat-number">15+</span>
            <span className="stat-label">Years in Ministry</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">7,000+</span>
            <span className="stat-label">Songs Written</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3,000+</span>
            <span className="stat-label">Sermons Preached</span>
          </div>
        </div>
      </section>

      {/* ── The Psalmist Hub ────────────────────────── */}
      <section className="section pastor-section">
        <div className="split">
          <div>
            <p className="eyebrow">THE PSALMIST HUB</p>
            <h2>A heart of worship.</h2>
            <p>
              Pastor Tobi's life of worship has been popularized in recent times leveraging the social media space and has
              been a blessing to millions of lives across the globe. His soul-stirring hymns, prophetic songs, and heartfelt
              praise carry the presence of God into every atmosphere.
            </p>
            <p>
              The Psalmist Hub is a gathering of worshippers drawn together by a shared passion for the presence of God —
              a space where hearts are lifted, voices converge, and the Spirit of God moves freely.
            </p>
          </div>
          <div className="pastor-bio-image">
            <Image
              src="/images/pastor/psalmist-hub.jpg"
              alt="The Psalmist Hub — worship and prayer gathering"
              width={768}
              height={512}
              style={{objectFit: 'cover', borderRadius: 'var(--radius)'}}
            />
          </div>
        </div>
        <div className="pastor-media-grid" style={{marginTop: '48px'}}>
          <div>
            <h3>Listen — Agbara Wa (Let Power Come)</h3>
            <YouTubeEmbed url="https://www.youtube.com/watch?v=tZpDjtypfEw" title="Agbara Wa (Let Power Come) — Pastor Tobi Omojowo" />
          </div>
          <div>
            <h3>Listen — Olododo L&apos;oluwa (Live)</h3>
            <YouTubeEmbed url="https://www.youtube.com/watch?v=eEVGZPvwpZM" title="Olododo L'oluwa (Live) — Pastor Tobi Omojowo" />
          </div>
        </div>
        <div style={{marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
          <a
            className="button"
            href="https://www.youtube.com/@tobiomojowo"
            target="_blank"
            rel="noreferrer"
            style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
          >
            <YouTubeIcon size={18} />
            <span>YouTube</span>
          </a>
          <a
            className="button light"
            href="https://open.spotify.com/show/4OYlLXQq8Heh6fAkixCdVA"
            target="_blank"
            rel="noreferrer"
            style={{display: 'inline-flex', alignItems: 'center', gap: '8px'}}
          >
            <SpotifyIcon size={18} />
            <span>Spotify</span>
          </a>
        </div>
      </section>

      {/* ── Sermons & Teaching ──────────────────────── */}
      <section className="section pastor-section sermon-accent">
        <div className="split">
          <div className="pastor-bio-image">
            <Image
              src="/images/pastor/sermons.jpg"
              alt="Congregation listening to Pastor Tobi's sermon"
              width={768}
              height={512}
              style={{objectFit: 'cover', borderRadius: 'var(--radius)'}}
            />
          </div>
          <div>
            <p className="eyebrow">SERMONS & TEACHING</p>
            <h2>The Word that builds faith.</h2>
            <p>
              With a deep mandate to raise men through intentional discipleship, Pastor Tobi ministers across nations with
              signs following. His exposition of the scriptures — from the Book of Romans to the foundations of faith —
              continues to ground believers in the truth of God's Word.
            </p>
            <p>
              Listen to sermons from Sunday worship services, mid-week teachings, and special conferences.
            </p>
            <Link className="button" href="/sermons">
              Explore sermons
            </Link>
          </div>
        </div>
        <div style={{marginTop: '48px'}}>
          <h3>Latest Teaching — The Gospel of God</h3>
          <YouTubeEmbed url="https://youtu.be/l4_ji36Lisg" title="The Gospel of God — Pastor Tobi Omojowo" />
        </div>
      </section>

      {/* ── Ministry Image ──────────────────────────── */}
      <section className="section pastor-section">
        <div className="split">
          <div>
            <p className="eyebrow">MINISTRY IN ACTION</p>
            <h2>Going to the nations.</h2>
            <p>
              From village outreaches to university campuses, from Lagos Prayer Conferences to Believer's Gatherings
              across the nations — Pastor Tobi carries the gospel to wherever the Lord sends.
            </p>
            <Link className="button" href="/events">
              Upcoming gatherings
            </Link>
          </div>
          <div className="pastor-bio-image">
            <Image
              src="/images/pastor/teaching.jpg"
              alt="Pastor Tobi Omojowo ministering and praying over the congregation"
              width={768}
              height={1024}
              style={{objectFit: 'cover', borderRadius: 'var(--radius)'}}
            />
          </div>
        </div>
      </section>

      {/* ── Worship Image ───────────────────────────── */}
      <section className="pastor-worship-banner">
        <Image
          src="/images/pastor/worship.jpg"
          alt="Pastor Tobi Omojowo worshipping at Kingdom Summit"
          fill
          sizes="100vw"
          style={{objectFit: 'cover', objectPosition: 'center 30%'}}
        />
        <div className="hero-shade" />
        <div className="pastor-worship-content">
          <p className="eyebrow">A LIFE OF WORSHIP</p>
          <h2>
            His life of worship has been a blessing
            <br />
            to millions of lives across the globe.
          </h2>
        </div>
      </section>

      {/* ── Connect CTA ─────────────────────────────── */}
      <section className="section pastor-connect-cta">
        <p className="eyebrow">CONNECT WITH PASTOR TOBI</p>
        <h2>
          Follow the journey.
          <br />
          Be part of the story.
        </h2>
        <div className="social-icons-row" style={{justifyContent: 'center', marginBottom: '32px'}}>
          <a href="https://www.youtube.com/@tobiomojowo" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube" title="YouTube">
            <YouTubeIcon size={28} />
          </a>
          <a href="https://www.instagram.com/tobiomojowo/" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram" title="Instagram">
            <InstagramIcon size={28} />
          </a>
          <a href="https://www.tiktok.com/@tobiomojowo" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="TikTok" title="TikTok">
            <TikTokIcon size={24} />
          </a>
          <a href="https://www.facebook.com/Philip4christinme" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook" title="Facebook">
            <FacebookIcon size={28} />
          </a>
        </div>
        <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center'}}>
          <Link className="button" href="/contact">
            Get in touch
          </Link>
          <Link className="button light" href="/plan-your-visit">
            Plan your visit
          </Link>
        </div>
      </section>
    </main>
  );
}

