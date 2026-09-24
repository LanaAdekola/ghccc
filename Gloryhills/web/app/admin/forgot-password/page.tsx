'use client';
import Link from 'next/link';
import {useActionState} from 'react';
import {requestReset} from './actions';
export default function ForgotPassword(){
 const [state,action,pending]=useActionState(requestReset,{message:''});
 return <main id="main" className="page-heading"><h1>Reset your password</h1><p>Enter the email associated with your administrator account.</p><form className="form" action={action}><label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required/></label><button className="button" disabled={pending}>{pending?'Sending…':'Send reset link'}</button><p role="status">{state.message}</p></form><Link href="/admin/login">Back to sign in</Link></main>;
}
