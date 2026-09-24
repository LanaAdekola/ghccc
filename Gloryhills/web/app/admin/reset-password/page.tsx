import Link from 'next/link';
import {serverDB} from '@/lib/supabase';
import {PasswordForm} from './form';
export default async function ResetPassword({searchParams}:{searchParams:Promise<{error?:string}>}) {
 const {error}=await searchParams;
 let authenticated=false;
 if(!error) try {const db=await serverDB();const {data:{user}}=await db.auth.getUser();authenticated=Boolean(user);} catch {}
 return <main id="main" className="page-heading"><h1>Choose a new password</h1>{authenticated?<PasswordForm/>:<p role="alert">Your reset link is missing, invalid or expired. Request a new link and open it in the same browser.</p>}<Link href="/admin/forgot-password">Request another reset link</Link></main>;
}
