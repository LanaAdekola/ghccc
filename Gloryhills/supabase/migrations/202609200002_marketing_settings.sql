-- Reuse the existing settings envelope, audit trail and publication controls.
create function public.can_manage_marketing() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_roles where user_id=auth.uid() and role::text in ('marketing_admin','content_admin','super_admin'));
$$;
revoke all on function public.can_manage_marketing() from public;
grant execute on function public.can_manage_marketing() to authenticated;
create policy marketing_read on public.content for select to authenticated using(kind='settings' and slug='marketing' and public.can_manage_marketing());
create policy marketing_insert on public.content for insert to authenticated with check(kind='settings' and slug='marketing' and public.can_manage_marketing());
create policy marketing_update on public.content for update to authenticated using(kind='settings' and slug='marketing' and public.can_manage_marketing()) with check(kind='settings' and slug='marketing' and public.can_manage_marketing());
-- IDs are public identifiers; integrations remain off until an administrator enables them.
insert into public.content(kind,slug,title,status,published_at,data) values
('settings','marketing','Marketing & Analytics','published',now(),'{"ga_enabled":"false","ga_id":"G-DDLP68EB2M","adsense_enabled":"false","adsense_id":"ca-pub-5953963705871784","gtm_enabled":"false","gtm_id":"","meta_enabled":"false","meta_id":"","ads_enabled":"false","ads_id":"","ads_label":""}')
on conflict(kind,slug) do nothing;
