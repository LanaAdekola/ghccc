'use server';
import {redirect} from 'next/navigation';
import {serverDB} from '@/lib/supabase';
import {configured} from '@/lib/content';
export async function login(form:FormData){if(!configured())redirect('/admin/login?error=setup');const email=String(form.get('email')||'');const password=String(form.get('password')||'');if(email.length>254||password.length>256)redirect('/admin/login?error=credentials');const db=await serverDB();const {error}=await db.auth.signInWithPassword({email,password});if(error)redirect('/admin/login?error=credentials');const {data:{user}}=await db.auth.getUser();const {data:role}=await db.from('user_roles').select('role').eq('user_id',user!.id).single();if(!role){await db.auth.signOut();redirect('/admin/login?error=access');}redirect('/admin');}
