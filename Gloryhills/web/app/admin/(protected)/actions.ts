'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin,serverDB} from '@/lib/supabase';
import {contentInput} from '@/lib/validation';
export async function logout(){const db=await serverDB();await db.auth.signOut();redirect('/admin/login');}
export async function save(form:FormData){const {db}=await requireAdmin();const id=String(form.get('id')||'new');let data;try{data=JSON.parse(String(form.get('data')||'{}'));}catch{redirect(`/admin/edit/${id}?error=validation`);}
 const parsed=contentInput.safeParse({...Object.fromEntries(form),data});if(!parsed.success)redirect(`/admin/edit/${id}?error=validation`);
 const row={...parsed.data,external_url:parsed.data.external_url||null,starts_at:parsed.data.starts_at?new Date(parsed.data.starts_at).toISOString():null,image_url:parsed.data.image_url||null,published_at:parsed.data.status==='published'?new Date().toISOString():null};
 const result=id==='new'?await db.from('content').insert(row):await db.from('content').update(row).eq('id',id);if(result.error)redirect(`/admin/edit/${id}?error=save`);revalidatePath('/','layout');redirect('/admin?saved=1');
}
export async function setRole(form:FormData){const {db,user,role}=await requireAdmin();if(role!=='super_admin')throw new Error('Forbidden');const id=String(form.get('user_id'));const newRole=String(form.get('role'));if(id===user.id)throw new Error('Cannot change your own role');if(!/^[0-9a-f-]{36}$/i.test(id)||!['admin','super_admin','remove'].includes(newRole))throw new Error('Invalid role request');const result=newRole==='remove'?await db.from('user_roles').delete().eq('user_id',id):await db.from('user_roles').upsert({user_id:id,role:newRole});if(result.error)throw new Error('Unable to update role');revalidatePath('/admin');}
export async function deleteSubmission(form:FormData){const {db}=await requireAdmin();const {error}=await db.from('submissions').delete().eq('id',String(form.get('id')));if(error)throw new Error('Unable to delete submission');revalidatePath('/admin');}
export async function upload(form:FormData){const {db}=await requireAdmin();const file=form.get('file');const id=String(form.get('id'));if(!(file instanceof File)||file.size>5242880||!['image/jpeg','image/png','image/webp'].includes(file.type))redirect(`/admin/edit/${id}?error=upload`);const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]!;const path=`${crypto.randomUUID()}.${extension}`;const {error}=await db.storage.from('church-media').upload(path,file,{contentType:file.type,upsert:false});if(error)redirect(`/admin/edit/${id}?error=upload`);redirect(`/admin/edit/${id}?uploaded=${encodeURIComponent(path)}`);}
