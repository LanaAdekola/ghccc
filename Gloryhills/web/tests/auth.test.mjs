import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTS,redirect} from './harness.mjs';
import * as policy from '../lib/auth-policy.mjs';
const checkRedirect=path=>e=>e.destination===path;
test('real login action accepts supported users and rejects absent/unsupported roles',async()=>{
 for(const role of ['super_admin','content_admin','media_editor','marketing_admin',null,'constructor','admin']){
  let signedOut=false;
  const db={auth:{signInWithPassword:async()=>({data:{user:{id:'local'}},error:null}),signOut:async()=>{signedOut=true;}},from:()=>({select:()=>({eq:()=>({single:async()=>({data:role?{role}:null})})})})};
  const {login}=loadTS('app/admin/login/actions.ts',{'next/navigation':{redirect},'@/lib/supabase':{serverDB:async()=>db},'@/lib/content':{configured:()=>true},'@/lib/auth-policy.mjs':policy});
  const form=new FormData();form.set('email','local@example.test');form.set('password','local-test-only');
  const supported=policy.isAdminRole(role);
  await assert.rejects(login(form),checkRedirect(supported?'/admin':'/admin/login?error=access'));
  assert.equal(signedOut,!supported);
 }
});
test('real authorization verifies user and exact role; cookie adapter persists session writes',async()=>{
 let user={id:'local'},role='media_editor',writes=[];
 const jar={getAll:()=>[{name:'session',value:'local-test-only'}],set:(...args)=>writes.push(args)};
 let adapter;
 const db={auth:{getUser:async()=>({data:{user}})},from:()=>({select:()=>({eq:()=>({single:async()=>({data:role?{role}:null})})})})};
 const {requireAdmin,serverDB}=loadTS('lib/supabase.ts',{'server-only':{},'@supabase/ssr':{createServerClient:(_u,_k,options)=>{adapter=options.cookies;return db;}},'next/headers':{cookies:async()=>jar},'next/navigation':{redirect},'./content':{configured:()=>true},'./auth-policy.mjs':policy});
 assert.equal((await requireAdmin()).role,'media_editor');
 await assert.rejects(requireAdmin('content_admin'),checkRedirect('/admin?error=forbidden'));
 role='marketing_admin';await assert.rejects(requireAdmin(),checkRedirect('/admin/marketing'));
 role='constructor';await assert.rejects(requireAdmin(),checkRedirect('/admin/login?error=access'));
 role=null;await assert.rejects(requireAdmin(),checkRedirect('/admin/login?error=access'));
 user=null;await assert.rejects(requireAdmin(),checkRedirect('/admin/login'));
 await serverDB();assert.equal(adapter.getAll()[0].name,'session');adapter.setAll([{name:'refreshed',value:'local-only',options:{httpOnly:true}}]);assert.equal(writes[0][0],'refreshed');
});
test('PKCE callback uses canonical destination, rejects attacker origin before code exchange',async()=>{
 let exchanged=0;
 class NextResponse extends Response {static redirect(url){return new NextResponse(null,{status:307,headers:{location:String(url)}});}}
 const {GET}=loadTS('app/auth/callback/route.ts',{'next/server':{NextResponse},'@/lib/supabase':{serverDB:async()=>({auth:{exchangeCodeForSession:async()=>{exchanged++;return {error:null};}}})},'@/lib/auth-policy.mjs':{recoveryOrigin:()=>policy.recoveryOrigin({NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:policy.PRODUCTION_ORIGIN})}});
 const request=url=>({nextUrl:new URL(url),url});
 let response=await GET(request('https://attacker.test/auth/callback?code=local-only'));assert.equal(response.status,400);assert.equal(exchanged,0);
 response=await GET(request(policy.PRODUCTION_ORIGIN+'/auth/callback?code=local-only&next=https://attacker.test'));
 assert.equal(response.headers.get('location'),policy.PRODUCTION_ORIGIN+'/admin/reset-password');assert.equal(exchanged,1);assert.equal(response.headers.get('cache-control'),'no-store');
 response=await GET(request(policy.PRODUCTION_ORIGIN+'/auth/callback'));assert.ok(response.headers.get('location').endsWith('?error=expired'));
});
test('proxy refresh writes cookies to both request and response, marks response private',async()=>{
 const requestWrites=[],responseWrites=[];
 const response={cookies:{set:(...x)=>responseWrites.push(x)},headers:new Headers()};let refreshed=false;
 const {proxy}=loadTS('proxy.ts',{'@supabase/ssr':{createServerClient:(_u,_k,{cookies})=>({auth:{getUser:async()=>{refreshed=true;cookies.setAll([{name:'session',value:'local-only',options:{httpOnly:true}}]);}}})},'next/server':{NextResponse:{next:()=>response}}},{process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://local.example.test',NEXT_PUBLIC_SUPABASE_ANON_KEY:'local-only'}}});
 const result=await proxy({cookies:{getAll:()=>[],set:(...x)=>requestWrites.push(x)}});
 assert.equal(refreshed,true);assert.equal(requestWrites.length,1);assert.equal(responseWrites.length,1);assert.equal(result.headers.get('Cache-Control'),'private, no-store');
});
test('media route keeps RLS denials private, rejects traversal and serves verified raster bytes',async()=>{
 const media=await import('../lib/media-security.mjs');let downloads=0,deny=false;
 const {GET}=loadTS('app/api/media/[path]/route.ts',{'@/lib/supabase':{serverDB:async()=>({storage:{from:()=>({download:async()=>{downloads++;return deny?{error:true}:{data:new Blob([new Uint8Array([137,80,78,71,13,10,26,10])],{type:'text/html'})};}})}})},'@/lib/content':{configured:()=>true},'@/lib/media-security.mjs':media});
 const path='00000000-0000-0000-0000-000000000001.png';
 let result=await GET(null,{params:Promise.resolve({path:'../'+path})});assert.equal(result.status,404);assert.equal(downloads,0);
 result=await GET(null,{params:Promise.resolve({path})});assert.equal(result.status,200);assert.equal(result.headers.get('content-type'),'image/png');assert.equal(result.headers.get('cache-control'),'private, no-store');assert.equal(result.headers.get('x-content-type-options'),'nosniff');
 deny=true;result=await GET(null,{params:Promise.resolve({path})});assert.equal(result.status,404);assert.equal(result.headers.get('cache-control'),'private, no-store');
});
