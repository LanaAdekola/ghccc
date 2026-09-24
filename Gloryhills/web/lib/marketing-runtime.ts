import {normalizeMarketing,scriptPlan,type Marketing} from './marketing.ts';
declare global {interface Window {ghccMarketing?:Marketing;ghccMarketingSignature?:string;}}
export function installMarketing(raw:Marketing){
 const c=normalizeMarketing(raw);const signature=JSON.stringify(c);
 if(window.ghccMarketingSignature&&window.ghccMarketingSignature!==signature){document.getElementById('ghcc-gtm')?.remove();window.location.reload();return;}
 window.ghccMarketingSignature=signature;window.ghccMarketing=c;
 for(const item of scriptPlan(c)){
  if(document.getElementById(item.id))continue;
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
  const script=document.createElement('script');script.id=item.id;script.src=item.src;script.async=true;document.head.append(script);
 }
}
