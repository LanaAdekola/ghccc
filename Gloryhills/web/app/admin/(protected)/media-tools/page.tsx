import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';
import {origin} from '@/lib/seo';
import {normalizeMarketing} from '@/lib/marketing';

export default async function MediaTools() {
  const {db,role}=await requireAdmin('marketing_admin');
  const {data}=await db.from('content').select('data').eq('kind','settings').eq('slug','marketing').maybeSingle();
  const settings=normalizeMarketing(data?.data||{});
  const gtmId=settings.gtm_id;
  const siteUrl = origin();
  const isGtmValid = Boolean(settings.gtm_enabled==='true' && gtmId);

  const tools = [
    {
      name: 'Google Tag Manager',
      url: 'https://tagmanager.google.com/',
      badge: 'Single Tag Management Layer',
      purpose: 'Manage all tracking pixels, conversion tags, GA4 triggers, and Google Ads conversions in one approved place without touching code.',
      permission: 'Container Edit, Approve, and Publish (Invited by Church Administrator)',
      icon: '🏷️',
    },
    {
      name: 'Google Analytics 4',
      url: 'https://analytics.google.com/',
      badge: 'Audience & Engagement',
      purpose: 'View live website traffic, sermons listened to, event registration views, and engagement reports without seeing personal data.',
      permission: 'Marketer (initially) or Editor role on church GA4 property',
      icon: '📊',
    },
    {
      name: 'Google Ads',
      url: 'https://ads.google.com/',
      badge: 'Campaigns & Ad Grants',
      purpose: 'Manage Google Church Ad Grants or local outreach campaigns. Your media specialist must configure and verify conversion tags in GTM.',
      permission: 'Standard User access on church Google Ads account',
      icon: '🎯',
    },
    {
      name: 'Google Search Console',
      url: 'https://search.google.com/search-console',
      badge: 'Search Indexing & Health',
      purpose: 'Monitor Google indexing status of church pages, inspect search queries bringing visitors, and submit sitemaps.',
      permission: 'Full User (not Owner) on church property domain',
      icon: '🔍',
    },
    {
      name: 'Meta Business Manager',
      url: 'https://business.facebook.com/',
      badge: 'Instagram & Facebook Ads',
      purpose: 'Manage Facebook/Instagram church page posts, campaigns, and approved Pixel measurement through GTM. Server-side Conversions API is not implemented.',
      permission: 'Employee access with required Page & Ad Account assets',
      icon: '📱',
    },
    {
      name: 'Website SEO Manager',
      url: '/admin?kind=pages',
      badge: 'Internal CMS Controls',
      purpose: 'Edit SEO titles, meta descriptions, and social sharing images for all church pages, sermons, and upcoming gatherings.',
      permission: 'Included in your Media Editor CMS role',
      icon: '🌐',
      isInternal: true,
    },
    {
      name: 'Tracking Event Dictionary',
      url: '/admin/guide/TRACKING_EVENT_DICTIONARY',
      badge: 'Reference Documentation',
      purpose: 'View the complete catalog of implemented events, reserved events and outstanding destination verification.',
      permission: 'Public reference doc in codebase /docs',
      icon: '📖',
      isInternal: true,
    },
    {
      name: 'Post-Launch Verification Guide',
      url: '/admin/guide/POST_LAUNCH_VERIFICATION',
      badge: 'Testing Protocol',
      purpose: 'Step-by-step checklist to test Tag Assistant, test conversions, verify WCAG accessibility, and confirm zero PII transmission.',
      permission: 'Public reference doc in codebase /docs',
      icon: '✅',
      isInternal: true,
    },
  ];

  const visibleTools=tools.filter(t=>!(role==='marketing_admin'&&t.name==='Website SEO Manager'));
  return (
    <div>
      <div style={{marginBottom: 28}}>
        <p className="eyebrow">MARKETING & MEDIA OPERATIONS</p>
        <h1>Media Tools & Marketing Launchpad</h1>
        <p className="lead" style={{color: '#555', maxWidth: '80ch'}}>
          Direct access to the church’s official marketing, analytics, and advertising portals. All tags and ad tracking
          are managed via Google Tag Manager without touching source code or environment variables.
        </p>
      </div>

      <p><Link href="/admin/guide/MEDIA_TEAM_HANDOFF">Read the media-team handover guide</Link></p>{/* External Platforms Grid */}
      <div className="cards" style={{marginBottom: 48}}>
        {visibleTools.map((t) => (
          <article
            key={t.name}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius)',
              padding: '24px',
            }}
          >
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                <span style={{fontSize: '1.75rem'}}>{t.icon}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                  }}
                >
                  {t.badge}
                </span>
              </div>

              <h2 style={{fontSize: '1.25rem', marginTop: 0, marginBottom: 8}}>{t.name}</h2>
              <p style={{fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5, marginBottom: 16}}>
                {t.purpose}
              </p>

              <div style={{background: '#f8fafc', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#334155', marginBottom: 16}}>
                <strong>Recommended Permission:</strong> {t.permission}
              </div>
            </div>

            <a
              href={t.url}
              target={t.isInternal ? '_self' : '_blank'}
              rel={t.isInternal ? '' : 'noopener noreferrer'}
              className="button small"
              style={{textAlign: 'center', justifyContent: 'center'}}
            >
              {t.isInternal ? 'Open in CMS ↗' : 'Open Dashboard ↗'}
            </a>
          </article>
        ))}
      </div>

      {/* Read-Only Technical Integration Status */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius)',
          padding: '28px',
          marginTop: 40,
        }}
      >
        <div style={{marginBottom: 20}}>
          <p className="eyebrow" style={{margin: 0}}>HEALTH & CONFIGURATION AUDIT</p>
          <h2 style={{fontSize: '1.35rem', marginTop: 4}}>Read-Only Technical Integration Status</h2>
          <p style={{color: '#666', fontSize: '0.85rem', margin: 0}}>
            Configuration summary only; this does not verify delivery, ownership or external accounts. Passwords, secrets, and API keys are never stored or displayed here.
          </p>
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16}}>
          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Configured Site URL
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#0f172a'}}>
              {siteUrl}
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Google Tag Manager Container
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: isGtmValid ? '#15803d' : '#ca8a04'}}>
              {gtmId} ({isGtmValid ? 'Configured; delivery unverified' : 'Disabled or unconfigured'})
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Cookie Consent System
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#15803d'}}>
              Implemented; production behavior unverified
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              XML Sitemap Endpoint
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#15803d'}}>
              <a href="/sitemap.xml" target="_blank" style={{textDecoration: 'underline'}}>
                /sitemap.xml ↗
              </a>
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Robots.txt Directives
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#15803d'}}>
              <a href="/robots.txt" target="_blank" style={{textDecoration: 'underline'}}>
                /robots.txt ↗
              </a>
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Default Social Sharing Image
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#15803d'}}>
              1200x630 (Configured)
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Favicon & Brand Mark
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#15803d'}}>
              High-res emblem (Active)
            </p>
          </div>

          <div style={{background: '#f8fafc', padding: 14, borderRadius: 6, border: '1px solid #f1f5f9'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>
              Last Production Verification
            </span>
            <p style={{margin: '4px 0 0', fontWeight: 600, fontSize: '0.95rem', color: '#0f172a'}}>
              Pending — see production-readiness audit
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

