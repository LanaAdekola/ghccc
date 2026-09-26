import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {configured} from './content';
import {isAdminRole} from './auth-policy.mjs';

export type AdminRole = 'media_editor' | 'content_admin' | 'super_admin' | 'marketing_admin';

const roleRank: Record<AdminRole, number> = {
  marketing_admin: 0,
  media_editor: 1,
  content_admin: 2,
  super_admin: 3,
};

export async function serverDB() {
  if (!configured()) throw new Error('Supabase is not configured');
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(items) {
        try {
          items.forEach(({name, value, options}) => jar.set(name, value, options));
        } catch {
          /* Server components cannot refresh cookies; login/actions can. */
        }
      },
    },
  });
}

export async function requireAdmin(minRole: AdminRole = 'media_editor') {
  if (!configured()) redirect('/admin/login');
  const db = await serverDB();
  const {
    data: {user},
  } = await db.auth.getUser();
  if (!user) redirect('/admin/login');

  const {data: roleRow} = await db.from('user_roles').select('role').eq('user_id', user.id).single();
  if (!roleRow) redirect('/admin/login?error=access');

  const rawRole = roleRow.role as string;
  if (!isAdminRole(rawRole)) redirect('/admin/login?error=access');
  const role = rawRole as AdminRole;
  if (minRole !== 'marketing_admin' && roleRank[role] < roleRank[minRole]) {
    redirect(role === 'marketing_admin' ? '/admin/marketing' : '/admin?error=forbidden');
  }

  return {db, user, role};
}
