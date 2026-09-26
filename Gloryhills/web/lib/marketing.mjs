export const integrations = {
  ga: {title: 'Google Analytics 4', label: 'Measurement ID', pattern: /^G-[A-Z0-9]+$/, description: 'Understand website visits and engagement.'},
  adsense: {title: 'Google AdSense', label: 'Publisher ID', pattern: /^ca-pub-\d{16}$/, description: 'Reference ID only. Approved tags and placements must be configured externally through GTM.'},
  gtm: {title: 'Google Tag Manager', label: 'Container ID', pattern: /^GTM-[A-Z0-9]+$/, description: 'Manage tags centrally. GA4, Google Ads, Meta and AdSense must be configured inside GTM; no direct vendor loaders exist.'},
  meta: {title: 'Meta Pixel', label: 'Pixel ID', pattern: /^\d{5,20}$/, description: 'Measure consented activity for Meta campaigns.'},
  ads: {title: 'Google Ads', label: 'Conversion ID', pattern: /^AW-\d+$/, description: 'Track conversions for paid campaigns. This is different from AdSense.'},
};

export function normalizeMarketing(input = {}) {
  const out = {};
  for (const [key, entry] of Object.entries(integrations)) {
    const id = typeof input[`${key}_id`] === 'string' ? input[`${key}_id`].trim() : '';
    out[`${key}_id`] = entry.pattern.test(id) ? id : '';
    out[`${key}_enabled`] = input[`${key}_enabled`] === 'true' && out[`${key}_id`] ? 'true' : 'false';
  }
  const label = String(input.ads_label || '');
  out.ads_label = /^[A-Za-z0-9_-]{1,100}$/.test(label) ? label : '';
  return out;
}

export function validateMarketing(input = {}) {
  for (const [key, entry] of Object.entries(integrations)) {
    const id = input[`${key}_id`] || '';
    if ((id || input[`${key}_enabled`] === 'true') && !entry.pattern.test(id)) {
      return `Enter a valid ${entry.title} ${entry.label.toLowerCase()}.`;
    }
  }
  if (input.ads_label && !/^[A-Za-z0-9_-]{1,100}$/.test(input.ads_label)) {
    return 'Enter a valid Google Ads conversion label.';
  }
  return null;
}

export function scriptPlan(raw) {
  const c = normalizeMarketing(raw);
  return c.gtm_enabled === 'true' && c.gtm_id
    ? [{id: 'ghcc-gtm', src: `https://www.googletagmanager.com/gtm.js?id=${c.gtm_id}`}]
    : [];
}

export const canManageMarketing = (role) => ['marketing_admin', 'content_admin', 'super_admin'].includes(role);
