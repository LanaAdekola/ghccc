// Live Supabase checks. Requires web/.env.local with the project URL, anon key and service-role key.
// Creates temporary Auth users with the "devin-live-check" prefix and removes them afterwards.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const line of readFileSync(new URL('../.env.local',import.meta.url),'utf8').split('\n')){
 const at=line.indexOf('=');
 if(at>0&&!line.startsWith('#'))process.env[line.slice(0,at)]??=line.slice(at+1);
}
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin=(path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:service,authorization:`Bearer ${service}`,'content-type':'application/json',...init.headers}});
const as=(token,path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:anon,authorization:`Bearer ${token}`,'content-type':'application/json',...init.headers}});
const anonymous=(path,init={})=>fetch(`${url}${path}`,{...init,headers:{apikey:anon,'content-type':'application/json',...init.headers}});
const password=()=>`Dv-${crypto.randomUUID()}`;
async function user(role){
 const email=`devin-live-check-${role}-${crypto.randomUUID().slice(0,8)}@example.test`,secret=password();
 const created=await (await admin('/auth/v1/admin/users',{method:'POST',body:JSON.stringify({email,password:secret,email_confirm:true})})).json();
 if(role)await admin('/rest/v1/user_roles',{method:'POST',body:JSON.stringify({user_id:created.id,role})});
 const session=await (await anonymous('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password:secret})})).json();
 return {id:created.id,email,token:session.access_token};
}
const cleanup=[];
test.after(async()=>{for(const id of cleanup){await admin(`/rest/v1/user_roles?user_id=eq.${id}`,{method:'DELETE'});await admin(`/auth/v1/admin/users/${id}`,{method:'DELETE'});}
 await admin('/rest/v1/content?slug=like.devin-live-check*',{method:'DELETE'});});

test('anonymous requests reach only published, non-future content',async()=>{
 const future=await admin('/rest/v1/content',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({kind:'announcements',slug:'devin-live-check-future',title:'Future',status:'published',published_at:'2099-01-01T00:00:00Z'})});
 assert.equal(future.status,201);
 await admin('/rest/v1/content',{method:'POST',body:JSON.stringify({kind:'announcements',slug:'devin-live-check-draft',title:'Draft',status:'draft'})});
 const visible=await (await anonymous('/rest/v1/content?select=slug,status')).json();
 assert.equal(visible.some(x=>x.slug.startsWith('devin-live-check')),false);
 assert.equal(visible.every(x=>x.status==='published'),true);
});

test('anonymous requests cannot read or write protected data',async()=>{
 for(const table of ['user_roles','submissions','rate_limits','audit_logs'])
  assert.deepEqual(await (await anonymous(`/rest/v1/${table}?select=*`)).json(),[],table);
 assert.equal((await anonymous('/rest/v1/content',{method:'POST',body:JSON.stringify({kind:'sermons',slug:'devin-live-check-anon',title:'x'})})).status,401);
 assert.equal((await anonymous('/rest/v1/submissions',{method:'POST',body:JSON.stringify({kind:'contact',name:'a',email:'a@b.co',message:'m'})})).ok,false);
 assert.equal((await anonymous('/rest/v1/user_roles',{method:'POST',body:JSON.stringify({user_id:crypto.randomUUID(),role:'super_admin'})})).status,401);
 assert.equal((await anonymous('/rest/v1/rpc/consume_rate_limit',{method:'POST',body:JSON.stringify({bucket:'devin-live-check'})})).status,401);
});

test('storage bucket stays private for anonymous requests',async()=>{
 const buckets=await (await admin('/storage/v1/bucket')).json();
 assert.equal(buckets.find(x=>x.name==='church-media').public,false);
 assert.deepEqual(await (await anonymous('/storage/v1/object/list/church-media',{method:'POST',body:JSON.stringify({prefix:'',limit:5})})).json(),[]);
 assert.equal((await anonymous('/storage/v1/object/church-media/devin-live-check.png',{method:'POST',headers:{'content-type':'image/png'},body:'x'})).ok,false);
});

test('signed-in users without a role have no admin access',async()=>{
 const none=await user(null);cleanup.push(none.id);
 assert.ok(none.token,'password sign-in returns a session');
 assert.deepEqual(await (await as(none.token,'/rest/v1/submissions?select=*')).json(),[]);
 assert.equal((await as(none.token,'/rest/v1/content',{method:'POST',body:JSON.stringify({kind:'sermons',slug:'devin-live-check-norole',title:'x'})})).status,403);
});

test('admins manage content but only super-admins manage roles',async()=>{
 const editor=await user('admin');cleanup.push(editor.id);
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
 assert.equal((await as(owner.token,`/rest/v1/user_roles?user_id=eq.${editor.id}`,{method:'PATCH',body:JSON.stringify({role:'admin'})})).status,204);
 assert.equal((await as(owner.token,'/rest/v1/user_roles?select=user_id,role')).status,200);
 assert.equal((await as(editor.token,'/rest/v1/user_roles?select=user_id,role')).status,200);
});
