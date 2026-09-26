'use server';
import {serverDB} from '@/lib/supabase';
import {configured} from '@/lib/content';
import {recoveryOrigin} from '@/lib/auth-policy.mjs';
export async function requestReset(_state:{message:string}, form:FormData) {
  const email=String(form.get('email')||'').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254) return {message:'Enter a valid email address.'};
  if (!configured()) return {message:'Sign-in service is not configured.'};
  let site: string;
  try { site=recoveryOrigin(); } catch { return {message:'Password recovery is unavailable on this origin. Contact your administrator.'}; }
  try {
    const db=await serverDB();
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:new URL('/auth/callback',site).href});
    if(error) return {message:error.status===429?'Too many requests. Wait before requesting another link.':'Unable to send a reset email. Check the Supabase email service and redirect settings.'};
    return {message:'If an account exists for this email, a reset link will arrive shortly. Open it in this browser. Check your spam folder.'};
  } catch {return {message:'Unable to reach the sign-in service. Please try again.'};}
}
