import {
  integrations,
  normalizeMarketing as normalizeMarketingRaw,
  validateMarketing,
  scriptPlan,
  canManageMarketing,
} from './marketing.mjs';

export type Integration = 'ga' | 'adsense' | 'gtm' | 'meta' | 'ads';
export type Marketing = Record<string, string>;

export const normalizeMarketing = (input: Record<string, unknown> = {}): Marketing =>
  normalizeMarketingRaw(input) as unknown as Marketing;

export {integrations, validateMarketing, scriptPlan, canManageMarketing};
