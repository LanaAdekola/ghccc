'use server';
import {requireAdmin} from '@/lib/supabase';
import {canManageMarketing,integrations,normalizeMarketing,validateMarketing} from '@/lib/marketing';
import {revalidatePath} from 'next/cache';
export async function saveMarketing(_: {message:string;ok:boolean},form:FormData){
 const {db,role}=await requireAdmin('marketing_admin');if(!canManageMarketing(role))return {ok:false,message:'You do not have permission to manage marketing settings.'};
 const input:Record<string,string>={};for(const key of Object.keys(integrations)){input[`${key}_enabled`]=form.get(`${key}_enabled`)==='on'?'true':'false';input[`${key}_id`]=String(form.get(`${key}_id`)||'').trim();}input.ads_label=String(form.get('ads_label')||'').trim();
 const error=validateMarketing(input);if(error)return {ok:false,message:error};
 const {error:dbError}=await db.from('content').upsert({kind:'settings',slug:'marketing',title:'Marketing & Analytics',status:'published',published_at:new Date().toISOString(),data:normalizeMarketing(input)},{onConflict:'kind,slug'});
 if(dbError)return {ok:false,message:'Settings could not be saved. Check that the marketing migrations have been applied.'};
 revalidatePath('/','layout');return {ok:true,message:'Settings saved. New public page loads use these settings after consent. Already open tabs may need a refresh.'};
}
