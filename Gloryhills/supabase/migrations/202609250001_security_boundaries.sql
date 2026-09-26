-- Forward-only correction. Requires the four earlier migrations in order.
-- No content is deleted or rewritten. Transactional DDL prevents partial policy updates.
begin;

-- Exact roles, not a rank comparison with marketing_admin (whose rank is zero).
create or replace function public.content_staff(kind text, slug text) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles r where r.user_id=auth.uid() and (
   r.role::text in ('content_admin','super_admin')
   or (r.role::text='media_editor' and kind in
     ('sermons','events','service_times','announcements','gallery_albums','gallery_images','homepage','pages','ministries'))
   or (r.role::text='marketing_admin' and kind='settings' and slug='marketing')
 ));
$$;
revoke all on function public.content_staff(text,text) from public;
grant execute on function public.content_staff(text,text) to anon,authenticated;

-- Preserve legacy rows with absent alt text. NOT VALID still checks every new/updated row.
-- Decorative images must explicitly opt in and have empty alt text.
-- Remove only the historical image CHECK, not unrelated integrity constraints.
do $$ declare c record; begin
 for c in select conname from pg_constraint where conrelid='public.content'::regclass
 and contype='c' and conname <> 'content_image_alt_safe'
 and regexp_replace(lower(pg_get_constraintdef(oid)), '[[:space:]()]', '', 'g')
   in ('checkimage_urlisnullorlengthimage_alt>0','checkimage_urlisnullorlengthimage_alt>0notvalid')
 loop execute format('alter table public.content drop constraint %I',c.conname); end loop;
 alter table public.content drop constraint if exists content_image_alt_safe;
 alter table public.content add constraint content_image_alt_safe check (
   image_url is null or image_url='' or
   case when coalesce(data->>'is_decorative','false')='true'
     then coalesce(btrim(image_alt),'')=''
     else length(coalesce(btrim(image_alt),''))>=3
       and btrim(image_alt) !~* '^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|svg)$'
       and lower(btrim(image_alt)) <> lower(regexp_replace(image_url,'^.*/','')) end
 ) not valid;
end $$;
-- Validate only when existing rows permit it. Operators must review remaining legacy rows.
do $$ begin
 if not exists(select 1 from public.content where image_url is not null and image_url<>'' and not (
   case when coalesce(data->>'is_decorative','false')='true' then coalesce(btrim(image_alt),'')=''
   else length(coalesce(btrim(image_alt),''))>=3
     and btrim(image_alt) !~* '^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif|svg)$'
     and lower(btrim(image_alt)) <> lower(regexp_replace(image_url,'^.*/','')) end
 )) then alter table public.content validate constraint content_image_alt_safe; end if;
end $$;

-- RLS must remain enabled even if an operator previously changed it.
alter table public.content enable row level security;
alter table public.user_roles enable row level security;
alter table public.submissions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.rate_limits enable row level security;
alter table storage.objects enable row level security;

-- Replace known overlapping permissive policies with the final policy set.
drop policy if exists published_read on public.content;
drop policy if exists editor_read on public.content;
drop policy if exists editor_insert on public.content;
drop policy if exists editor_update on public.content;
drop policy if exists editor_delete on public.content;
drop policy if exists marketing_read on public.content;
drop policy if exists marketing_insert on public.content;
drop policy if exists marketing_update on public.content;
-- Public analytics needs published marketing settings, exactly like other published content.
create policy published_read on public.content for select to anon,authenticated
 using(status='published' and published_at<=now());
create policy editor_read on public.content for select to authenticated using(public.content_staff(kind,slug));
create policy editor_insert on public.content for insert to authenticated with check(public.content_staff(kind,slug));
create policy editor_update on public.content for update to authenticated using(public.content_staff(kind,slug)) with check(public.content_staff(kind,slug));
create policy editor_delete on public.content for delete to authenticated using(public.has_role('content_admin'));

-- Restrictive guards AND with any unknown permissive policies left in production.
-- They prevent accidental broad grants from widening these boundaries; unknown restrictive
-- policies may still deny access and must be reviewed in the production policy inventory.
drop policy if exists content_read_guard on public.content;
create policy content_read_guard on public.content as restrictive for select to anon,authenticated
 using((status='published' and published_at<=now()) or public.content_staff(kind,slug));
drop policy if exists content_insert_guard on public.content;
create policy content_insert_guard on public.content as restrictive for insert to anon,authenticated with check(public.content_staff(kind,slug));
drop policy if exists content_update_guard on public.content;
create policy content_update_guard on public.content as restrictive for update to anon,authenticated using(public.content_staff(kind,slug)) with check(public.content_staff(kind,slug));
drop policy if exists content_delete_guard on public.content;
create policy content_delete_guard on public.content as restrictive for delete to anon,authenticated using(public.has_role('content_admin'));

