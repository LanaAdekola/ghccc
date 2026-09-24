'use client';
import {useFormStatus} from 'react-dom';
export function SubmitButton({configured}:{configured:boolean}) {
  const {pending} = useFormStatus();
  return <button className="button" disabled={!configured || pending} aria-live="polite">{pending ? 'Signing in…' : configured ? 'Sign in' : 'Setup required'}</button>;
}
