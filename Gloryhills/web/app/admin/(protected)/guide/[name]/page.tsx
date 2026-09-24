import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/supabase';
import guides from '@/lib/admin-guides.json';
export default async function Guide({params}:{params:Promise<{name:string}>}) {
 await requireAdmin('marketing_admin');
 const {name}=await params;
 const text=Object.prototype.hasOwnProperty.call(guides,name)?guides[name as keyof typeof guides]:null;
 if(!text)notFound();
 return <article><h1>{name.replaceAll('_',' ').toLowerCase()}</h1><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',font:'inherit',background:'white',padding:24,borderRadius:12}}>{text}</pre></article>;
}
