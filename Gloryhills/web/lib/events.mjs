/**
 * Authoritative Tracking Event Registry & Dictionary
 * Glory Hills Community Church
 */

export const FORBIDDEN_KEYS = new Set([
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

/**
 * Registry of all documented events.
 * Defines triggers, parameter contracts, implementation status, reachability,
 * intended analytics destination, and privacy boundaries.
 */
export const EVENT_REGISTRY = [
  {
    name: 'page_view',
    trigger: 'Client-side route change in Analytics component',
    parameters: ['page_path'],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Sanitized route path only. Query strings, search params, and PII are stripped. Excluded on /admin, /auth, /prayer-request.',
  },
  {
    name: 'event_view',
    trigger: 'Visiting an event details page (/events/[slug])',
    parameters: ['route'],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Event route slug only. Never transmits attendee information.',
  },
  {
    name: 'listen_click',
    trigger: 'Clicking public links to /sermons, Spotify, or external YouTube playlists',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Link engagement trigger. No user identifiers.',
  },
  {
    name: 'sermon_play_requested',
    trigger: 'Clicking the play facade button on an embedded YouTube sermon (YouTubeEmbed)',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Records the user request to initiate video playback in privacy-enhanced iframe. Not a guaranteed video completion.',
  },
  {
    name: 'give_click',
    trigger: 'Clicking public navigation or action links to /give',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Navigation engagement only. Evaluated after online_giving_started to prevent precedence blocking.',
  },
  {
    name: 'online_giving_started',
    trigger: 'Clicking an online giving action button (data-action="online-giving-start") or external payment gateway link',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Checkout initiation intent only. Never contains bank details, card numbers, currency amounts, or donor identity.',
  },
  {
    name: 'giving_method_selected',
    trigger: 'Clicking or focusing a church-approved giving method card (.giving-method-card)',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Card selection interaction only. Never transmits bank credentials or account numbers.',
  },
  {
    name: 'bank_details_copied',
    trigger: 'Clicking "Copy account number" on a giving method card (CopyAccount component)',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: false,
    privacyConstraints: 'Dispatched only after successful clipboard API write. Never includes the account number, bank name, or account holder name in the payload.',
  },
  {
    name: 'plan_visit_click',
    trigger: 'Clicking links pointing to /plan-your-visit',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Navigation intent only. No personal visitor details.',
  },
  {
    name: 'phone_click',
    trigger: 'Clicking tel: telephone links',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Telephone contact link interaction. Does not record the dialed number.',
  },
  {
    name: 'email_click',
    trigger: 'Clicking mailto: email links',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Email contact link interaction. Does not record the email address.',
  },
  {
    name: 'whatsapp_click',
    trigger: 'Clicking WhatsApp community or inquiry links (wa.me / whatsapp.com)',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Outbound messaging link interaction. Does not record phone number or message text.',
  },
  {
    name: 'directions_click',
    trigger: 'Clicking map directions links or Google Maps URLs',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Location navigation interaction. Does not transmit user GPS or origin coordinates.',
  },
  {
    name: 'event_registration_click',
    trigger: 'Clicking event registration links (data-action="event-register")',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Registration interest click only. No registration form data.',
  },
  {
    name: 'contact_form_submitted',
    trigger: 'Successful server response from contact form submission (PublicForm kind="contact")',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Confirmed inquiry submission. Form inputs (name, email, message) are strictly excluded from analytics dataLayer.',
  },
  {
    name: 'newsletter_signup',
    trigger: 'Successful server response from newsletter subscription (PublicForm kind="newsletter")',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Confirmed subscription. Subscriber email is strictly excluded from analytics dataLayer.',
  },
  {
    name: 'event_interest_submitted',
    trigger: 'Successful server response from event registration inquiry (PublicForm kind="event-interest")',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Confirmed event inquiry. Registrant name and email are strictly excluded.',
  },
  {
    name: 'visit_request_submitted',
    trigger: 'Successful server response from plan-your-visit form (PublicForm kind="plan-your-visit")',
    parameters: [],
    implemented: true,
    reachable: true,
    intendedGA4: true,
    intendedGoogleAds: true,
    privacyConstraints: 'Confirmed visit planning submission. Visitor name and contact details are strictly excluded.',
  },
  {
    name: 'google_ads_conversion',
    trigger: 'Manual helper trackGoogleAdsConversion() invocation',
    parameters: [],
    implemented: true,
    reachable: false,
    intendedGA4: false,
    intendedGoogleAds: true,
    privacyConstraints: 'Uncalled helper reserved for verified external conversion callbacks. Does not fire in standard UI flows.',
  },
];

export const ALLOWED_EVENT_NAMES = new Set(EVENT_REGISTRY.map((e) => e.name));

/**
 * Sanitizes event payload according to strict church privacy constraints.
 * Strips PII, non-whitelisted parameters, and non-whitelisted events.
 */
export function sanitizeEventPayload(event, payload) {
  if (!ALLOWED_EVENT_NAMES.has(event)) {
    return null;
  }

  // Explicit safety rule: Prayer requests must NEVER be tracked.
  if (event.includes('prayer')) {
    return null;
  }

  const sanitized = {event};

  if (payload && typeof payload === 'object') {
    for (const [key, val] of Object.entries(payload)) {
      const lowerKey = key.toLowerCase();
      if (FORBIDDEN_KEYS.has(lowerKey)) {
        continue;
      }

      // Only approved route parameters; never accept arbitrary payload values.
      if (['route', 'page_path'].includes(key) && typeof val === 'string' && /^\/[a-z0-9/_-]*$/.test(val)) {
        sanitized[key] = val;
      }
    }
  }

  return sanitized;
}
