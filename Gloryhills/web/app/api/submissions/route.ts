import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {createHmac} from 'node:crypto';
import {submissionInput} from '@/lib/validation';
const reply=(message:string,status:number)=>NextResponse.json({message},{status});
export async function POST(request:Request){
 const site=process.env.NEXT_PUBLIC_SITE_URL;
 if(!site||request.headers.get('origin')!==new URL(site).origin)return reply('Request origin not allowed.',403);
 if(Number(request.headers.get('content-length')||0)>16000)return reply('Request is too large.',413);
 const raw=await request.text();if(raw.length>16000)return reply('Request is too large.',413);
 let input;try{input=submissionInput.safeParse(JSON.parse(raw));}catch{return reply('Invalid request.',400);}
 if(!input.success)return reply('Please complete all fields and verification.',400);
 const {NEXT_PUBLIC_SUPABASE_URL:url,SUPABASE_SERVICE_ROLE_KEY:key,TURNSTILE_SECRET_KEY:captcha,RATE_LIMIT_SECRET:salt}=process.env;
 if(!url||!key||!captcha||!salt)return reply('Messages are temporarily unavailable. Your request has not been saved. Please contact the church directly.',503);
 try{
 const verification=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:captcha,response:input.data.token}),signal:AbortSignal.timeout(8000)}).then(x=>x.json());
 if(!verification.success||verification.hostname!==new URL(site).hostname)return reply('Verification failed. Please try again.',400);
 const db=createClient(url,key,{auth:{persistSession:false}});
 // Vercel overwrites x-vercel-forwarded-for. Local/unrecognized hosts share one bucket.
 const ip=process.env.VERCEL?request.headers.get('x-vercel-forwarded-for')||'unknown':'local';
 const bucket=createHmac('sha256',salt).update(ip).digest('hex');const {data:allowed,error:limitError}=await db.rpc('consume_rate_limit',{bucket});if(limitError)throw limitError;if(!allowed)return reply('Too many requests. Please try again in an hour.',429);
 const {kind,name,email,message}=input.data;const {error}=await db.from('submissions').insert({kind,name,email,message});if(error)throw error;
 return reply('Your request has been received by the church team.',201);
 }catch{return reply('We could not save your request. Please try again later.',503);}
}
