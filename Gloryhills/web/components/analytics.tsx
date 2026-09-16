'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Prohibited keys and patterns that might contain PII or sensitive info
const FORBIDDEN_KEYS = new Set([
  'name',
  'fullname',
  'first_name',
  'last_name',
  'email',
  'phone',
  'telephone',
  'prayer',
  'prayer_request',
  'message',
  'account',
  'account_number',
  'account_name',
  'bank',
  'card',
  'pin',
  'cvv',
  'password',
  'token',
]);

export function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function updateConsentState(granted: boolean) {
  if (typeof window === 'undefined') return;
  const status = granted ? 'granted' : 'denied';
  localStorage.setItem('ghcc-consent', status);

  gtag('consent', 'update', {
    analytics_storage: status,
    ad_storage: status,
    ad_user_data: status,
    ad_personalization: status,
  });

  window.dispatchEvent(new Event('ghcc-consent'));
}

export function isTrackingAllowed(): boolean {
  if (typeof window === 'undefined') return false;

  // Exclude admin dashboard
  if (window.location.pathname.startsWith('/admin')) return false;

  // Check consent
  const consent = localStorage.getItem('ghcc-consent');
  if (consent !== 'granted') return false;

  // Exclude localhost/dev unless explicitly enabled for media team testing
  const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const isDebug =
    new URLSearchParams(window.location.search).has('gtm_debug') ||
    localStorage.getItem('ghcc-analytics-debug') === 'true';

  if (isLocal && !isDebug) return false;
  if (process.env.NODE_ENV !== 'production' && !isDebug) return false;

  return true;
}

export function track(event: string, payload?: Record<string, unknown>) {
  if (!isTrackingAllowed()) return;

  const sanitized: Record<string, unknown> = {event};

  if (payload && typeof payload === 'object') {
    for (const [key, val] of Object.entries(payload)) {
      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_KEYS.has(lowerKey)) continue;

      // Ensure primitive values only (string, number, boolean) and non-PII
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        sanitized[key] = val;
      }
    }
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(sanitized);
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // If inside admin, ensure GTM is inactive
    if (pathname.startsWith('/admin')) {
      const existing = document.getElementById('ghcc-gtm');
      if (existing) {
        existing.remove();
        window.location.reload();
      }
      return;
    }

    // Initialize Google Consent Mode v2 defaults
    const currentConsent = localStorage.getItem('ghcc-consent');
    const initialStatus = currentConsent === 'granted' ? 'granted' : 'denied';

    gtag('consent', 'default', {
      analytics_storage: initialStatus,
      ad_storage: initialStatus,
      ad_user_data: initialStatus,
      ad_personalization: initialStatus,
      wait_for_update: 500,
    });

    const id = process.env.NEXT_PUBLIC_GTM_ID;
    if (!id || !/^GTM-[A-Z0-9]+$/.test(id)) return;

    function start() {
      if (!isTrackingAllowed()) return;
      if (document.getElementById('ghcc-gtm')) return;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});

      const script = document.createElement('script');
      script.id = 'ghcc-gtm';
      script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
      script.async = true;
      document.head.append(script);
    }

    start();
    window.addEventListener('ghcc-consent', start);

    // Track page views or route specific views
    if (pathname.startsWith('/events/')) {
      track('event_view', {route: pathname});
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;

      // Check for link click
      const a = target.closest('a');
      if (a) {
        const href = a.getAttribute('href') || '';
        const lowerHref = href.toLowerCase();

        // 1. phone_click
        if (lowerHref.startsWith('tel:')) {
          track('phone_click');
          return;
        }

        // 2. email_click
        if (lowerHref.startsWith('mailto:')) {
          track('email_click');
          return;
        }

        // 3. whatsapp_click
        if (lowerHref.includes('wa.me') || lowerHref.includes('whatsapp.com')) {
          track('whatsapp_click');
          return;
        }

        // 4. directions_click
        if (
          lowerHref.includes('maps.google.') ||
          lowerHref.includes('goo.gl/maps') ||
          lowerHref.includes('google.com/maps') ||
          a.getAttribute('data-action') === 'directions' ||
          a.textContent?.toLowerCase().includes('directions')
        ) {
          track('directions_click');
          return;
        }

        // 5. plan_visit_click
        if (lowerHref.includes('plan-your-visit') || lowerHref.includes('plan-visit')) {
          track('plan_visit_click');
          return;
        }

        // 6. event_registration_click
        if (
          a.getAttribute('data-action') === 'event-register' ||
          a.classList.contains('event-register-button') ||
          (lowerHref.includes('register') && !lowerHref.includes('login'))
        ) {
          track('event_registration_click');
          return;
        }

        // 7. give_click
        if (lowerHref === '/give' || lowerHref.startsWith('/give?') || lowerHref.startsWith('/give#')) {
          track('give_click');
          return;
        }

        // 8. online_giving_started
        if (
          a.getAttribute('data-action') === 'online-giving-start' ||
          lowerHref.includes('paystack') ||
          lowerHref.includes('flutterwave')
        ) {
          track('online_giving_started');
          return;
        }

        // 9. listen_click
        if (
          lowerHref.startsWith('/sermons') ||
          lowerHref.includes('spotify.com') ||
          lowerHref.includes('youtu.be') ||
          lowerHref.includes('youtube.com') ||
          a.textContent?.toLowerCase().includes('listen')
        ) {
          track('listen_click');
          return;
        }
      }

      // Check for button or card interactions
      const givingCard = target.closest('.giving-method-card, [data-giving-method]');
      if (givingCard) {
        track('giving_method_selected');
        return;
      }
    }

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('ghcc-consent', start);
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return null;
}
