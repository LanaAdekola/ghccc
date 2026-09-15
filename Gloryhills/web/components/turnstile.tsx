'use client';
import Script from 'next/script';
import {useRef,useEffect} from 'react';
declare global{interface Window{turnstile?:{render:(element:HTMLElement,options:{sitekey:string})=>string;remove:(id:string)=>void}}}
export default function Turnstile(){const key=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;const container=useRef<HTMLDivElement>(null);const id=useRef<string|undefined>(undefined);function render(){if(key&&container.current&&window.turnstile&&!id.current)id.current=window.turnstile.render(container.current,{sitekey:key});}useEffect(()=>{return()=>{if(id.current)window.turnstile?.remove(id.current);};},[]);if(!key)return <p className="notice">Message delivery is being set up. Please use the church’s contact details when available.</p>;return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render}/><div ref={container}/></>}
