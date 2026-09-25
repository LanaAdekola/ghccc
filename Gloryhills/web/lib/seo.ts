import type {Metadata} from 'next';

export interface MetaOptions {
  ogTitle?: string;
  ogDescription?: string;
  image?: string;
  noindex?: boolean;
}

export {origin, meta, jsonLd} from './seo.mjs';
