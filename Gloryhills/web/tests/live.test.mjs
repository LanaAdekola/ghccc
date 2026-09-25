// Live Supabase checks. Requires explicit RUN_LIVE_TESTS=true opt-in and service-role key.
// Creates temporary Auth users with the "devin-live-check" prefix and removes them afterwards.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';

const envPath = new URL('../.env.local', import.meta.url);
const explicitlyOptedIn = process.env.RUN_LIVE_TESTS === 'true';

if (!explicitlyOptedIn) {
  test('Live Supabase mutation tests (skipped: requires RUN_LIVE_TESTS=true opt-in)', {skip: 'Production-connected tests require explicit RUN_LIVE_TESTS=true opt-in'}, () => {});
} else if (!existsSync(envPath) && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  test('Live Supabase mutation tests (skipped: credentials not provided)', {skip: 'web/.env.local or SUPABASE_SERVICE_ROLE_KEY not present'}, () => {});
} else {
  runLiveTests();
}

function runLiveTests() {
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const at = line.indexOf('=');
      if (at > 0 && !line.startsWith('#')) process.env[line.slice(0, at)] ??= line.slice(at + 1);
    }
  }
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin=(path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:service,authorization:`Bearer ${service}`,'content-type':'application/json',...init.headers}});
const as=(token,path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:anon,authorization:`Bearer ${token}`,'content-type':'application/json',...init.headers}});
const anonymous=(path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:anon,'content-type':'application/json',...init.headers}});
const password=()=>`Dv-${crypto.randomUUID()}`;
async function user(role){
 const email=`devin-live-check-${role}-${crypto.randomUUID().slice(0,8)}@example.test`,secret=password();
 const created=await (await admin('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password:secret,email_confirm:true})})).json();
 if(role) await admin('/rest/v1/user_roles',{method:'POST',body:JSON.stringify({user_id:created.id,role})});
 const token=(await (await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:anon,'content-type':'application/json'},body:JSON.stringify({email,password:secret})})).json()).access_token;
 return {id:created.id,email,token};
}

const cleanup=[];
test.after(async()=>{for(const id of cleanup) await admin(`/auth/v1/admin/users/${id}`,{method:'DELETE'});});

test('anonymous users read only published content and approved buckets',async()=>{
 const sermons=await (await anonymous('/rest/v1/content?kind=eq.sermons&select=slug,status')).json();
 assert.ok(Array.isArray(sermons),'anonymous receives a list');
 assert.ok(sermons.every(x=>x.status==='published'),'no drafts or archived rows leaked');

 const roles=await (await anonymous('/rest/v1/user_roles?select=*')).json();
 assert.deepEqual(roles,[],'anonymous cannot list roles');

 const submissions=await (await anonymous('/rest/v1/submissions?select=*')).json();
 assert.deepEqual(submissions,[],'anonymous cannot read private submissions');

 const buckets=await (await anonymous('/storage/v1/bucket')).json();
 assert.ok(Array.isArray(buckets),'bucket endpoint responds');
 assert.ok(!buckets.some(b=>b.id==='church-media'&&b.public),'church-media bucket is private');
});

test('media editors cannot access giving records, delete content, or view submissions',async()=>{
 const editor=await user('media_editor');cleanup.push(editor.id);
 const draft=await as(editor.token,'/rest/v1/content',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({kind:'sermons',slug:'devin-live-check-draft',title:'Draft sermon',status:'draft'})});
 assert.equal(draft.status,201);
 const [row]=await draft.json();

 assert.equal((await as(editor.token,'/rest/v1/content',{method:'POST',body:JSON.stringify({kind:'giving_methods',slug:'devin-live-check-give',title:'Bank'})})).status,403);
 assert.equal((await as(editor.token,`/rest/v1/content?id=eq.${row.id}`,{method:'DELETE'})).status,403);
 assert.deepEqual(await (await as(editor.token,'/rest/v1/submissions?select=*')).json(),[]);
 assert.equal((await as(editor.token,`/storage/v1/object/church-media/${crypto.randomUUID()}.jpg`,{method:'DELETE'})).status,400);

 const clean=await admin(`/rest/v1/content?id=eq.${row.id}`,{method:'DELETE'});
 assert.ok([200,204].includes(clean.status));
});

test('signed-in users without a role have no admin access',async()=>{
 const none=await user(null);cleanup.push(none.id);
 assert.ok(none.token,'password sign-in returns a session');
 assert.deepEqual(await (await as(none.token,'/rest/v1/submissions?select=*')).json(),[]);
 assert.equal((await as(none.token,'/rest/v1/content',{method:'POST',body:JSON.stringify({kind:'sermons',slug:'devin-live-check-norole',title:'x'})})).status,403);
});

test('content admins manage content but only super-admins manage roles',async()=>{
 const editor=await user('content_admin');cleanup.push(editor.id);
 const created=await as(editor.token,'/rest/v1/content',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({kind:'service_times',slug:'devin-live-check-service',title:'Live check service',status:'draft',data:{location:'Ojodu Berger headquarters',day:'Sunday',start:'08:00',end:'13:00',timezone:'Africa/Lagos'}})});
 assert.equal(created.status,201);
 const [row]=await created.json();
 assert.equal((await as(editor.token,`/rest/v1/content?id=eq.${row.id}`,{method:'PATCH',body:JSON.stringify({status:'published',published_at:new Date().toISOString()})})).status,204);
 const publicRows=await (await anonymous('/rest/v1/content?select=slug&slug=eq.devin-live-check-service')).json();
 assert.equal(publicRows.length,1,'published content becomes publicly readable');
 assert.equal((await as(editor.token,`/rest/v1/content?id=eq.${row.id}`,{method:'PATCH',body:JSON.stringify({status:'draft'})})).status,204);
 assert.deepEqual(await (await anonymous('/rest/v1/content?select=slug&slug=eq.devin-live-check-service')).json(),[],'unpublished content disappears from public reads');
 assert.equal((await as(editor.token,'/rest/v1/user_roles',{method:'POST',body:JSON.stringify({user_id:editor.id,role:'super_admin'})})).status,403);

 const owner=await user('super_admin');cleanup.push(owner.id);
 assert.equal((await as(owner.token,`/rest/v1/user_roles?user_id=eq.${editor.id}`,{method:'PATCH',body:JSON.stringify({role:'content_admin'})})).status,204);
 assert.equal((await as(owner.token,'/rest/v1/user_roles?select=user_id,role')).status,200);
 assert.equal((await as(editor.token,'/rest/v1/user_roles?select=user_id,role')).status,200);
});
}
