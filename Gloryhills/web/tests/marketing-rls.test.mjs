import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
test('marketing admin may persist marketing only, cannot escalate roles or read private requests',async()=>{
 const db=new PGlite();
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


 for(const file of ['202609150001_initial.sql','202609200001_marketing_role.sql','202609200002_marketing_settings.sql'])await db.exec(await readFile('../supabase/migrations/'+file,'utf8'));
 await db.exec(`insert into auth.users values ('00000000-0000-0000-0000-000000000009');insert into user_roles values('00000000-0000-0000-0000-000000000009','marketing_admin');insert into content(kind,slug,title) values('settings','private-settings','Private'),('sermons','private-sermon','Draft');insert into submissions(kind,name,email,message) values('contact','Private','private@example.test','Private');set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000009',false);`);
 assert.equal((await db.query('select * from submissions')).rows.length,0);
 assert.equal((await db.query('select * from content')).rows.length,1);
 await db.exec(`update content set data=jsonb_set(data,'{ga_enabled}','"true"') where slug='marketing'`);
 assert.equal((await db.query("select data->>'ga_enabled' as enabled from content where slug='marketing'")).rows[0].enabled,'true');
 await assert.rejects(db.exec(`insert into content(kind,slug,title) values('settings','unauthorized','No')`));
 assert.equal((await db.query("update content set title='No' where slug='private-settings' returning id")).rows.length,0);
 assert.equal((await db.query("update user_roles set role='super_admin' returning user_id")).rows.length,0);
 await assert.rejects(db.exec(`update content set slug='escaped' where slug='marketing'`));
 await db.exec(`reset role;set role anon;`);
 assert.equal((await db.query("select data->>'ga_enabled' as enabled from content where slug='marketing'")).rows[0].enabled,'true');
 await assert.rejects(db.exec(`update content set title='No' where slug='marketing'`));
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000009',false);`);
 assert.equal((await db.query("select data->>'ga_enabled' as enabled from content where slug='marketing'")).rows[0].enabled,'true');await db.close();
});
