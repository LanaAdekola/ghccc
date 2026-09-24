import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMarketing,validateMarketing,scriptPlan,canManageMarketing} from '../lib/marketing.ts';
import {installMarketing} from '../lib/marketing-runtime.ts';
const all={ga_enabled:'true',ga_id:'G-DDLP68EB2M',adsense_enabled:'true',adsense_id:'ca-pub-5953963705871784',gtm_enabled:'false',gtm_id:'GTM-ABC123',meta_enabled:'true',meta_id:'123456789012345',ads_enabled:'true',ads_id:'AW-123456789',ads_label:'label_123'};
test('strict identifiers, defaults off, and narrow role permissions',()=>{assert.deepEqual(scriptPlan({}),[]);assert.ok(validateMarketing({...all,ga_id:'<script>'}));assert.equal(normalizeMarketing({...all,ga_id:'javascript:alert(1)'}).ga_enabled,'false');assert.equal(validateMarketing(all),null);assert.equal(canManageMarketing('marketing_admin'),true);assert.equal(canManageMarketing('media_editor'),false);assert.equal(canManageMarketing('unknown'),false);});
test('GTM is the only loader even when all direct services are enabled',()=>{
 assert.deepEqual(scriptPlan(all),[]);
 assert.deepEqual(scriptPlan({...all,gtm_enabled:'true'}).map(x=>x.id),['ghcc-gtm']);
});
test('GTM loads once and configuration changes unload through refresh',()=>{
 const elements=new Map();let reloads=0;
 globalThis.window={dataLayer:[],location:{reload(){reloads++;}}};
 globalThis.document={getElementById:id=>elements.get(id),createElement:()=>({remove(){elements.delete(this.id);}}),head:{append(el){elements.set(el.id,el);}}};
 const config={...all,gtm_enabled:'true'};
 installMarketing(config);installMarketing(config);assert.equal(elements.size,1);assert.equal(window.dataLayer.filter(x=>x.event==='gtm.js').length,1);
 installMarketing({});assert.equal(reloads,1);assert.equal(elements.size,0);
 delete globalThis.window;delete globalThis.document;
});
