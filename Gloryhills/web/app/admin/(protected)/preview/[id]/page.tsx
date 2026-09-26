import ContentImage from '@/components/content-image';
import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/supabase';
import {mediaEditorAllowedKinds} from '@/lib/validation';
import {structuredFields,type Kind} from '@/lib/fields';
export default async function Preview({params}:{params:Promise<{id:string}>}){
 const {db,role}=await requireAdmin();
 const {data:row}=await db.from('content').select('*').eq('id',(await params).id).single();
 if(!row || (role==='media_editor' && !mediaEditorAllowedKinds.includes(row.kind)))notFound();
 const data:Record<string,string>=row.data||{};
 const labels=new Map((structuredFields[row.kind as Kind]||[]).map(x=>[x.name,x.label]));
 const entries=Object.entries(data);
 return <article className="prose">
  <p className="notice">Administrator preview · {row.status}</p>
  <h1>{row.title}</h1>
  <p className="lead">{row.description}</p>
  <ContentImage path={row.image_url} alt={row.image_alt}/>
  <p>{row.body}</p>
  {entries.length>0&&<><h2>{row.kind.replaceAll('_',' ')} details</h2><dl className="detail-list">{entries.map(([key,value])=><div key={key}><dt>{labels.get(key)||key.replaceAll('_',' ')}</dt><dd>{value}</dd></div>)}</dl></>}
 </article>;
}
