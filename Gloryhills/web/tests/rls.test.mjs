import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';

test('PostgreSQL RLS: media_editor, content_admin, super_admin, and anonymous boundaries', async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create schema storage;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    grant usage on schema public,auth,storage to anon,authenticated,service_role;
    grant execute on function auth.uid() to anon,authenticated;
  `);

  await db.exec(await readFile('../supabase/migrations/202609150001_initial.sql', 'utf8'));
  await db.exec(await readFile('../supabase/migrations/202609240001_editor_boundaries.sql','utf8'));

  await db.exec(`
    grant select,insert,update,delete on all tables in schema public to anon,authenticated,service_role;
    grant select,insert,update,delete on storage.objects to anon,authenticated;
    insert into auth.users values
      ('00000000-0000-0000-0000-000000000001'),
      ('00000000-0000-0000-0000-000000000002'),
      ('00000000-0000-0000-0000-000000000003'),
      ('00000000-0000-0000-0000-000000000004');
    insert into public.user_roles values
      ('00000000-0000-0000-0000-000000000001','media_editor'),
      ('00000000-0000-0000-0000-000000000002','content_admin'),
      ('00000000-0000-0000-0000-000000000003','super_admin');
    insert into content(kind,slug,title,status,published_at,image_url,image_alt) values
      ('sermons','public','Public','published',now(),'public.jpg','Image'),
      ('sermons','draft','Draft','draft',null,'draft.jpg','Draft image'),
      ('sermons','future','Future','published',now()+interval '1 day',null,null);
    insert into submissions(kind,name,email,message) values
      ('contact','Private name','private@example.test','Private message');
    insert into storage.objects(bucket_id,name) values
      ('church-media','public.jpg'),
      ('church-media','draft.jpg');
  `);

  // 1. Anonymous user checks
  await db.exec(`set role anon`);
  assert.deepEqual((await db.query('select title from content')).rows, [{title: 'Public'}]);
  assert.equal((await db.query('select * from submissions')).rows.length, 0);
  assert.equal((await db.query('select * from user_roles')).rows.length, 0);
  assert.deepEqual((await db.query('select name from storage.objects')).rows, [{name: 'public.jpg'}]);
  await assert.rejects(db.exec(`insert into content(kind,slug,title) values('sermons','bad','Bad')`));
  await assert.rejects(db.exec(`select public.consume_rate_limit('bypass')`));

  // 2. Authenticated user without role
  await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000004',false)`);
  assert.equal((await db.query('select * from content')).rows.length, 1);
  assert.equal((await db.query('select * from submissions')).rows.length, 0);
  await assert.rejects(db.exec(`insert into user_roles values('00000000-0000-0000-0000-000000000004','super_admin')`));

  // 3. Media editor (00000000-0000-0000-0000-000000000001)
  await db.exec(`select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false)`);
  assert.equal((await db.query('select * from content')).rows.length, 3);
  // Media editor CANNOT see private submissions
  assert.equal((await db.query('select * from submissions')).rows.length, 0);
  assert.equal((await db.query('select * from storage.objects')).rows.length, 2);
  // Media editor CAN insert sermons
  await db.exec(`insert into content(kind,slug,title,status) values('sermons','editor-sermon','Editor Sermon','draft')`);
  // Media editor CANNOT insert giving_methods
  await assert.rejects(db.exec(`insert into content(kind,slug,title,status) values('giving_methods','hack','Hack','draft')`));
  await assert.rejects(db.exec(`insert into content(kind,slug,title) values('seo','escape','Escape')`));
  await db.exec(`delete from storage.objects where name='draft.jpg'`);
  assert.equal((await db.query(`select name from storage.objects where name='draft.jpg'`)).rows.length,1);
  // Media editor CANNOT permanently delete content (RLS policy protects content)
  await db.query(`delete from content where slug='editor-sermon'`);
  assert.equal((await db.query(`select * from content where slug='editor-sermon'`)).rows.length, 1);
  // Media editor CANNOT read audit logs or modify roles
  await assert.rejects(db.exec(`insert into user_roles values('00000000-0000-0000-0000-000000000004','media_editor')`));
  assert.equal((await db.query('select * from audit_logs')).rows.length, 0);

  // 4. Content admin (00000000-0000-0000-0000-000000000002)
  await db.exec(`select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000002',false)`);
  // Content admin CAN view private submissions
  assert.equal((await db.query('select * from submissions')).rows.length, 1);
  // Content admin CAN permanently delete content
  await db.exec(`delete from content where slug='editor-sermon'`);
  // Content admin CANNOT modify roles or read audit logs
  await assert.rejects(db.exec(`insert into user_roles values('00000000-0000-0000-0000-000000000004','media_editor')`));
  assert.equal((await db.query('select * from audit_logs')).rows.length, 0);

  // 5. Super admin (00000000-0000-0000-0000-000000000003)
  await db.exec(`select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',false)`);
  // Super admin CAN modify roles
  await db.exec(`insert into user_roles values('00000000-0000-0000-0000-000000000004','media_editor')`);
  assert.equal((await db.query('select * from user_roles')).rows.length, 4);
  // Super admin CAN read audit logs
  const logs = await db.query('select * from audit_logs');
  assert.ok(logs.rows.length > 0);

  // 6. Anonymous storage check after unpublish
  await db.exec(`update content set status='draft' where slug='public'`);
  await db.exec(`reset role;set role anon`);
  assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
  assert.equal((await db.query('select * from content')).rows.length, 0);

  // 7. Rate limit test with service role
  await db.exec(`reset role;set role service_role`);
  for (let i = 0; i < 5; i++) {
    assert.equal((await db.query("select consume_rate_limit('test') as ok")).rows[0].ok, true);
  }
  assert.equal((await db.query("select consume_rate_limit('test') as ok")).rows[0].ok, false);

  await db.close();
});
