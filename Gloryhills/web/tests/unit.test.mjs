import test from 'node:test';
import assert from 'node:assert/strict';
import {EVENT_REGISTRY, ALLOWED_EVENT_NAMES, sanitizeEventPayload} from '../lib/events.mjs';

test('Event Registry contracts and completeness', () => {
  assert.ok(EVENT_REGISTRY.length >= 18, 'Expected at least 18 registered events');

  for (const entry of EVENT_REGISTRY) {
    assert.ok(entry.name, 'Event must have a name');
    assert.ok(entry.trigger, `Event ${entry.name} must have a trigger description`);
    assert.ok(Array.isArray(entry.parameters), `Event ${entry.name} must have a parameters array`);
    assert.equal(typeof entry.implemented, 'boolean', `Event ${entry.name} implemented must be boolean`);
    assert.equal(typeof entry.reachable, 'boolean', `Event ${entry.name} reachable must be boolean`);
    assert.equal(typeof entry.intendedGA4, 'boolean', `Event ${entry.name} intendedGA4 must be boolean`);
    assert.equal(typeof entry.intendedGoogleAds, 'boolean', `Event ${entry.name} intendedGoogleAds must be boolean`);
    assert.ok(entry.privacyConstraints, `Event ${entry.name} must have documented privacy constraints`);
  }

  // sermon_play_requested is documented and implemented
  const sermonPlay = EVENT_REGISTRY.find((e) => e.name === 'sermon_play_requested');
  assert.ok(sermonPlay, 'sermon_play_requested must be in the registry');
  assert.equal(sermonPlay.implemented, true);
  assert.equal(sermonPlay.reachable, true);

  // sermon_play (unrequested raw play) and online_giving_completed must NOT be in the active allowlist
  assert.equal(ALLOWED_EVENT_NAMES.has('sermon_play'), false);
  assert.equal(ALLOWED_EVENT_NAMES.has('online_giving_completed'), false);

  // prayer_request_submitted must NOT be in the active allowlist (prayer is strictly untracked)
  assert.equal(ALLOWED_EVENT_NAMES.has('prayer_request_submitted'), false);

  // google_ads_conversion is marked as not reachable through normal UI flows
  const adsConversion = EVENT_REGISTRY.find((e) => e.name === 'google_ads_conversion');
  assert.ok(adsConversion);
  assert.equal(adsConversion.reachable, false);
});

test('Event Payload Sanitization and Strict Privacy Filter', () => {
  // Unknown / unlisted events are rejected
  assert.equal(sanitizeEventPayload('unauthorized_event'), null);
  assert.equal(sanitizeEventPayload('random_custom_event'), null);

  // Prayer requests are NEVER tracked
  assert.equal(sanitizeEventPayload('prayer_request_submitted'), null);
  assert.equal(sanitizeEventPayload('prayer_submit', {prayer: 'Please pray for healing'}), null);

  // Whitelisted event with no payload
  assert.deepEqual(sanitizeEventPayload('give_click'), {event: 'give_click'});
  assert.deepEqual(sanitizeEventPayload('sermon_play_requested'), {event: 'sermon_play_requested'});

  // Whitelisted event with legitimate route parameter
  assert.deepEqual(
    sanitizeEventPayload('page_view', {page_path: '/sermons/faith-series'}),
    {event: 'page_view', page_path: '/sermons/faith-series'}
  );
  assert.deepEqual(
    sanitizeEventPayload('event_view', {route: '/events/sunday-service'}),
    {event: 'event_view', route: '/events/sunday-service'}
  );

  // Malicious or PII parameters are completely stripped
  const dirtyPayload = {
    page_path: '/contact',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+2348012345678',
    prayer: 'Confidential prayer request',
    prayer_request: 'Healing request',
    message: 'Hello pastor',
    account_number: '1234567890',
    account_name: 'Church Account',
    bank: 'Zenith',
    token: 'secret_token_abc',
    password: 'password123',
    card: '4111222233334444',
    cvv: '123',
    pin: '0000',
    arbitrary_field: 'unapproved_data',
    script_injection: '<script>alert(1)</script>',
  };

  const cleaned = sanitizeEventPayload('contact_form_submitted', dirtyPayload);
  assert.deepEqual(cleaned, {event: 'contact_form_submitted'});
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'name'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'email'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'phone'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'prayer'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'account_number'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(cleaned, 'arbitrary_field'), false);
});
