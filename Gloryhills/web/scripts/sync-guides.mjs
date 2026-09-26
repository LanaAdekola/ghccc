import {readFile,writeFile} from 'node:fs/promises';
import {EVENT_REGISTRY} from '../lib/events.mjs';
const root=new URL('../../',import.meta.url);
const check=process.argv.includes('--check');
async function sync(path,text){
 const file=new URL(path,root);
 if(check){if(await readFile(file,'utf8')!==text)throw new Error('Outdated generated document: '+path);}
 else await writeFile(file,text);
}
const dictionary=`# Tracking event dictionary

Generated from web/lib/events.mjs by web/scripts/sync-guides.mjs. There are ${EVENT_REGISTRY.length} allowlisted event names, not ${EVENT_REGISTRY.length} verified working user journeys. Reachability means code/UI availability, not configured production delivery. Some links require published content; forms require Supabase and Turnstile. online_giving_started requires an actual approved external checkout link; the internal /give placeholder does not emit it.

GTM is the sole tracking delivery layer. Published Supabase content(kind=settings, slug=marketing) supplies the active ID and enabled state. No environment fallback exists. Other vendor IDs are reference values only. All interaction events require consent. Consent Mode commands can be queued before consent; they are not interaction events. gtm.js is the loader lifecycle event. ghcc-consent is a DOM event, NOT a GTM data-layer custom event.

| Event | Trigger | Parameters | Implemented | UI path exists | Privacy |
|---|---|---|---|---|---|
${EVENT_REGISTRY.map(e=>`| ${e.name} | ${e.trigger} | ${e.parameters.join(', ')||'None'} | ${e.implemented?'Yes':'No'} | ${e.reachable?'Yes, prerequisites apply':'No'} | ${e.privacyConstraints} |`).join('\n')}

Never configure sermon_play, sermon_complete or online_giving_completed as implemented outcomes. Prayer-request activity is excluded permanently. newsletter_signup means a request was stored for church review, not enrollment in an external email platform. Event registration clicks are interest only, never completed registration. google_ads_conversion is an uncalled helper, not a verified donation callback.

The historical 17-event list included unsupported names. A nine-item mapping list was a subset, not an implementation count. Current authoritative count: ${EVENT_REGISTRY.length} names; event_interest_submitted has no mounted UI and google_ads_conversion has no caller.

Per-event parameter contracts are enforced; query strings, sensitive routes and unapproved properties are discarded. External GTM tags must independently avoid PII, full URLs/query strings, sensitive referrers, preview hosts and duplicate page views. No external receipt has been verified.
`;
await sync('TRACKING_EVENT_DICTIONARY.md',dictionary);
for(const [source,dest] of [['ANALYTICS_AND_ADS_SETUP.md','docs/ANALYTICS_AND_ADS_SETUP.md'],['MEDIA_TEAM_HANDOFF.md','docs/MEDIA_TEAM_HANDOFF.md'],['POST_LAUNCH_VERIFICATION.md','docs/POST_LAUNCH_VERIFICATION.md'],['SEARCH_CONSOLE_SETUP.md','docs/SEARCH_CONSOLE_SETUP.md'],['SEO_GUIDE.md','docs/SEO_SETUP.md']])await sync(dest,await readFile(new URL(source,root),'utf8'));
await sync('docs/TRACKING_EVENT_DICTIONARY.md',dictionary);
const old=JSON.parse(await readFile(new URL('web/lib/admin-guides.json',root),'utf8'));
for(const key of Object.keys(old))old[key]=await readFile(new URL(key+'.md',root),'utf8');
await sync('web/lib/admin-guides.json',JSON.stringify(old,null,2)+'\n');
console.log(check?'Generated guides match sources.':'Generated guides synchronized.');
