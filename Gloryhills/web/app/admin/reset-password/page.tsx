import Link from 'next/link';
import {redirect} from 'next/navigation';
import {serverDB} from '@/lib/supabase';
import {PasswordForm} from './form';

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{error?: string; code?: string; token_hash?: string; type?: string}>;
}) {
  const params = await searchParams;
  const {error, code, token_hash, type} = params;

  if (code || token_hash) {
    const q = new URLSearchParams();
    if (code) q.set('code', code);
    if (token_hash) q.set('token_hash', token_hash);
    if (type) q.set('type', type);
    redirect(`/auth/callback?${q.toString()}`);
  }

  let authenticated = false;
  if (!error) {
    try {
      const db = await serverDB();
      const {
        data: {user},
      } = await db.auth.getUser();
      authenticated = Boolean(user);
    } catch {}
  }

  return (
    <main id="main" className="page-heading">
      <h1>Choose a new password</h1>
      <PasswordForm initialAuthenticated={authenticated} errorParam={error} />
      <Link href="/admin/forgot-password">Request another reset link</Link>
    </main>
  );
}
