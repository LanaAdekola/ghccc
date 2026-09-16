import {z} from 'zod';

export const kinds = [
  'homepage',
  'settings',
  'seo',
  'sermons',
  'events',
  'service_times',
  'ministries',
  'announcements',
  'gallery_albums',
  'gallery_images',
  'leadership',
  'giving_methods',
  'giving_campaigns',
  'pages',
];

export const mediaEditorAllowedKinds = [
  'sermons',
  'events',
  'service_times',
  'announcements',
  'gallery_albums',
  'gallery_images',
  'homepage',
  'pages',
  'ministries',
];

export const requiredWhenPublished = {
  giving_methods: ['bank_name', 'account_name', 'account_number', 'currency'],
  service_times: ['location', 'day', 'start', 'end', 'timezone'],
  gallery_images: ['album_slug'],
};

const safeUrl = z
  .string()
  .max(2000)
  .refine((x) => !x || /^https:\/\//.test(x), 'Use an https:// URL');

export const contentInput = z
  .object({
    kind: z.enum(kinds),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(150),
    title: z.string().min(1).max(180),
    description: z.string().max(1000),
    body: z.string().max(50000),
    external_url: safeUrl,
    starts_at: z.string().refine((x) => !x || !isNaN(Date.parse(x)), 'Invalid date'),
    image_url: z.string().max(2000).regex(/^[a-zA-Z0-9/._-]*$/),
    image_alt: z.string().max(300),
    featured: z.coerce.boolean().default(false),
    status: z.enum(['draft', 'published', 'archived']),
    display_order: z.coerce.number().int().min(0).max(10000),
    seo_title: z.string().max(180),
    seo_description: z.string().max(300),
    data: z.record(z.string().max(80), z.string().max(2000)),
  })
  .refine((x) => !x.image_url || x.image_alt.length > 0, {message: 'Images need descriptive alt text'})
  .refine(
    (x) =>
      x.kind !== 'giving_methods' ||
      x.status !== 'published' ||
      Boolean(x.data.account_number && x.data.account_name && x.data.bank_name && x.data.currency),
    {message: 'Published giving methods require bank, account name, number and currency'}
  );

export const submissionInput = z.object({
  kind: z.enum(['contact', 'prayer-request', 'plan-your-visit', 'newsletter', 'event-interest']),
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(254),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal('on'),
  website: z.string().max(0),
  token: z.string().max(3000),
});
