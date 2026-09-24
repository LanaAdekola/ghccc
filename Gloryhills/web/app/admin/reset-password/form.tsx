'use client';
import {useActionState} from 'react';
import {updatePassword} from './actions';
export function PasswordForm(){
 const [state,action,pending]=useActionState(updatePassword,{message:''});
 return <form className="form" action={action}><label>New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><label>Confirm password<input name="confirm" type="password" autoComplete="new-password" minLength={12} maxLength={128} required/></label><button className="button" disabled={pending}>{pending?'Saving…':'Save new password'}</button><p role="status">{state.message}</p></form>;
}
