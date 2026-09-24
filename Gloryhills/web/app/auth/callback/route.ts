import {NextResponse, type NextRequest} from 'next/server';
import {serverDB} from '@/lib/supabase';
export async function GET(request:NextRequest) {
 const code=request.nextUrl.searchParams.get('code');
 if(code) {
  try {
   const db=await serverDB();
   const {error}=await db.auth.exchangeCodeForSession(code);
   if(!error) return NextResponse.redirect(new URL('/admin/reset-password',request.url));
  } catch { /* Show a recoverable error, never expose the token. */ }
 }
 return NextResponse.redirect(new URL('/admin/reset-password?error=expired',request.url));
}
