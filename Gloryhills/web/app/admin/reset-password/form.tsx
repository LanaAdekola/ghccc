'use client';

import {useState, useEffect, useActionState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {createBrowserClient} from '@supabase/ssr';
import {updatePassword} from './actions';

export function PasswordForm({
  initialAuthenticated = false,
  errorParam,
}: {
  initialAuthenticated?: boolean;
  errorParam?: string;
}) {
  const router = useRouter();
  const hasClientConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [checking, setChecking] = useState(!initialAuthenticated && hasClientConfig);
  const [state, action, serverPending] = useActionState(updatePassword, {message: ''});
  const [clientPending] = useTransition();
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    if (initialAuthenticated || !hasClientConfig) {
      return;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createBrowserClient(url, key);

    // 1. Listen for password recovery or session events (e.g. from hash fragment)
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN')) {
        setAuthenticated(true);
        setChecking(false);
      }
    });

    // 2. Check current session if already established in browser
    supabase.auth
      .getSession()
      .then(({data: {session}}) => {
        if (session) {
          setAuthenticated(true);
        }
        setChecking(false);
      })
      .catch(() => {
        setChecking(false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialAuthenticated, hasClientConfig]);

  useEffect(() => {
    if (state.message === 'Your reset link has expired. Request a new link.') {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return;
      const formEl = document.querySelector('form.form') as HTMLFormElement | null;
      if (!formEl) return;
      const formData = new FormData(formEl);
      const password = String(formData.get('password') || '');
      if (!password) return;
      const supabase = createBrowserClient(url, key);
      supabase.auth.updateUser({password}).then(({error}) => {
        if (!error) {
          supabase.auth.signOut().finally(() => {
            router.push('/admin/login?reset=success');
          });
        }
      });
    }
  }, [state.message, router]);

  if (checking) {
    return <p role="status">Checking your reset link…</p>;
  }

  if (!authenticated) {
    return (
      <p role="alert">
        Your reset link is missing, invalid or expired. Request a new link and open it in the same browser.
      </p>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get('password') || '');
    const confirm = String(formData.get('confirm') || '');

    if (password.length < 12 || password.length > 128) {
      e.preventDefault();
      setClientError('Use a password between 12 and 128 characters.');
      return;
    }
    if (password !== confirm) {
      e.preventDefault();
      setClientError('The passwords do not match.');
      return;
    }
  };

  const pending = serverPending || clientPending;
  const message = clientError || state.message;

  return (
    <form className="form" action={action} onSubmit={handleSubmit}>
      <label>
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <label>
        Confirm password
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Saving…' : 'Save new password'}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
