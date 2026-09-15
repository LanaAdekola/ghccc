import 'server-only';
import confirmed from './content/confirmed-site.json';
import {createClient} from '@supabase/supabase-js';
export type Content = {id:string;kind:string;slug:string;title:string;description:string;body:string;image_url?:string;image_alt?:string;external_url?:string;starts_at?:string;display_order:number;status:string;published_at?:string;seo_title?:string;seo_description?:string;data:Record<string,string>};
export const configured=()=>Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export async function published(kind:string):Promise<Content[]>{
 if(!configured())return [];
 try {const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false}});const {data,error}=await db.from('content').select('*').eq('kind',kind).eq('status','published').lte('published_at',new Date().toISOString()).order('featured',{ascending:false}).order('display_order').order('published_at',{ascending:false});if(error){console.error('Published content unavailable',error.code);return [];}return data??[];}catch{return [];}
}
export async function settings():Promise<Record<string,string>>{const rows=await published('settings');return {...confirmed,...rows[0]?.data};}
export const churchName='Glory Hills Community Church';
export const mission='Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost: teaching them to observe all things whatsoever I have commanded you.';
