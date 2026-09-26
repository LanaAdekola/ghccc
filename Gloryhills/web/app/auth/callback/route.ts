import {NextResponse, type NextRequest} from 'next/server';
import {serverDB} from '@/lib/supabase';
import {recoveryOrigin} from '@/lib/auth-policy.mjs';
export async function GET(request:NextRequest) {
 let site: string;
 try { site=recoveryOrigin(); } catch { return new NextResponse('Recovery origin is not configured.', {status:503, headers:{'Cache-Control':'no-store'}}); }
 // Reject spoofed Host/forwarded-origin requests before exchanging the PKCE code.
 if(request.nextUrl.origin!==site) return new NextResponse('Invalid recovery origin.', {status:400, headers:{'Cache-Control':'no-store'}});
 const code=request.nextUrl.searchParams.get('code');
 let destination='/admin/reset-password?error=expired';
 if(code) {
  try {
   const db=await serverDB();
   const {error}=await db.auth.exchangeCodeForSession(code);
   if(!error) destination='/admin/reset-password';
  } catch { /* Never include tokens or service errors in the response. */ }
 }
 const response=NextResponse.redirect(new URL(destination,site));
 response.headers.set('Cache-Control','no-store');
 response.headers.set('Referrer-Policy','no-referrer');
 return response;
}
