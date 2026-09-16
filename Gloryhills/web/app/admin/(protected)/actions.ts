'use server';

import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireAdmin, serverDB} from '@/lib/supabase';
import {contentInput} from '@/lib/validation';

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
  if (role === 'media_editor' && ['giving_methods', 'giving_campaigns', 'settings', 'seo'].includes(kind)) {
    throw new Error('Forbidden: media editors cannot modify financial or sensitive site settings.');
  }

  let data: Record<string, string> = {};
  try {
    data = JSON.parse(String(form.get('data') || '{}'));
  } catch {
    redirect(`/admin/edit/${id}?error=validation`);
  }

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
  const {db} = await requireAdmin('media_editor');
  const id = String(form.get('id'));
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
  if (!/^[0-9a-f-]{36}$/i.test(id) || !['media_editor', 'content_admin', 'super_admin', 'remove'].includes(newRole)) {
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
  const redirectTarget = form.get('redirect') ? String(form.get('redirect')) : `/admin/edit/${id}`;

  if (!(file instanceof File) || file.size > 5242880 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    redirect(`${redirectTarget}?error=upload`);
  }

  const extension = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}[file.type]!;
  const path = `${crypto.randomUUID()}.${extension}`;

  const {error} = await db.storage.from('church-media').upload(path, file, {contentType: file.type, upsert: false});
  if (error) redirect(`${redirectTarget}?error=upload`);

  redirect(`${redirectTarget}?uploaded=${encodeURIComponent(path)}`);
}
