'use client';

import {useState, useSyncExternalStore} from 'react';
import Link from 'next/link';
import {updateConsentState} from './analytics';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('ghcc-consent', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('ghcc-consent', callback);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem('ghcc-consent');
}

function getServerSnapshot(): string | null {
  return 'placeholder';
}

export default function ConsentBanner() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [closed, setClosed] = useState(false);

  if (closed || consent !== null) return null;

  const handleConsent = (decision: 'granted' | 'denied') => {
    updateConsentState(decision === 'granted');
    setClosed(true);
  };

  return (
    <aside
      role="region"
      aria-label="Cookie and privacy consent"
      className="consent-banner"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#1c1c1c',
        color: '#fff',
        padding: '18px 24px',
        borderTop: '2px solid #74162a',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <p style={{margin: 0, fontSize: '0.9rem', lineHeight: '1.5', maxWidth: '75ch'}}>
          With your permission, we use optional analytics and advertising services to understand visits and support our outreach. Our tracking events do not include submitted prayer requests, contact messages or bank details.{' '}
          <Link href="/cookies" style={{color: '#fff', textDecoration: 'underline'}}>
            Cookie preferences
          </Link>
        </p>
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <button
            type="button"
            className="button small"
            onClick={() => handleConsent('granted')}
            style={{background: '#74162a', color: '#fff'}}
          >
            Accept optional services
          </button>
          <button
            type="button"
            className="button small light"
            onClick={() => handleConsent('denied')}
            style={{background: 'transparent', color: '#fff', border: '1px solid #666'}}
          >
            Decline
          </button>
        </div>
      </div>
    </aside>
  );
}

