import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTS} from './harness.mjs';
import * as events from '../lib/events.mjs';
import * as runtime from '../lib/marketing-runtime.mjs';
function setup(path='/',consent=null){
 const elements=new Map(),listeners=new Map(),values=new Map();if(consent)values.set('ghcc-consent',consent);
 let reloads=0,effect,cleanup;
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
 const window={location:{pathname:path,hostname:'www.ghccglobal.com',search:'',reload(){reloads++;}},addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k),dispatchEvent:e=>listeners.get(e.type)?.(e)};
 const document={getElementById:k=>elements.get(k),createElement:()=>({remove(){elements.delete(this.id);}}),head:{append(el){elements.set(el.id,el);}},addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
 globalThis.window=window;globalThis.document=document;
 const analytics=loadTS('components/analytics.tsx',{'react':{useEffect:f=>{effect=f;}},'next/navigation':{usePathname:()=>path},'@/lib/marketing-runtime':runtime,'@/lib/events.mjs':events},{window,document,localStorage:storage,URLSearchParams,Event,process:{env:{NODE_ENV:'production'}}});
 analytics.default({config:{gtm_enabled:'true',gtm_id:'GTM-LOCAL123'}});cleanup=effect();
 return {navigate(next){cleanup?.();path=next;window.location.pathname=next;analytics.default({config:{gtm_enabled:'true',gtm_id:'GTM-LOCAL123'}});cleanup=effect();},analytics,window,elements,listeners,storage,get reloads(){return reloads;},finish(){cleanup?.();delete globalThis.window;delete globalThis.document;}};
}
test('real analytics effect: no loader before consent, accept loads once, revoke reloads',()=>{
 const t=setup();try{
  assert.equal(t.elements.size,0);
  t.analytics.updateConsentState(true);assert.equal(t.elements.size,1);
  t.analytics.updateConsentState(true);assert.equal(t.elements.size,1);
  assert.equal(t.window.dataLayer.filter(x=>x.event==='page_view').length,1);
  t.analytics.updateConsentState(false);assert.equal(t.elements.size,0);assert.equal(t.reloads,1);
  const before=t.window.dataLayer.length;t.analytics.track('give_click');assert.equal(t.window.dataLayer.length,before);
 }finally{t.finish();}
});
test('cross-tab consent changes and storage clear stop executed tags through reload',()=>{
 for(const key of ['ghcc-consent',null]){
  const t=setup('/', 'granted');try{
   assert.equal(t.elements.size,1);t.storage.setItem('ghcc-consent','denied');t.listeners.get('storage')({key,newValue:null});
   assert.equal(t.elements.size,0);assert.equal(t.reloads,1);
  }finally{t.finish();}
 }
});
test('sensitive routes never install GTM or dispatch tracking even with consent',()=>{
 for(const path of ['/admin','/admin/login','/auth/callback','/prayer-request']){
  const t=setup(path,'granted');try{assert.equal(t.elements.size,0);t.analytics.track('page_view');assert.equal(t.window.dataLayer,undefined);}finally{t.finish();}
 }
});
test('Consent Mode signals precede the single loader event',()=>{
 const t=setup('/','granted');try{
  const first=t.window.dataLayer[0];assert.equal(first[0],'consent');assert.equal(first[1],'default');
  for(const key of ['analytics_storage','ad_storage','ad_user_data','ad_personalization'])assert.equal(first[2][key],'granted');
  assert.equal(t.window.dataLayer.filter(x=>x.event==='gtm.js').length,1);
 }finally{t.finish();}
});

test('navigating from a tracked public page to admin tears down executed scripts',()=>{
 const t=setup('/','granted');try{t.navigate('/admin/login');assert.equal(t.elements.size,0);assert.equal(t.reloads,1);}finally{t.finish();}
});

test('local debug never bypasses consent or sensitive route exclusion',()=>{
 const t=setup('/','granted');try{
  for(const host of ['localhost','127.0.0.1','[::1]']){t.window.location.hostname=host;t.window.location.search='';assert.equal(t.analytics.isTrackingAllowed(),false);}
  t.window.location.search='?gtm_debug=true';assert.equal(t.analytics.isTrackingAllowed(),true);
  t.storage.setItem('ghcc-consent','denied');assert.equal(t.analytics.isTrackingAllowed(),false);
  t.storage.setItem('ghcc-consent','granted');t.window.location.pathname='/admin';assert.equal(t.analytics.isTrackingAllowed(),false);
 }finally{t.finish();}
});
