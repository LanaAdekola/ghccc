'use client';
import {useState} from 'react';
import {track} from './analytics';
export default function CopyAccount({account,category}:{account:string;category:string}){const [message,setMessage]=useState('');return <><button className="button" aria-label={`Copy account number for ${category}`} onClick={async()=>{try{await navigator.clipboard.writeText(account);setMessage('Account number copied.');track('bank_details_copied');}catch{setMessage('Unable to copy. Please select and copy the number above.');}}}>Copy account number</button><p role="status">{message}</p></>}
