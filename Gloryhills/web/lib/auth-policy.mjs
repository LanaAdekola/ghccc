export const PRODUCTION_ORIGIN = 'https://www.ghccglobal.com';
const roles = ['media_editor', 'content_admin', 'super_admin', 'marketing_admin'];
export function isAdminRole(role) { return typeof role === 'string' && roles.includes(role); }

// Recovery destinations never depend on request Host, forwarded headers, or query parameters.
// Preview deployments must not issue production recovery links or exchange production codes.
export function recoveryOrigin(env = process.env) {
  if (env.VERCEL_ENV === 'preview') throw new Error('Recovery is disabled on preview deployments.');
  const raw = env.NEXT_PUBLIC_SITE_URL;
  if (!raw) throw new Error('The site URL is not configured.');
  const url = new URL(raw);
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid recovery origin.');
  if (env.NODE_ENV === 'production' || env.VERCEL_ENV === 'production') {
    if (url.origin !== PRODUCTION_ORIGIN) throw new Error('Recovery requires the canonical production origin.');
  } else if (url.origin !== PRODUCTION_ORIGIN && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('Development recovery requires localhost or the production origin.');
  }
  return url.origin;
}
