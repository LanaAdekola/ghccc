import {normalizeMarketing, scriptPlan} from './marketing.mjs';

export function uninstallMarketing() {
  if (typeof document === 'undefined') return;
  const loaded = Boolean(document.getElementById('ghcc-gtm')) || Boolean(typeof window !== 'undefined' && window.ghccMarketingSignature);
  document.getElementById('ghcc-gtm')?.remove();
  if (typeof window !== 'undefined') {
    delete window.ghccMarketingSignature;
    delete window.ghccMarketing;
    if (loaded && !window.ghccMarketingReloading) {
      window.ghccMarketingReloading = true;
      window.location.reload();
    }
  }
}

export function installMarketing(raw) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.ghccMarketingReloading) return;
  const c = normalizeMarketing(raw);
  const signature = JSON.stringify(c);

  if (window.ghccMarketingSignature && window.ghccMarketingSignature !== signature) {
    uninstallMarketing();
    return;
  }

  if (c.gtm_enabled !== 'true' || !c.gtm_id) {
    uninstallMarketing();
    return;
  }

  window.ghccMarketingSignature = signature;
  window.ghccMarketing = c;

  for (const item of scriptPlan(c)) {
    if (document.getElementById(item.id)) continue;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
    const script = document.createElement('script');
    script.id = item.id;
    script.src = item.src;
    script.async = true;
    document.head.append(script);
  }
}
