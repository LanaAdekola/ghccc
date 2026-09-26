import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const directory=new URL('../../supabase/migrations/',import.meta.url);
const files=(await readdir(directory)).filter(x=>x.endsWith('.sql')).sort();
const corrective=files.at(-1);
async function foundation(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create schema storage;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 grant usage on schema public,auth,storage to anon,authenticated,service_role;
 grant execute on function auth.uid() to anon,authenticated;`);
 return db;
}
async function apply(db,file){await db.exec(await readFile(new URL(file,directory),'utf8'));}
const ids={media_editor:1,marketing_admin:2,content_admin:3,super_admin:4,none:5};
const uid=role=>`00000000-0000-0000-0000-${String(ids[role]).padStart(12,'0')}`;
async function as(db,role){await db.exec(`reset role;set role ${role==='anon'?'anon':'authenticated'};select set_config('request.jwt.claim.sub','${role==='anon'?'':uid(role)}',false)`);}
async function count(db,sql){return (await db.query(sql)).rows.length;}
async function seed(db){
 for(const role of Object.keys(ids)){
  await db.exec(`insert into auth.users values('${uid(role)}')`);
  if(role!=='none')await db.exec(`insert into user_roles values('${uid(role)}','${role}')`);
 }
 await db.exec(`insert into content(kind,slug,title,status,published_at,image_url,image_alt) values
 ('sermons','public','Public','published',now(),'public.jpg','Public artwork'),
 ('sermons','draft','Draft','draft',null,'draft.jpg','Draft artwork'),
 ('sermons','archived','Archived','archived',null,null,null),
 ('sermons','future','Future','published',now()+interval '1 day',null,null),
 ('giving_methods','private-bank','Private bank','draft',null,null,null),
 ('giving_methods','public-bank','Public bank','published',now(),null,null);
 insert into submissions(kind,name,email,message) values('prayer-request','Private','private@example.test','Pastoral request');
 insert into storage.objects(bucket_id,name) values('church-media','public.jpg'),('church-media','draft.jpg');
 -- Deliberately broad grants and policies emulate drift; restrictive guards must still hold.
 grant select,insert,update,delete on all tables in schema public to anon,authenticated;
 grant select,insert,update,delete on storage.objects to anon,authenticated;
 create policy unexpected_content on content for all to anon,authenticated using(true) with check(true);
 create policy unexpected_storage on storage.objects for all to anon,authenticated using(true) with check(true);
 create policy unexpected_submissions on submissions for all to anon,authenticated using(true) with check(true);
 create policy unexpected_roles on user_roles for all to anon,authenticated using(true) with check(true);
 create policy unexpected_audit on audit_logs for all to anon,authenticated using(true) with check(true);`);
}
async function boundaries(db){
 for(const role of ['anon','none','marketing_admin']){
  await as(db,role);
  assert.equal(await count(db,"select * from content where slug in ('draft','archived','future','private-bank')"),0,role);
  assert.equal(await count(db,"select * from content where slug='public-bank'"),1,role+' public giving');
  assert.equal(await count(db,"select * from content where slug='marketing'"),1,role+' loader settings');
  assert.equal(await count(db,'select * from submissions'),0,role);
  assert.equal(await count(db,'select * from audit_logs'),0,role);
  assert.equal(await count(db,"select * from storage.objects where name='draft.jpg'"),0,role);
  await assert.rejects(db.exec("insert into content(kind,slug,title) values('sermons','escape','Escape')"));
  await assert.rejects(db.exec("insert into storage.objects(bucket_id,name) values('church-media','escape.jpg')"));
  assert.equal(await count(db,"delete from storage.objects where name='public.jpg' returning *"),0);
  assert.equal(await count(db,"update content set title='Escape' where slug='public' returning *"),0);
 }
 await as(db,'media_editor');
 for(const kind of ['sermons','events','service_times','announcements','gallery_albums','gallery_images','homepage','pages','ministries']){
  await db.exec(`insert into content(kind,slug,title) values('${kind}','editor-${kind.replaceAll('_','-')}','Allowed')`);
  assert.equal(await count(db,`update content set title='Edited' where slug='editor-${kind.replaceAll('_','-')}' returning *`),1);
 }
 for(const kind of ['giving_methods','giving_campaigns','settings','seo','leadership'])await assert.rejects(db.exec(`insert into content(kind,slug,title) values('${kind}','forbidden-${kind.replaceAll('_','-')}','Denied')`));
 assert.equal(await count(db,"update content set title='Hijack' where slug='public-bank' returning *"),0);
 await assert.rejects(db.exec("update content set kind='giving_methods' where slug='draft'"));
 assert.equal(await count(db,"delete from content where slug='draft' returning *"),0);
 assert.equal(await count(db,'select * from submissions'),0);
 await db.exec("insert into storage.objects(bucket_id,name) values('church-media','editor.jpg')");
 assert.equal(await count(db,"update storage.objects set name='escape.jpg' where name='draft.jpg' returning *"),0);
 assert.equal(await count(db,"delete from storage.objects where name='draft.jpg' returning *"),0);
 await as(db,'marketing_admin');
 await db.exec(`update content set data=jsonb_set(data,'{gtm_enabled}','"true"') where slug='marketing'`);
 assert.equal((await db.query("select data->>'gtm_enabled' as enabled from content where slug='marketing'")).rows[0].enabled,'true');
 await assert.rejects(db.exec("update content set slug='escaped' where slug='marketing'"));
 assert.equal(await count(db,"delete from content where slug='marketing' returning *"),0);
 assert.equal(await count(db,"update user_roles set role='super_admin' returning *"),0);
 for(const role of ['content_admin','super_admin']){
  await as(db,role);
  assert.equal(await count(db,'select * from submissions'),1);
  await db.exec(`insert into content(kind,slug,title) values('giving_methods','${role.replaceAll('_','-')}','Allowed')`);
  assert.equal(await count(db,`delete from content where slug='${role.replaceAll('_','-')}' returning *`),1);
  assert.equal(await count(db,"update storage.objects set name=name where name='draft.jpg' returning *"),1);
  assert.equal(await count(db,'select * from audit_logs')>0,role==='super_admin');
  await assert.rejects(db.exec("insert into submissions(kind,name,email,message) values('contact','Denied','denied@example.test','Denied')"));
 }
 await as(db,'content_admin');
 assert.equal(await count(db,"update user_roles set role='super_admin' returning *"),0);
 assert.equal(await count(db,"delete from storage.objects where name='editor.jpg' returning *"),1);
 await as(db,'super_admin');
 await db.exec(`insert into user_roles values('${uid('none')}','media_editor')`);
 assert.equal(await count(db,'delete from audit_logs returning *'),0);
 assert.equal(await count(db,"update audit_logs set action='FORGED' returning *"),0);
 await as(db,'anon');
 assert.equal(await count(db,"select * from storage.objects where name='public.jpg'"),1);
 await as(db,'content_admin');
 await db.exec("update content set status='draft',published_at=null where slug='public'");
 await as(db,'anon');
 assert.equal(await count(db,"select * from storage.objects where name='public.jpg'"),0,'unpublish revokes new downloads');
 await as(db,'super_admin');
 for(const alt of ['null',"''","'  '","'photo.jpg'"])await assert.rejects(db.exec(`insert into content(kind,slug,title,image_url,image_alt) values('sermons','bad-alt','Bad','photo.jpg',${alt})`));
 await db.exec(`insert into content(kind,slug,title,image_url,image_alt,data) values('sermons','decorative','Decorative','photo.jpg','','{"is_decorative":"true"}')`);
 await assert.rejects(db.exec("update content set data='{}' where slug='decorative'"));
 await assert.rejects(db.exec("update content set image_alt='Not empty' where slug='decorative'"));
 await db.exec('reset role');
}
test('fresh database: full ordered migration chain and all final role/storage boundaries',async()=>{
 const db=await foundation();try{
  for(const file of files)await apply(db,file);
  await seed(db);await boundaries(db);
  const bucket=(await db.query("select * from storage.buckets where id='church-media'")).rows[0];
  assert.equal(bucket.public,false);assert.equal(Number(bucket.file_size_limit),5242880);
 }finally{await db.close();}
});
test('upgrade: preserve invalid legacy rows, reconcile partial policies, repeat correction safely',async()=>{
 const db=await foundation();try{
  for(const file of files.slice(0,-1))await apply(db,file);
  await db.exec("insert into content(kind,slug,title,image_url,image_alt) values('sermons','legacy','Preserve me','legacy.jpg',null);drop policy media_manager_delete on storage.objects;update storage.buckets set public=true where id='church-media'");
  await db.exec("alter table content add constraint custom_image_limit check(image_url is null or length(image_alt)<301)");
  await apply(db,corrective);await apply(db,corrective);
  assert.equal(await count(db,"select * from pg_constraint where conname='custom_image_limit'"),1,'unrelated image checks preserved');
  assert.equal(await count(db,"select * from content where slug='legacy'"),1);
  assert.equal((await db.query("select convalidated from pg_constraint where conname='content_image_alt_safe'")).rows[0].convalidated,false);
  await assert.rejects(db.exec("update content set title='Still invalid' where slug='legacy'"));
  await db.exec("update content set image_alt='Legacy church photograph' where slug='legacy'");
  await apply(db,corrective);
  assert.equal((await db.query("select convalidated from pg_constraint where conname='content_image_alt_safe'")).rows[0].convalidated,true);
  await seed(db);await boundaries(db);
 }finally{await db.close();}
});
