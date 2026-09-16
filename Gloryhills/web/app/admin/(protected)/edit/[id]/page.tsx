import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/supabase';
import {kinds,requiredWhenPublished} from '@/lib/validation';
import {structuredFields,homepageSections,type Field,type Kind} from '@/lib/fields';
import {save,upload} from '../../actions';
const labels:Record<string,string>={slug:'Web address (slug)',title:'Title',description:'Short description',external_url:'External link',image_url:'Image path',image_alt:'Image description (alt text)',seo_title:'Search engine title',seo_description:'Search engine description'};
function StructuredField({field,value}:{field:Field;value:string}){
 return <label key={field.name}>{field.label}
  {field.type==='select'
   ?<select name={`data.${field.name}`} defaultValue={value}><option value="">Not set</option>{field.options!.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
   :<input name={`data.${field.name}`} type={field.type==='number'?'number':field.type==='time'?'time':field.type==='date'?'date':field.type==='email'?'email':field.type==='tel'?'tel':'text'} inputMode={field.type==='number'?'numeric':undefined} defaultValue={value} placeholder={field.placeholder}/>}
  {field.help&&<span className="hint">{field.help}</span>}
 </label>;
}
export default async function Edit({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{error?:string;uploaded?:string;kind?:string}>}){
 const {id}=await params;const q=await searchParams;const {db}=await requireAdmin();
 const row=id==='new'?null:(await db.from('content').select('*').eq('id',id).single()).data;
 if(id!=='new'&&!row)notFound();
 const kind=(kinds as readonly string[]).includes(q.kind||'')?q.kind as Kind:(row?.kind as Kind)||'sermons';
 const data:Record<string,string>=row?.data||{};
 const fields=structuredFields[kind]||[];
 const known=new Set([...fields.map(x=>x.name),...(kind==='homepage'?['section_order']:[])]);
 const extras=Object.keys(data).filter(x=>!known.has(x));
 const order=(data.section_order||'').split(',').map(x=>x.trim()).filter(Boolean);
 const required=requiredWhenPublished[kind]||[];
 return <>
  <h1>{row?'Edit content':'New content'}</h1>
  {q.error&&<p role="alert">{q.error==='save'?'The database rejected this change. Check your Supabase configuration and permissions.':q.error==='upload'?'That image could not be uploaded. Use JPEG, PNG or WebP under 5 MB.':q.error}</p>}
  <form className="form" method="get">
   <label>Content type<select name="kind" defaultValue={kind}>{kinds.map(x=><option key={x} value={x}>{x.replaceAll('_',' ')}</option>)}</select></label>
   <button className="button small">Change content type</button>
   <p className="hint">Changing the type reloads the form with the right fields. Unsaved edits are lost.</p>
  </form>
  <form className="form" action={save}>
   <input type="hidden" name="id" value={id}/>
   <input type="hidden" name="kind" value={kind}/>
   {['slug','title','description','external_url','image_url','image_alt','seo_title','seo_description'].map(field=>
    <label key={field}>{labels[field]}<input name={field} required={['slug','title'].includes(field)} defaultValue={field==='image_url'&&q.uploaded?q.uploaded:row?.[field]||''}/>
     {field==='slug'&&<span className="hint">Lower-case words separated by hyphens, for example sunday-service.</span>}
     {field==='seo_title'&&<span className="hint">Optional. Used in search results and browser tabs instead of the title.</span>}
    </label>)}
   <label>Body<textarea name="body" defaultValue={row?.body||''}/></label>
   <label>Event date and time (UTC)<input type="datetime-local" name="starts_at" defaultValue={row?.starts_at?.slice(0,16)||''}/><span className="hint">Displayed to visitors in Africa/Lagos time. Enter 17:00 UTC for a 6:00 PM Lagos start.</span></label>
   <label>Display order<input type="number" min="0" max="10000" name="display_order" defaultValue={row?.display_order||0}/></label>
   <label className="check"><input type="checkbox" name="featured" defaultChecked={row?.featured||false}/>Featured item</label>
   <label>Status<select name="status" defaultValue={row?.status||'draft'}><option value="draft">Draft / unpublished</option><option value="published">Published now</option></select></label>
   {(fields.length>0||kind==='homepage'||extras.length>0)&&<h2>{kind.replaceAll('_',' ')} details</h2>}
   {required.length>0&&<p className="hint">Required before publishing: {required.join(', ').replaceAll('_',' ')}.</p>}
   {fields.map(field=><StructuredField key={field.name} field={field} value={data[field.name]||''}/>)}
   {kind==='homepage'&&<fieldset><legend>Homepage section order</legend><p className="hint">Choose the order sections appear. Leave a position empty to skip it; sections you omit are added at the end.</p>
    {homepageSections.map((_,index)=><label key={index}>Position {index+1}<select name={`order.${index}`} defaultValue={order[index]||''}><option value="">Not set</option>{homepageSections.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>)}
   </fieldset>}
   {extras.length>0&&<fieldset><legend>Other saved fields</legend><p className="hint">These values already exist on this record. Clear a value to remove it.</p>
    {extras.map(key=><label key={key}>{key.replaceAll('_',' ')}<input name={`data.${key}`} defaultValue={data[key]}/></label>)}
   </fieldset>}
   <p className="hint">Never enter passwords, card numbers or other credentials into content fields.</p>
   <button className="button">Save content</button>
  </form>
  <h2 style={{marginTop:50}}>Upload an image</h2>
  <p>Save your text before uploading. JPEG, PNG or WebP, maximum 5 MB. Uploads remain private until attached to published content.</p>
  <form className="form" action={upload}>
   <input type="hidden" name="id" value={id}/>
   <label>Image file<input type="file" name="file" accept="image/jpeg,image/png,image/webp" required/></label>
   <button className="button">Upload</button>
  </form>
 </>;
}
