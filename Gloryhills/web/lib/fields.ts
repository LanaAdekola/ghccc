import {kinds} from './validation.ts';
export type Kind=(typeof kinds)[number];
export {requiredWhenPublished} from './validation.ts';
export type Field={name:string;label:string;type?:'text'|'url'|'tel'|'email'|'time'|'date'|'number'|'select';options?:[string,string][];help?:string;placeholder?:string};
export const homepageSections:[string,string][]=[['welcome','Welcome'],['sermon','Latest sermon'],['announcements','Announcements'],['ministries','Ministries'],['gallery','Gallery'],['visit','Plan your visit'],['giving','Giving']];
const currencies:[string,string][]=[['NGN','Naira (NGN)'],['USD','US dollar (USD)'],['GBP','Pound sterling (GBP)'],['EUR','Euro (EUR)']];
const locations:[string,string][]=[['Ojodu Berger headquarters','Ojodu Berger headquarters'],['Isheri Magodo','Isheri Magodo']];
const days:[string,string][]=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(x=>[x,x]);
export const structuredFields:Partial<Record<Kind,Field[]>>={
 settings:[
  {name:'organization_name',label:'Church name'},
  {name:'headquarters',label:'Headquarters address',help:'Shown on the footer, visit page and structured data.'},
  {name:'isheri',label:'Isheri Magodo address'},
  {name:'phone',label:'Public phone number',type:'tel',placeholder:'+234…'},
  {name:'email',label:'Public email address',type:'email'},
  {name:'spotify',label:'Spotify show link',type:'url',help:'Must start with https://'},
  {name:'map_url',label:'Directions link',type:'url',help:'Google Maps or similar; must start with https://'}
 ],
 seo:[
  {name:'default_title',label:'Default page title',help:'Used when a page has no title of its own.'},
  {name:'title_template',label:'Title template',placeholder:'%s | Glory Hills Community Church',help:'%s is replaced by the page title.'}
 ],
 giving_methods:[
  {name:'bank_name',label:'Bank name'},
  {name:'account_name',label:'Account name'},
  {name:'account_number',label:'Account number'},
  {name:'currency',label:'Currency',type:'select',options:currencies},
  {name:'swift',label:'SWIFT / BIC code',help:'Optional; needed for international transfers.'}
 ],
 service_times:[
  {name:'location',label:'Location',type:'select',options:locations},
  {name:'day',label:'Day',type:'select',options:days},
  {name:'start',label:'Start time',type:'time'},
  {name:'end',label:'End time',type:'time'},
  {name:'timezone',label:'Timezone',type:'select',options:[['Africa/Lagos','Africa/Lagos (WAT)']]}
 ],
 gallery_images:[{name:'album_slug',label:'Album',help:'The slug of the gallery album this image belongs to.'}],
 announcements:[{name:'expires_on',label:'Hide after',type:'date',help:'Optional. Editors use this to plan removal; it is not automatic.'}],
 leadership:[{name:'role',label:'Role or title',placeholder:'Senior Pastor'}],
 giving_campaigns:[
  {name:'goal_amount',label:'Goal amount',type:'number',help:'Optional. Numbers only.'},
  {name:'currency',label:'Currency',type:'select',options:currencies}
 ]
};
function clockTime(value?:string){if(!value||!/^\d{2}:\d{2}$/.test(value))return '';const [hours,minutes]=value.split(':').map(Number);return `${((hours+11)%12)+1}:${String(minutes).padStart(2,'0')} ${hours<12?'AM':'PM'}`;}
export function schedule(data:Record<string,string>){const start=clockTime(data.start),end=clockTime(data.end);if(!data.day||!start)return '';return `${data.day} · ${start}${end?`–${end}`:''}${data.timezone==='Africa/Lagos'?' WAT':''}`;}
export function dataFromForm(entries:Iterable<[string,FormDataEntryValue]>):Record<string,string>{
 const data:Record<string,string>={};const order:string[]=[];
 for(const [key,value] of entries){
  const text=typeof value==='string'?value.trim():'';
  if(key.startsWith('order.')){if(text)order.push(text);continue;}
  if(!key.startsWith('data.'))continue;
  if(text)data[key.slice(5)]=text;
 }
 const unique=[...new Set(order)];
 if(unique.length)data.section_order=unique.join(',');
 return data;
}
