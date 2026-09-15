'use client';
import Link from 'next/link';
import Image from 'next/image';
import {useState,useRef,useEffect} from 'react';
import {usePathname} from 'next/navigation';
const links=[['About','/about-us'],['Listen','/sermons'],['Gatherings','/events'],['Visit us','/visit-us']];
export default function Navigation(){const [open,setOpen]=useState(false);const button=useRef<HTMLButtonElement>(null);const path=usePathname();useEffect(()=>{function key(e:KeyboardEvent){if(e.key==='Escape'){setOpen(false);button.current?.focus();}}document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[]);return <header className="site-header"><Link href="/" aria-label="Glory Hills Community Church home"><Image src="/images/brand/logo.png" alt="Glory Hills Community Church" width={230} height={53} priority/></Link><button className="menu-toggle" ref={button} aria-expanded={open} aria-controls="main-menu" onClick={()=>setOpen(!open)}>Menu {open?'−':'+'}</button><nav id="main-menu" aria-label="Main navigation" className={open?'nav open':'nav'}>{links.map(([label,href])=><Link key={href} href={href} aria-current={path===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}<Link className="button small" href="/give" onClick={()=>setOpen(false)}>Give ↗</Link></nav></header>}
