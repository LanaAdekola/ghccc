import type {Metadata} from 'next';
import {churchName} from './content';
export function origin(){return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';}
export function meta(title:string,description:string,path:string):Metadata{return {title,description,alternates:{canonical:path},openGraph:{title:`${title} | ${churchName}`,description,url:path,type:'website',images:[{url:'/images/brand/default-social-share.jpg',width:1200,height:630}]},twitter:{card:'summary_large_image',title,description,images:['/images/brand/default-social-share.jpg']}};}
export function jsonLd(value:unknown){return JSON.stringify(value).replace(/</g,'\\u003c');}
