'use client';

import {useState} from 'react';
import Turnstile from './turnstile';
import {track} from './analytics';

export default function PublicForm({kind}: {kind: string}) {
  const [status, setStatus] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setStatus('');
        const form = e.currentTarget;
        try {
          const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              kind,
              ...Object.fromEntries(new FormData(form)),
              token: new FormData(form).get('cf-turnstile-response') || '',
            }),
          });
          const data = await res.json();
          setStatus(data.message);
          if (res.ok) {
            form.reset();
            if (kind === 'prayer-request') {
              track('prayer_request_submitted');
            } else if (kind === 'newsletter') {
              track('newsletter_signup');
            } else {
              track('contact_form_submitted');
            }
          }
        } catch {
          setStatus('Your message could not be sent. Please try again later.');
        } finally {
          setPending(false);
          setAttempt((x) => x + 1);
        }
      }}
    >
      <label>
        Your name
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label>
        {kind === 'prayer-request' ? 'Prayer request' : kind === 'newsletter' ? 'Interests or questions (optional)' : 'Your message'}
        <textarea name="message" required minLength={kind === 'newsletter' ? 2 : 10} maxLength={5000} defaultValue={kind === 'newsletter' ? 'Newsletter subscription' : ''} />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          I agree that the church team may use this information to respond to my request. Please avoid sharing highly sensitive information.
        </span>
      </label>
      <Turnstile key={attempt} />
      <button className="button" disabled={pending || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}>
        {pending ? 'Sending…' : kind === 'newsletter' ? 'Subscribe to updates' : 'Send request'}
      </button>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
