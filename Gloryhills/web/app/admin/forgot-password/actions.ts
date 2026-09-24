'use server';
import {serverDB} from '@/lib/supabase';
import {configured} from '@/lib/content';
export async function requestReset(_state:{message:string}, form:FormData) {
  const email=String(form.get('email')||'').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254) return {message:'Enter a valid email address.'};
  if (!configured()) return {message:'Sign-in service is not configured.'};
  const site=process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return {message:'The site URL is not configured. Contact your administrator.'};
  try {
    const db=await serverDB();
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:new URL('/auth/callback',site).href});
    if(error) return {message:error.status===429?'Too many requests. Wait before requesting another link.':'Unable to send a reset email. Check the Supabase email service and redirect settings.'};
    return {message:'If an account exists for this email, a reset link will arrive shortly. Open it in this browser. Check your spam folder.'};
  } catch {return {message:'Unable to reach the sign-in service. Please try again.'};}
}
