import test from 'node:test';
import assert from 'node:assert/strict';
import {isAdminRole,recoveryOrigin} from '../lib/auth-policy.mjs';
import {validMedia,mediaPathType,MAX_MEDIA_BYTES} from '../lib/media-security.mjs';
import {getYouTubeId} from '../lib/youtube.mjs';
import {sanitizeEventPayload,EVENT_REGISTRY} from '../lib/events.mjs';

test('exact role allowlist rejects inherited keys and missing/unsupported roles',()=>{
 for(const role of ['media_editor','marketing_admin','content_admin','super_admin'])assert.equal(isAdminRole(role),true);
 for(const role of [null,undefined,'admin','constructor','toString','__proto__',''])assert.equal(isAdminRole(role),false);
});
test('recovery origin ignores request input, rejects preview and untrusted configured origins',()=>{
 const prod={NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://www.ghccglobal.com'};
 assert.equal(recoveryOrigin(prod),'https://www.ghccglobal.com');
 for(const url of ['http://www.ghccglobal.com','https://www.ghccglobal.com.attacker.test','https://user:pass@www.ghccglobal.com','https://www.ghccglobal.com/?next=https://attacker.test','https://www.ghccglobal.com/path','https://www.ghccglobal.com/#fragment','http://localhost:3000',''])assert.throws(()=>recoveryOrigin({...prod,NEXT_PUBLIC_SITE_URL:url}));
 assert.throws(()=>recoveryOrigin({...prod,VERCEL_ENV:'preview'}));
 assert.equal(recoveryOrigin({NODE_ENV:'development',NEXT_PUBLIC_SITE_URL:'http://localhost:3000'}),'http://localhost:3000');
});
test('media upload and download boundaries: types, signatures, extensions, size, paths',()=>{
 const png=new Uint8Array([137,80,78,71,13,10,26,10]);
 const jpg=new Uint8Array([255,216,255]);
 const webp=new TextEncoder().encode('RIFF1234WEBP');
 for(const [bytes,type,name] of [[png,'image/png','image.png'],[jpg,'image/jpeg','image.jpeg'],[webp,'image/webp','image.webp']])assert.equal(validMedia(bytes,type,name),true);
 assert.equal(validMedia(png,'image/png','image.svg'),false);
 assert.equal(validMedia(png,'image/jpeg','image.jpg'),false);
 assert.equal(validMedia(png,'image/svg+xml','image.svg'),false);
 assert.equal(validMedia(new Uint8Array(),'image/png','empty.png'),false);
 assert.equal(validMedia(new Uint8Array(MAX_MEDIA_BYTES+1),'image/png','huge.png'),false);
 const id='00000000-0000-0000-0000-000000000001';
 assert.equal(mediaPathType(id+'.png'),'image/png');
 for(const path of ['../'+id+'.png','%2e%2e/'+id+'.png',id+'.svg',id+'.png?x=1','x.png','/'+id+'.png'])assert.equal(mediaPathType(path),null);
});
test('registry reflects reachability and enforces per-event parameter contracts',()=>{
 assert.equal(EVENT_REGISTRY.length,19);
 assert.equal(EVENT_REGISTRY.find(x=>x.name==='event_interest_submitted').reachable,false);
 assert.deepEqual(sanitizeEventPayload('give_click',{route:'/give',email:'private@example.test'}),{event:'give_click'});
 for(const path of ['/admin/login','/auth/callback','/prayer-request','//attacker','/events/a?token=private'])assert.deepEqual(sanitizeEventPayload('page_view',{page_path:path}),{event:'page_view'});
});
test('video parsing requires an exact approved HTTPS hostname',()=>{
 for(const url of ['https://attacker.test/youtube.com/watch?v=40a-r3mUHRw','https://youtube.com.attacker.test/watch?v=40a-r3mUHRw','http://youtu.be/40a-r3mUHRw'])assert.equal(getYouTubeId(url),null);
});
