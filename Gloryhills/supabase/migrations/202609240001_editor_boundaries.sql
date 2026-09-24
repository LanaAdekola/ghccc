-- Align direct database access with the website's media-editor scope.
drop policy editor_read on public.content;
create policy editor_read on public.content for select to authenticated using (
 public.has_role('content_admin') or (public.has_role('media_editor') and kind in ('sermons','events','service_times','announcements','gallery_albums','gallery_images','homepage','pages','ministries'))
);
drop policy editor_insert on public.content;
create policy editor_insert on public.content for insert to authenticated with check (
 public.has_role('content_admin') or (public.has_role('media_editor') and kind in ('sermons','events','service_times','announcements','gallery_albums','gallery_images','homepage','pages','ministries'))
);
drop policy editor_update on public.content;
create policy editor_update on public.content for update to authenticated using (
 public.has_role('content_admin') or (public.has_role('media_editor') and kind in ('sermons','events','service_times','announcements','gallery_albums','gallery_images','homepage','pages','ministries'))
) with check (
 public.has_role('content_admin') or (public.has_role('media_editor') and kind in ('sermons','events','service_times','announcements','gallery_albums','gallery_images','homepage','pages','ministries'))
);
drop policy media_admin on storage.objects;
create policy media_staff_read on storage.objects for select to authenticated using(bucket_id='church-media' and public.has_role('media_editor'));
create policy media_staff_insert on storage.objects for insert to authenticated with check(bucket_id='church-media' and public.has_role('media_editor'));
create policy media_manager_update on storage.objects for update to authenticated using(bucket_id='church-media' and public.has_role('content_admin')) with check(bucket_id='church-media' and public.has_role('content_admin'));
create policy media_manager_delete on storage.objects for delete to authenticated using(bucket_id='church-media' and public.has_role('content_admin'));
