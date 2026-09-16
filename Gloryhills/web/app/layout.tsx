import localFont from 'next/font/local';
import type {Metadata} from 'next';
import Link from 'next/link';
import Navigation from '@/components/navigation';
import {churchName, settings, published} from '@/lib/content';
import {origin, jsonLd} from '@/lib/seo';
import './globals.css';
import Analytics from '@/components/analytics';
import ConsentBanner from '@/components/consent-banner';

const display = localFont({src: '../public/fonts/display.woff2', variable: '--display', display: 'swap'});
const body = localFont({
  src: [
    {path: '../public/fonts/body.woff2', weight: '400'},
    {path: '../public/fonts/body-bold.woff2', weight: '700'},
  ],
  variable: '--body',
  display: 'swap',
});

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = (await published('seo'))[0];
  const gscVerification =
    process.env.GOOGLE_SEARCH_CONSOLE_VERIFICATION ||
    process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_VERIFICATION;

  const base: Metadata = {
    metadataBase: new URL(origin()),
    title: {default: churchName, template: `%s | ${churchName}`},
    description: 'Evangelizing the world, discipling the nations.',
    robots: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://')
      ? {index: true, follow: true}
      : {index: false, follow: false},
    manifest: '/site.webmanifest',
    icons: {
      icon: [{url: '/favicon.ico'}, {url: '/favicon-32x32.png', sizes: '32x32'}],
      apple: '/apple-touch-icon.png',
    },
    verification: gscVerification ? {google: gscVerification} : undefined,
  };

  return {
    ...base,
    title: {default: config?.data.default_title || churchName, template: config?.data.title_template || `%s | ${churchName}`},
    description: config?.description || base.description,
  };
}

export default async function Layout({children}: {children: React.ReactNode}) {
  const s = await settings();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const isGtmValid = gtmId && /^GTM-[A-Z0-9]+$/.test(gtmId);

  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        {isGtmValid && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{display: 'none', visibility: 'hidden'}}
            />
          </noscript>
        )}
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Navigation />
        {children}
        <Analytics />
        <ConsentBanner />
        <footer>
          <div className="footer-grid">
            <div>
              <p className="eyebrow">GLORY HILLS COMMUNITY CHURCH</p>
              <h2>
                Rooted in Christ.
                <br />
                Growing together.
              </h2>
            </div>
            <div>
              <h3>Come as you are</h3>
              <p>{s.headquarters}</p>
              <p>Also in Isheri Magodo</p>
              <Link href="/visit-us">Explore our locations ↗</Link>
            </div>
            <div>
              <h3>Stay connected</h3>
              <Link href="/contact">Contact us</Link>
              <Link href="/prayer-request">Prayer request</Link>
              <Link href="/leadership">Our pastors</Link>
              <a href="https://www.youtube.com/@gloryhillscommunitychurch" target="_blank" rel="noreferrer">
                YouTube channel ↗
              </a>
              <a href="https://www.instagram.com/gloryhillchurch/" target="_blank" rel="noreferrer">
                Instagram ↗
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {churchName}</span>
            <Link href="/cookies">Cookie preferences</Link>
          </div>
        </footer>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              '@context': 'https://schema.org',
              '@type': 'Church',
              name: s.organization_name || churchName,
              url: origin(),
              logo: `${origin()}/images/brand/logo.png`,
              image: `${origin()}/images/home/hero-desktop.webp`,
              description: 'A Christian community committed to evangelizing the world and discipling the nations.',
              address: {
                '@type': 'PostalAddress',
                streetAddress:
                  s.headquarters ||
                  '3rd Floor of Tejumola House, Plot 24 Ogunnusi Road (beside CLAM) in Ojodu Berger, Lagos',
                addressLocality: 'Ojodu Berger',
                addressRegion: 'Lagos',
                addressCountry: 'NG',
              },
              department: {
                '@type': 'Church',
                name: 'Glory Hills Isheri Magodo',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: s.isheri || '6 Ogun River Road, Isheri-Magodo, Lagos',
                  addressLocality: 'Isheri Magodo',
                  addressRegion: 'Lagos',
                  addressCountry: 'NG',
                },
              },
              sameAs: [
                'https://www.youtube.com/@gloryhillscommunitychurch',
                'https://www.instagram.com/gloryhillchurch/',
                'https://www.youtube.com/@tobiomojowo',
                'https://www.instagram.com/tobiomojowo/',
                'https://www.facebook.com/Philip4christinme',
                'https://www.tiktok.com/@tobiomojowo',
                s.spotify,
              ].filter(Boolean),
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Sunday'],
                  opens: '08:00',
                  closes: '13:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Wednesday'],
                  opens: '18:00',
                  closes: '20:30',
                },
              ],
              ...(s.phone ? {telephone: s.phone} : {}),
              ...(s.email ? {email: s.email} : {}),
            }),
          }}
        />
      </body>
    </html>
  );
}
