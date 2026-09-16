-- Content is consolidated around a typed publication envelope. Private data is separate.
create type public.admin_role as enum ('media_editor','content_admin','super_admin');
create table public.user_roles(user_id uuid primary key references auth.users(id) on delete cascade, role public.admin_role not null default 'media_editor');
alter table public.user_roles enable row level security;

create function public.role_hierarchy(role public.admin_role) returns integer language sql immutable as $$
 select case role
   when 'super_admin' then 3
   when 'content_admin' then 2
   when 'media_editor' then 1
   else 0
 end;
$$;

create function public.has_role(required public.admin_role default 'media_editor') returns boolean language sql stable security definer set search_path = '' as $$
 select exists(
   select 1 from public.user_roles
   where user_id=auth.uid()
   and public.role_hierarchy(role) >= public.role_hierarchy(required)
 );
$$;
revoke all on function public.has_role(public.admin_role) from public;
grant execute on function public.has_role(public.admin_role) to anon,authenticated;
create policy role_read on public.user_roles for select to authenticated using(user_id=auth.uid() or public.has_role('super_admin'));
create policy role_manage on public.user_roles for all to authenticated using(public.has_role('super_admin')) with check(public.has_role('super_admin'));

create table public.content(
 id uuid primary key default gen_random_uuid(),
 kind text not null check(kind in ('homepage','settings','seo','sermons','events','service_times','ministries','announcements','gallery_albums','gallery_images','leadership','giving_methods','giving_campaigns','pages')),
 slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null check(length(title) between 1 and 180),description text not null default '',body text not null default '',
 image_url text,image_alt text,external_url text,starts_at timestamptz,
 status text not null default 'draft' check(status in ('draft','published','archived')),published_at timestamptz,
 display_order integer not null default 0,featured boolean not null default false,
 seo_title text,seo_description text,data jsonb not null default '{}'::jsonb,
 created_by uuid default auth.uid() references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(kind,slug),check(status in ('draft','archived') or published_at is not null),check(image_url is null or length(image_alt)>0)
);
alter table public.content enable row level security;
create policy published_read on public.content for select to anon,authenticated using(status='published' and published_at<=now());
create policy editor_read on public.content for select to authenticated using(public.has_role('media_editor'));
create policy editor_insert on public.content for insert to authenticated with check(
 public.has_role('content_admin')
 or (public.has_role('media_editor') and kind not in ('giving_methods','giving_campaigns','settings'))
);
create policy editor_update on public.content for update to authenticated using(
 public.has_role('content_admin')
 or (public.has_role('media_editor') and kind not in ('giving_methods','giving_campaigns','settings'))
) with check(
 public.has_role('content_admin')
 or (public.has_role('media_editor') and kind not in ('giving_methods','giving_campaigns','settings'))
);
create policy editor_delete on public.content for delete to authenticated using(public.has_role('content_admin'));
create index content_published on public.content(kind,status,display_order,published_at);

create table public.submissions(id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('contact','prayer-request','plan-your-visit','newsletter','event-interest')),name text not null,email text not null,message text not null,consent_at timestamptz not null default now(),created_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '90 days');
alter table public.submissions enable row level security;
create policy submissions_admin_read on public.submissions for select to authenticated using(public.has_role('content_admin'));
create policy submissions_admin_delete on public.submissions for delete to authenticated using(public.has_role('content_admin'));

create table public.rate_limits(key text primary key,count integer not null,expires_at timestamptz not null);
alter table public.rate_limits enable row level security;
create function public.consume_rate_limit(bucket text) returns boolean language plpgsql security definer set search_path = '' as $$
 declare hits integer;
 begin
 insert into public.rate_limits(key,count,expires_at) values(bucket,1,now()+interval '1 hour')
 on conflict(key) do update set count=case when public.rate_limits.expires_at<now() then 1 else public.rate_limits.count+1 end, expires_at=case when public.rate_limits.expires_at<now() then now()+interval '1 hour' else public.rate_limits.expires_at end returning count into hits;
 return hits<=5;
 end;
$$;
revoke all on function public.consume_rate_limit(text) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text) to service_role;

create table public.audit_logs(
 id bigint generated always as identity primary key,
 actor uuid,
 table_name text not null,
 record_id text,
 action text not null,
 content_type text,
 previous_status text,
 new_status text,
 created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
create policy audit_read on public.audit_logs for select to authenticated using(public.has_role('super_admin'));

create function public.audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
 declare
  prev_st text := null;
  new_st text := null;
  c_type text := null;
  act text := TG_OP;
 begin
  if TG_TABLE_NAME = 'content' then
   c_type := coalesce(NEW.kind, OLD.kind);
   prev_st := case when TG_OP != 'INSERT' then OLD.status else null end;
   new_st := case when TG_OP != 'DELETE' then NEW.status else null end;
   if TG_OP = 'INSERT' then
    act := case when NEW.status = 'published' then 'PUBLISH' else 'CREATE' end;
   elsif TG_OP = 'UPDATE' then
    if OLD.status != NEW.status then
     if NEW.status = 'published' and OLD.status = 'archived' then
      act := 'RESTORE';
     elsif NEW.status = 'published' then
      act := 'PUBLISH';
     elsif NEW.status = 'archived' then
      act := 'ARCHIVE';
     elsif NEW.status = 'draft' and OLD.status = 'published' then
      act := 'UNPUBLISH';
     else
      act := 'STATUS_CHANGE';
     end if;
    elsif c_type in ('settings','giving_methods','giving_campaigns') then
     act := 'SENSITIVE_SETTING_CHANGE';
    else
     act := 'EDIT';
    end if;
   elsif TG_OP = 'DELETE' then
    act := 'DELETE';
   end if;
   NEW.updated_at = now();
  elsif TG_TABLE_NAME = 'user_roles' then
   act := 'ROLE_CHANGE';
  end if;

  insert into public.audit_logs(actor,table_name,record_id,action,content_type,previous_status,new_status)
  values(
   auth.uid(),
   TG_TABLE_NAME,
   coalesce(to_jsonb(NEW)->>'id',to_jsonb(OLD)->>'id',to_jsonb(NEW)->>'user_id',to_jsonb(OLD)->>'user_id'),
   act,
   c_type,
   prev_st,
   new_st
  );
  if TG_OP='DELETE' then return OLD; end if;
  return NEW;
 end;
$$;
create trigger content_audit before insert or update or delete on public.content for each row execute function public.audit_change();
create trigger roles_audit before insert or update or delete on public.user_roles for each row execute function public.audit_change();

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('church-media','church-media',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy media_published on storage.objects for select to anon,authenticated using(bucket_id='church-media' and exists(select 1 from public.content where image_url=name and status='published' and published_at<=now()));
create policy media_admin on storage.objects for all to authenticated using(bucket_id='church-media' and public.has_role('media_editor')) with check(bucket_id='church-media' and public.has_role('media_editor'));

grant select on public.content to anon;
grant select,insert,update,delete on public.content,public.user_roles to authenticated;
grant select,delete on public.submissions to authenticated;
grant select on public.audit_logs to authenticated;
grant all on public.content,public.user_roles,public.submissions,public.rate_limits,public.audit_logs to service_role;
grant usage,select on all sequences in schema public to service_role;
