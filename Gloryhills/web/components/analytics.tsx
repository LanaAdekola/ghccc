'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {type Marketing} from '@/lib/marketing';
import {installMarketing, uninstallMarketing} from '@/lib/marketing-runtime';
import {sanitizeEventPayload, ALLOWED_EVENT_NAMES} from '@/lib/events.mjs';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    ghccLastPage?: string;
  }
}

export function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  // Google expects the arguments object used by its standard gtag queue.
  (function (..._values: unknown[]) {
    void _values;
    window.dataLayer!.push(arguments);
  })(...args);
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

  // Exclude admin dashboard, authentication, and prayer request routes
  if (/^\/(admin|auth)(\/|$)/.test(window.location.pathname) || window.location.pathname === '/prayer-request') {
    return false;
  }

  // Check consent - strictly disallow before explicit consent
  const consent = localStorage.getItem('ghcc-consent');
  if (consent !== 'granted') return false;

  // Exclude localhost/dev unless explicitly enabled for media team testing
  const isLocal = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(window.location.hostname);
  const isDebug =
    new URLSearchParams(window.location.search).has('gtm_debug') ||
    localStorage.getItem('ghcc-analytics-debug') === 'true';

  if (isLocal && !isDebug) return false;
  if (process.env.NODE_ENV !== 'production' && !isDebug) return false;

  return true;
}

export function track(event: string, payload?: Record<string, unknown>) {
  if (!isTrackingAllowed()) return;
  if (!ALLOWED_EVENT_NAMES.has(event)) return;

  const sanitized = sanitizeEventPayload(event, payload);
  if (!sanitized) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(sanitized);
}

export default function Analytics({config}: {config: Marketing}) {
  const pathname = usePathname();

  useEffect(() => {
    // If inside admin, auth, or prayer-request, ensure GTM is inactive
    if (/^\/(admin|auth)(\/|$)/.test(pathname) || pathname === '/prayer-request') {
      uninstallMarketing();
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

    function sync() {
      if (!isTrackingAllowed()) {
        uninstallMarketing();
        return;
      }
      installMarketing(config);
      if (window.ghccLastPage !== pathname) {
        window.ghccLastPage = pathname;
        track('page_view', {page_path: pathname});
        if (pathname.startsWith('/events/')) track('event_view', {route: pathname});
      }
    }

    function handleStorage(e: StorageEvent) {
      if (e.key === 'ghcc-consent' || e.key === null) {
        const isGranted = e.newValue === 'granted';
        gtag('consent', 'update', {
          analytics_storage: isGranted ? 'granted' : 'denied',
          ad_storage: isGranted ? 'granted' : 'denied',
          ad_user_data: isGranted ? 'granted' : 'denied',
          ad_personalization: isGranted ? 'granted' : 'denied',
        });
        sync();
      }
    }

    sync();
    window.addEventListener('ghcc-consent', sync);
    window.addEventListener('storage', handleStorage);

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

        // 7. online_giving_started (checked BEFORE general give_click to resolve precedence)
        if (
          a.getAttribute('data-action') === 'online-giving-start' ||
          lowerHref.includes('paystack') ||
          lowerHref.includes('flutterwave')
        ) {
          track('online_giving_started');
          return;
        }

        // 8. give_click (general navigation to /give)
        if (lowerHref === '/give' || lowerHref.startsWith('/give?') || lowerHref.startsWith('/give#')) {
          track('give_click');
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
      window.removeEventListener('ghcc-consent', sync);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('click', handleClick);
    };
  }, [pathname, config]);

  return null;
}

/**
 * Helper function reserved for verified external conversion callbacks.
 * Currently UNCALLED in standard application UI flows.
 * Never infer payment completion or event attendance from a click or page navigation.
 */
export function trackGoogleAdsConversion() {
  if (!isTrackingAllowed()) return;
  track('google_ads_conversion');
}
