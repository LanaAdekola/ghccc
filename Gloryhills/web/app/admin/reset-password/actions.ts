'use server';
import {redirect} from 'next/navigation';
import {serverDB} from '@/lib/supabase';
export async function updatePassword(_state:{message:string}, form:FormData) {
 const password=String(form.get('password')||'');
 if(password.length<12 || password.length>128) return {message:'Use a password between 12 and 128 characters.'};
 if(password!==String(form.get('confirm')||'')) return {message:'The passwords do not match.'};
 try {
  const db=await serverDB();
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError || !user) return {message:'Your reset link has expired. Request a new link.'};
  const {error}=await db.auth.updateUser({password});
  if(error) return {message:error.code==='same_password'?'Choose a different password.':'Unable to update your password. It may not meet the password policy, or your session may have expired.'};
  await db.auth.signOut();
 } catch {return {message:'Unable to reach the sign-in service. Please try again.'};}
 redirect('/admin/login?reset=success');
}
