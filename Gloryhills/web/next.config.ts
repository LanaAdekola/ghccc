import type { NextConfig } from 'next';
const config: NextConfig = {
 poweredByHeader:false,
 experimental:{serverActions:{bodySizeLimit:"6mb"}},
 outputFileTracingRoot:process.cwd(),
 async redirects(){return [{source:'/sermon',destination:'/sermons',permanent:true},{source:'/event',destination:'/events',permanent:true},{source:'/otherdata',destination:'/',permanent:true}];},
 async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}];}
}; export default config;
