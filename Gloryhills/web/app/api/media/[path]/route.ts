import {serverDB} from '@/lib/supabase';
import {configured} from '@/lib/content';
export async function GET(_:Request,{params}:{params:Promise<{path:string}>}){const {path}=await params;if(!configured()||! /^[0-9a-f-]+\.(jpg|png|webp)$/.test(path))return new Response('Not found',{status:404});const db=await serverDB();const {data,error}=await db.storage.from('church-media').download(path);if(error||!data)return new Response('Not found',{status:404});return new Response(data,{headers:{'Content-Type':data.type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
