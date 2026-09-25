import test from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
test('production HTTP routes, server metadata, redirects, forms, icons and protected areas',async()=>{
 const titles=new Set();for(const route of ['/','/about-us','/leadership','/meet-our-pastor','/sermons','/events','/give','/visit-us','/contact','/prayer-request','/plan-your-visit','/cookies']){const r=await fetch(base+route);assert.equal(r.status,200,route);const html=await r.text();assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route);assert.ok(html.includes('rel="canonical"'),route);const title=html.match(/<title>(.*?)<\/title>/)?.[1];assert.ok(title);titles.add(title);assert.ok(!html.includes('kenzi.lawson@example.com'));}assert.equal(titles.size,12);
 const visit=await(await fetch(base+'/visit-us')).text();assert.ok(visit.includes('Tejumola House'));assert.ok(visit.includes('Isheri Magodo'));assert.ok(visit.includes('8:00 AM'));const sermons=await(await fetch(base+'/sermons')).text();assert.ok(sermons.includes('4OYlLXQq8Heh6fAkixCdVA'));
 for(const [old,target] of [['/sermon','/sermons'],['/event','/events'],['/otherdata','/']]){const r=await fetch(base+old,{redirect:'manual'});assert.equal(r.status,308);assert.equal(r.headers.get('location'),target);}
 for(const path of ['/missing','/sermons/unpublished','/events/missing','/gallery/missing','/ministries'])assert.equal((await fetch(base+path)).status,404,path);
 for(const path of ['/admin','/admin/edit/new','/admin/preview/any']){const r=await fetch(base+path,{redirect:'manual'});assert.equal(r.status,307);assert.equal(r.headers.get('location'),'/admin/login');}const admin=await(await fetch(base+'/admin/login')).text();assert.ok(admin.includes('noindex'));
 const forged=await fetch(base+'/api/submissions',{method:'POST',headers:{origin:'https://attacker.example'},body:'{}'});assert.equal(forged.status,403);
 for(const asset of ['/favicon.ico','/favicon-16x16.png','/favicon-32x32.png','/favicon-48x48.png','/apple-touch-icon.png','/icon-192.png','/icon-512.png','/site.webmanifest','/images/brand/default-social-share.jpg'])assert.equal((await fetch(base+asset)).status,200,asset);
 const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert.ok(sitemap.includes('/visit-us'));assert.ok(sitemap.includes('/meet-our-pastor'));assert.ok(!sitemap.includes('/admin'));assert.ok((await(await fetch(base+'/robots.txt')).text()).includes('Disallow: /admin'));
});
