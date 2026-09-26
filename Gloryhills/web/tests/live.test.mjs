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
if(!url || !anon || !service || process.env.LIVE_TEST_PROJECT_URL!==url)throw new Error('Live tests require all credentials and LIVE_TEST_PROJECT_URL matching the explicitly approved disposable project.');
const runId=crypto.randomUUID();
const contentCleanup=[];
const admin=(path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:service,authorization:`Bearer ${service}`,'content-type':'application/json',...init.headers}});
const as=(token,path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:anon,authorization:`Bearer ${token}`,'content-type':'application/json',...init.headers}});
const anonymous=(path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:anon,'content-type':'application/json',...init.headers}});
const password=()=>`Dv-${crypto.randomUUID()}`;
async function attemptContent(token,row){
 const response=await as(token,'/rest/v1/content',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({...row,slug:row.slug+'-'+runId})});
 // Even a forbidden operation that unexpectedly succeeds must be cleaned up.
 if(response.ok){const rows=await response.clone().json();for(const item of rows)if(item.id)contentCleanup.push(item.id);}
 return response;
}

async function user(role){
 const email=`devin-live-check-${role}-${crypto.randomUUID().slice(0,8)}@example.test`,secret=password();
 const created=await (await admin('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password:secret,email_confirm:true})})).json();
 assert.ok(created.id,'Auth user creation succeeded');
 cleanup.push(created.id);
 if(role){const assigned=await admin('/rest/v1/user_roles',{method:'POST',body:JSON.stringify({user_id:created.id,role})});assert.equal(assigned.status,201,'role assigned');}
 const token=(await (await fetch(`${url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:anon,'content-type':'application/json'},body:JSON.stringify({email,password:secret})})).json()).access_token;
 assert.ok(token,'password sign-in returns a session');
 return {id:created.id,email,token};
}

const cleanup=[];
test.after(async()=>{
 for(const id of new Set(contentCleanup)){const r=await admin(`/rest/v1/content?id=eq.${id}`,{method:'DELETE'});assert.ok(r.ok,'temporary content cleanup');}
 for(const id of new Set(cleanup)){const r=await admin(`/auth/v1/admin/users/${id}`,{method:'DELETE'});assert.ok(r.ok,'temporary user cleanup');}
});

test('anonymous users read only published content and approved buckets',async()=>{
 const sermons=await (await anonymous('/rest/v1/content?kind=eq.sermons&select=slug,status')).json();
 assert.ok(Array.isArray(sermons),'anonymous receives a list');
 assert.ok(sermons.every(x=>x.status==='published'),'no drafts or archived rows leaked');

 const roles=await (await anonymous('/rest/v1/user_roles?select=*')).json();
 assert.deepEqual(roles,[],'anonymous cannot list roles');

 const submissions=await (await anonymous('/rest/v1/submissions?select=*')).json();
 assert.deepEqual(submissions,[],'anonymous cannot read private submissions');

 const bucketResponse=await admin('/storage/v1/bucket/church-media');
 assert.equal(bucketResponse.status,200);
 const bucket=await bucketResponse.json();
 assert.equal(bucket.public,false,'church-media exists and is private');
});

test('media editors cannot access giving records, delete content, or view submissions',async()=>{
 const editor=await user('media_editor');cleanup.push(editor.id);
 const draft=await as(editor.token,'/rest/v1/content',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({kind:'sermons',slug:'devin-live-check-draft-'+runId,title:'Draft sermon',status:'draft'})});
 assert.equal(draft.status,201);
 const [row]=await draft.json();contentCleanup.push(row.id);

 assert.equal((await attemptContent(editor.token,{kind:'giving_methods',slug:'devin-live-check-give',title:'Bank'})).status,403);
 await as(editor.token,`/rest/v1/content?id=eq.${row.id}`,{method:'DELETE'});
 assert.equal((await (await admin(`/rest/v1/content?id=eq.${row.id}&select=id`)).json()).length,1,'RLS deletion denial preserves the row even when HTTP returns 204');
 assert.deepEqual(await (await as(editor.token,'/rest/v1/submissions?select=*')).json(),[]);
 // Storage HTTP boundaries require real uploaded objects; covered separately in the controlled rollout.

 const clean=await admin(`/rest/v1/content?id=eq.${row.id}`,{method:'DELETE'});
 assert.ok([200,204].includes(clean.status));
});

test('signed-in users without a role have no admin access',async()=>{
 const none=await user(null);cleanup.push(none.id);
 assert.ok(none.token,'password sign-in returns a session');
 assert.deepEqual(await (await as(none.token,'/rest/v1/submissions?select=*')).json(),[]);
 assert.equal((await attemptContent(none.token,{kind:'sermons',slug:'devin-live-check-norole',title:'x'})).status,403);
});

test('content admins manage content but only super-admins manage roles',async()=>{
 const editor=await user('content_admin');cleanup.push(editor.id);
 const created=await as(editor.token,'/rest/v1/content',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({kind:'service_times',slug:'devin-live-check-service-'+runId,title:'Live check service',status:'draft',data:{location:'Ojodu Berger headquarters',day:'Sunday',start:'08:00',end:'13:00',timezone:'Africa/Lagos'}})});
 assert.equal(created.status,201);
 const [row]=await created.json();contentCleanup.push(row.id);
 assert.equal((await as(editor.token,`/rest/v1/content?id=eq.${row.id}`,{method:'PATCH',body:JSON.stringify({status:'published',published_at:new Date().toISOString()})})).status,204);
 const publicRows=await (await anonymous('/rest/v1/content?select=slug&slug=eq.devin-live-check-service-'+runId)).json();
 assert.equal(publicRows.length,1,'published content becomes publicly readable');
 assert.equal((await as(editor.token,`/rest/v1/content?id=eq.${row.id}`,{method:'PATCH',body:JSON.stringify({status:'draft'})})).status,204);
 assert.deepEqual(await (await anonymous('/rest/v1/content?select=slug&slug=eq.devin-live-check-service-'+runId)).json(),[],'unpublished content disappears from public reads');
 assert.equal((await as(editor.token,'/rest/v1/user_roles',{method:'POST',body:JSON.stringify({user_id:editor.id,role:'super_admin'})})).status,403);

 const owner=await user('super_admin');cleanup.push(owner.id);
 assert.equal((await as(owner.token,`/rest/v1/user_roles?user_id=eq.${editor.id}`,{method:'PATCH',body:JSON.stringify({role:'content_admin'})})).status,204);
 assert.equal((await as(owner.token,'/rest/v1/user_roles?select=user_id,role')).status,200);
 assert.equal((await as(editor.token,'/rest/v1/user_roles?select=user_id,role')).status,200);
});
}
