import Detail from '@/components/detail';
import {published} from '@/lib/content';
import {meta} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const row=(await published('sermons')).find(x=>x.slug===slug);return row?meta(row.seo_title||row.title,row.seo_description||row.description,`/sermons/${slug}`):{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){return <Detail kind="sermons" slug={(await params).slug}/>;}