-- Only content/super administrators may read or delete pastoral submissions.
-- Browser roles cannot insert/update submissions: validated server endpoint uses service_role.
drop policy if exists submissions_admin_read on public.submissions;
drop policy if exists submissions_admin_delete on public.submissions;
create policy submissions_admin_read on public.submissions for select to authenticated using(public.has_role('content_admin'));
create policy submissions_admin_delete on public.submissions for delete to authenticated using(public.has_role('content_admin'));
drop policy if exists submissions_read_guard on public.submissions;
create policy submissions_read_guard on public.submissions as restrictive for select to anon,authenticated using(public.has_role('content_admin'));
drop policy if exists submissions_delete_guard on public.submissions;
create policy submissions_delete_guard on public.submissions as restrictive for delete to anon,authenticated using(public.has_role('content_admin'));
drop policy if exists submissions_insert_guard on public.submissions;
create policy submissions_insert_guard on public.submissions as restrictive for insert to anon,authenticated with check(false);
drop policy if exists submissions_update_guard on public.submissions;
create policy submissions_update_guard on public.submissions as restrictive for update to anon,authenticated using(false) with check(false);

-- Role assignment is exclusively super-admin; users can read their own assignment.
drop policy if exists role_read on public.user_roles;
drop policy if exists role_manage on public.user_roles;
create policy role_read on public.user_roles for select to authenticated using(user_id=auth.uid() or public.has_role('super_admin'));
create policy role_manage on public.user_roles for all to authenticated using(public.has_role('super_admin')) with check(public.has_role('super_admin'));
drop policy if exists role_read_guard on public.user_roles;
create policy role_read_guard on public.user_roles as restrictive for select to anon,authenticated using(user_id=auth.uid() or public.has_role('super_admin'));
drop policy if exists role_insert_guard on public.user_roles;
create policy role_insert_guard on public.user_roles as restrictive for insert to anon,authenticated with check(public.has_role('super_admin'));
drop policy if exists role_update_guard on public.user_roles;
create policy role_update_guard on public.user_roles as restrictive for update to anon,authenticated using(public.has_role('super_admin')) with check(public.has_role('super_admin'));
drop policy if exists role_delete_guard on public.user_roles;
create policy role_delete_guard on public.user_roles as restrictive for delete to anon,authenticated using(public.has_role('super_admin'));
-- Audit rows remain trigger-written and only super-admins may read them.
drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select to authenticated using(public.has_role('super_admin'));
drop policy if exists audit_guard on public.audit_logs;
create policy audit_guard on public.audit_logs as restrictive for all to anon,authenticated using(public.has_role('super_admin')) with check(false);
drop policy if exists audit_delete_guard on public.audit_logs;
create policy audit_delete_guard on public.audit_logs as restrictive for delete to anon,authenticated using(false);
drop policy if exists audit_update_guard on public.audit_logs;
create policy audit_update_guard on public.audit_logs as restrictive for update to anon,authenticated using(false) with check(false);
drop policy if exists rate_limit_guard on public.rate_limits;
create policy rate_limit_guard on public.rate_limits as restrictive for all to anon,authenticated using(false) with check(false);

-- Bucket configuration is reconciled without deleting or rewriting stored objects.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('church-media','church-media',false,5242880,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists media_admin on storage.objects;
drop policy if exists media_published on storage.objects;
drop policy if exists media_staff_read on storage.objects;
drop policy if exists media_staff_insert on storage.objects;
drop policy if exists media_manager_update on storage.objects;
drop policy if exists media_manager_delete on storage.objects;
-- Publication revocation is evaluated on every new download request.
create policy media_published on storage.objects for select to anon,authenticated using(bucket_id='church-media' and exists(select 1 from public.content where image_url=name and status='published' and published_at<=now()));
create policy media_staff_read on storage.objects for select to authenticated using(bucket_id='church-media' and public.has_role('media_editor'));
create policy media_staff_insert on storage.objects for insert to authenticated with check(bucket_id='church-media' and public.has_role('media_editor'));
create policy media_manager_update on storage.objects for update to authenticated using(bucket_id='church-media' and public.has_role('content_admin')) with check(bucket_id='church-media' and public.has_role('content_admin'));
create policy media_manager_delete on storage.objects for delete to authenticated using(bucket_id='church-media' and public.has_role('content_admin'));
-- Guards are scoped to this bucket; unrelated buckets retain their existing policies.
drop policy if exists media_read_guard on storage.objects;
create policy media_read_guard on storage.objects as restrictive for select to anon,authenticated using(bucket_id<>'church-media' or public.has_role('media_editor') or exists(select 1 from public.content where image_url=name and status='published' and published_at<=now()));
drop policy if exists media_insert_guard on storage.objects;
create policy media_insert_guard on storage.objects as restrictive for insert to anon,authenticated with check(bucket_id<>'church-media' or public.has_role('media_editor'));
drop policy if exists media_update_guard on storage.objects;
create policy media_update_guard on storage.objects as restrictive for update to anon,authenticated using(bucket_id<>'church-media' or public.has_role('content_admin')) with check(bucket_id<>'church-media' or public.has_role('content_admin'));
drop policy if exists media_delete_guard on storage.objects;
create policy media_delete_guard on storage.objects as restrictive for delete to anon,authenticated using(bucket_id<>'church-media' or public.has_role('content_admin'));
commit;
