import {NextResponse, type NextRequest} from 'next/server';
import {serverDB} from '@/lib/supabase';
import {recoveryOrigin} from '@/lib/auth-policy.mjs';
import type {EmailOtpType} from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  let site: string;
  try {
    site = recoveryOrigin();
  } catch {
    return new NextResponse('Recovery origin is not configured.', {status: 503, headers: {'Cache-Control': 'no-store'}});
  }
  // Reject spoofed Host/forwarded-origin requests before exchanging the PKCE code.
  if (request.nextUrl.origin !== site) {
    return new NextResponse('Invalid recovery origin.', {status: 400, headers: {'Cache-Control': 'no-store'}});
  }

  const code = request.nextUrl.searchParams.get('code');
  const token_hash = request.nextUrl.searchParams.get('token_hash');
  const rawType = request.nextUrl.searchParams.get('type');
  const type = (rawType || 'recovery') as EmailOtpType;

  let destination = '/admin/reset-password?error=expired';
  const pendingCookies: Array<{name: string; value: string; options?: any}> = [];

  if (code || token_hash) {
    try {
      const db = await serverDB((items) => {
        pendingCookies.push(...items);
      });
      if (code) {
        const {error} = await db.auth.exchangeCodeForSession(code);
        if (!error) destination = '/admin/reset-password';
      } else if (token_hash && typeof (db.auth as any).verifyOtp === 'function') {
        const {error} = await db.auth.verifyOtp({token_hash, type});
        if (!error) destination = '/admin/reset-password';
      }
    } catch {
      /* Never include tokens or service errors in the response. */
    }
  }

  const response = NextResponse.redirect(new URL(destination, site));
  if (response.cookies && typeof response.cookies.set === 'function') {
    for (const {name, value, options} of pendingCookies) {
      response.cookies.set(name, value, options);
    }
  }
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}
