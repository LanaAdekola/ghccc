'use server';
import {redirect} from 'next/navigation';
import {serverDB} from '@/lib/supabase';
import {configured} from '@/lib/content';
export async function login(form:FormData) {
  if (!configured()) redirect('/admin/login?error=setup');
  const email=String(form.get('email')||'').trim();
  const password=String(form.get('password')||'');
  if (!email || !password || email.length>254 || password.length>256) redirect('/admin/login?error=credentials');
  let failure = '';
  try {
    const db=await serverDB();
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if (error || !data.user) {
      failure = error && error.status && error.status >= 500 ? 'connection' : 'credentials';
    } else {
      const {data:role,error:roleError}=await db.from('user_roles').select('role').eq('user_id',data.user.id).single();
      if (roleError || !role || !['super_admin','content_admin','media_editor','marketing_admin'].includes(role.role)) {
        await db.auth.signOut();
        failure='access';
      }
    }
  } catch {
    failure='connection';
  }
  if (failure) redirect('/admin/login?error='+failure);
  redirect('/admin');
}
