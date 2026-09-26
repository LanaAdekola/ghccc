'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin, serverDB} from '@/lib/supabase';
import {MAX_MEDIA_BYTES,validMedia} from '@/lib/media-security.mjs';
import {contentInput,mediaEditorAllowedKinds} from '@/lib/validation';

export async function logout() {
  const db = await serverDB();
  await db.auth.signOut();
  redirect('/admin/login');
}

export async function save(form: FormData) {
  const {db, user, role} = await requireAdmin();
  const id = String(form.get('id') || 'new');
  const kind = String(form.get('kind') || '');

  // Role restriction: media_editor cannot touch sensitive giving or settings
  if (role === 'media_editor' && !mediaEditorAllowedKinds.includes(kind)) {
    throw new Error('Forbidden: media editors cannot modify financial or sensitive site settings.');
  }

  const existing=id==='new'?null:(await db.from('content').select('data,kind,slug').eq('id',id).single()).data;
  if(id!=='new'&&!existing)redirect('/admin?error=forbidden');
  if(role==='media_editor' && existing && !mediaEditorAllowedKinds.includes(existing.kind))redirect('/admin?error=forbidden');
  // Preserve structured content when the editor does not expose its JSON field.
  let data: Record<string, string> = existing?.data || {};
  try {
    if(form.has('data')) data = JSON.parse(String(form.get('data') || '{}'));
    if(!data||Array.isArray(data)||typeof data!=='object')throw new Error('Invalid fields');
    for(const key of ['speaker','venue','location','day','start','end','timezone','album_slug','is_decorative']) if(form.has('field_'+key)) data[key]=String(form.get('field_'+key)||'').trim();
  } catch {
    redirect(`/admin/edit/${id}?error=validation`);
  }

  data.is_decorative = form.get('field_is_decorative') === 'true' ? 'true' : 'false';

  // SEO & Social fields into data envelope
  const ogTitle = String(form.get('og_title') || '').trim();
  const ogDesc = String(form.get('og_description') || '').trim();
  const ogImage = String(form.get('og_image') || '').trim();
  const caption = String(form.get('caption') || '').trim();
  const noindexVal = form.get('noindex');
  const isNoindex = noindexVal === 'true' || noindexVal === 'on';

  if (ogTitle) data.og_title = ogTitle;
  else delete data.og_title;

  if (ogDesc) data.og_description = ogDesc;
  else delete data.og_description;

  if (ogImage) data.og_image = ogImage;
  else delete data.og_image;

  if (caption) data.caption = caption;
  else delete data.caption;

  data.noindex = isNoindex ? 'true' : 'false';

  const rawStatus = String(form.get('status') || 'draft');
  const status = ['draft', 'published', 'archived'].includes(rawStatus) ? rawStatus : 'draft';

  const parsed = contentInput.safeParse({
    ...Object.fromEntries(form),
    status,
    image_alt: data.is_decorative === 'true' ? '' : String(form.get('image_alt') || '').trim(),
    data,
  });

  if (!parsed.success) {
    redirect(`/admin/edit/${id}?error=validation`);
  }

  const existingPublishedAt = form.get('published_at') ? String(form.get('published_at')) : null;
  const published_at =
    status === 'published'
      ? existingPublishedAt
        ? new Date(existingPublishedAt).toISOString()
        : new Date().toISOString()
      : null;

  const row = {
    ...parsed.data,
    external_url: parsed.data.external_url || null,
    starts_at: parsed.data.starts_at ? new Date(parsed.data.starts_at).toISOString() : null,
    image_url: parsed.data.image_url || null,
    published_at,
    created_by: user.id,
  };

  const result =
    id === 'new' ? await db.from('content').insert(row) : await db.from('content').update(row).eq('id', id);

  if (result.error) {
    redirect(`/admin/edit/${id}?error=save`);
  }

  revalidatePath('/', 'layout');
  redirect('/admin?saved=1');
}

export async function archiveContent(form: FormData) {
  const {db,role} = await requireAdmin('media_editor');
  const id = String(form.get('id'));
  if(role==='media_editor'){
    const {data:row}=await db.from('content').select('kind').eq('id',id).single();
    if(!row || !mediaEditorAllowedKinds.includes(row.kind))throw new Error('Forbidden');
  }
  const {error} = await db.from('content').update({status: 'archived', published_at: null}).eq('id', id);
  if (error) throw new Error('Unable to archive content');
  revalidatePath('/', 'layout');
  redirect('/admin?archived=1');
}

export async function restoreContent(form: FormData) {
  const {db} = await requireAdmin('content_admin');
  const id = String(form.get('id'));
  const {error} = await db.from('content').update({status: 'draft'}).eq('id', id);
  if (error) throw new Error('Unable to restore content');
  revalidatePath('/', 'layout');
  redirect('/admin?restored=1');
}

export async function deleteContent(form: FormData) {
  const {db} = await requireAdmin('content_admin');
  const id = String(form.get('id'));
  const {error} = await db.from('content').delete().eq('id', id);
  if (error) throw new Error('Unable to delete content permanently');
  revalidatePath('/', 'layout');
  redirect('/admin?deleted=1');
}

export async function setRole(form: FormData) {
  const {db, user, role} = await requireAdmin('super_admin');
  if (role !== 'super_admin') throw new Error('Forbidden');

  const id = String(form.get('user_id'));
  const newRole = String(form.get('role'));

  if (id === user.id) throw new Error('Cannot change your own role');
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['media_editor', 'content_admin', 'super_admin', 'marketing_admin', 'remove'].includes(newRole)) {
    throw new Error('Invalid role request');
  }

  const result =
    newRole === 'remove'
      ? await db.from('user_roles').delete().eq('user_id', id)
      : await db.from('user_roles').upsert({user_id: id, role: newRole});

  if (result.error) throw new Error('Unable to update role');
  revalidatePath('/admin');
}

export async function deleteSubmission(form: FormData) {
  const {db} = await requireAdmin('content_admin');
  const {error} = await db.from('submissions').delete().eq('id', String(form.get('id')));
  if (error) throw new Error('Unable to delete submission');
  revalidatePath('/admin');
}

export async function upload(form: FormData) {
  const {db} = await requireAdmin('media_editor');
  const file = form.get('file');
  const id = String(form.get('id') || 'new');
  const requested=String(form.get('redirect')||'');
  const redirectTarget=requested==='/admin/media'?requested:`/admin/edit/${/^(new|[0-9a-f-]{36})$/.test(id)?id:'new'}`;

  if (!(file instanceof File) || file.size > MAX_MEDIA_BYTES || file.size === 0 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    redirect(`${redirectTarget}?error=upload`);
  }

  const bytes=new Uint8Array(await file.arrayBuffer());
  if(!validMedia(bytes,file.type,file.name))redirect(`${redirectTarget}?error=upload`);
  const extension = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}[file.type]!;
  const path = `${crypto.randomUUID()}.${extension}`;

  const rawAlt = String(form.get('alt') || form.get('image_alt') || '').trim();
  if(rawAlt.length>300)redirect(`${redirectTarget}?error=upload`);
  const safeAlt = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(rawAlt) ? '' : rawAlt;
  const metadata = safeAlt ? {alt: safeAlt} : undefined;

  const {error} = await db.storage.from('church-media').upload(path, file, {
    contentType: file.type,
    upsert: false,
    ...(metadata ? {metadata} : {}),
  });
  if (error) redirect(`${redirectTarget}?error=upload`);

  redirect(`${redirectTarget}?uploaded=${encodeURIComponent(path)}`);
}
