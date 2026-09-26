import {serverDB} from '@/lib/supabase';
import {configured} from '@/lib/content';
import {mediaPathType, validMedia} from '@/lib/media-security.mjs';
export const dynamic='force-dynamic';
const privateHeaders={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
export async function GET(_:Request,{params}:{params:Promise<{path:string}>}) {
 const {path}=await params;
 const type=mediaPathType(path);
 if(!configured()||!type)return new Response('Not found',{status:404,headers:privateHeaders});
 // Session-scoped public key: never use service_role or signed URLs to bypass storage RLS.
 const db=await serverDB();
 const {data,error}=await db.storage.from('church-media').download(path);
 if(error||!data)return new Response('Not found',{status:404,headers:privateHeaders});
 const bytes=new Uint8Array(await data.arrayBuffer());
 if(!validMedia(bytes,type,path))return new Response('Not found',{status:404,headers:privateHeaders});
 return new Response(bytes,{headers:{...privateHeaders,'Content-Type':type}});
}
