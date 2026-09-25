import test from 'node:test';
import assert from 'node:assert/strict';
import {origin, meta, jsonLd} from '../lib/seo.mjs';
import {getYouTubeId} from '../lib/youtube.mjs';

test('SEO origin resolution rules', () => {
  const origEnv = process.env.NODE_ENV;
  const origSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    // 1. In production, never fall back to localhost even if NEXT_PUBLIC_SITE_URL is unset
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(origin(), 'https://www.ghccglobal.com');

    // 2. In production, if NEXT_PUBLIC_SITE_URL accidentally has localhost, safely use official domain
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    assert.equal(origin(), 'https://www.ghccglobal.com');

    // 3. In production with canonical domain (with or without trailing slash)
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.ghccglobal.com/';
    assert.equal(origin(), 'https://www.ghccglobal.com');

    // 4. In development, allow localhost
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(origin(), 'http://localhost:3000');

    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    assert.equal(origin(), 'http://localhost:3000');
  } finally {
    process.env.NODE_ENV = origEnv;
    if (origSiteUrl !== undefined) process.env.NEXT_PUBLIC_SITE_URL = origSiteUrl;
    else delete process.env.NEXT_PUBLIC_SITE_URL;
  }
});

test('VideoObject structured data requirements', () => {
  // Valid YouTube video URLs
  const standardYt = 'https://www.youtube.com/watch?v=40a-r3mUHRw';
  const shortYt = 'https://youtu.be/40a-r3mUHRw';
  const embedYt = 'https://www.youtube.com/embed/40a-r3mUHRw';

  assert.equal(getYouTubeId(standardYt), '40a-r3mUHRw');
  assert.equal(getYouTubeId(shortYt), '40a-r3mUHRw');
  assert.equal(getYouTubeId(embedYt), '40a-r3mUHRw');

  // Arbitrary HTTPS links must NOT be treated as valid videos
  assert.equal(getYouTubeId('https://open.spotify.com/episode/abc123'), null);
  assert.equal(getYouTubeId('https://example.com/audio/sermon.mp3'), null);
  assert.equal(getYouTubeId('https://gloryhills.org/sermon-notes.pdf'), null);
});

test('Metadata robots directives', () => {
  const publicMeta = meta('Public Page', 'Description', '/public');
  assert.equal(publicMeta.robots, undefined); // Default indexable

  const noindexMeta = meta('Private Page', 'Description', '/admin/login', {noindex: true});
  assert.deepEqual(noindexMeta.robots, {index: false, follow: true});
});
