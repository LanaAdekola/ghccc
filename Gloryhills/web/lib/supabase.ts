import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {configured} from './content';
export async function serverDB(){if(!configured())throw new Error('Supabase is not configured');const jar=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll(){return jar.getAll();},setAll(items){try{items.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server components cannot refresh cookies; login/actions can. */}}}});}
export async function requireAdmin(){if(!configured())redirect('/admin/login');const db=await serverDB();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/admin/login');const {data:role}=await db.from('user_roles').select('role').eq('user_id',user.id).single();if(!role)redirect('/admin/login?error=access');return {db,user,role:role.role as 'admin'|'super_admin'};}
