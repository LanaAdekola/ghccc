import ContentImage from '@/components/content-image';
import {notFound} from 'next/navigation';
import {requireAdmin} from '@/lib/supabase';
export default async function Preview({params}:{params:Promise<{id:string}>}){const {db}=await requireAdmin();const {data:row}=await db.from('content').select('*').eq('id',(await params).id).single();if(!row)notFound();return <article className="prose"><p className="notice">Administrator preview · {row.status}</p><h1>{row.title}</h1><p className="lead">{row.description}</p><ContentImage path={row.image_url} alt={row.image_alt}/><p>{row.body}</p><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{JSON.stringify(row.data,null,2)}</pre></article>}
