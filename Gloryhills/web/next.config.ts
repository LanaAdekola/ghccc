import path from 'node:path';
import type { NextConfig } from 'next';
const config: NextConfig = {
 poweredByHeader:false,
  // Keep webpack's runtime alias aligned with tsconfig, even if build-time
  // TypeScript config discovery is affected by the deployment environment.
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
      ...(config.resolve.modules || ['node_modules']),
    ];
    return config;
  },
  // Development uses Turbopack and its built-in tsconfig paths support.
  turbopack: {},
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental:{serverActions:{bodySizeLimit:"6mb"}},
  outputFileTracingRoot:path.resolve(__dirname, '..'),
  async redirects(){return [{source:'/sermon',destination:'/sermons',permanent:true},{source:'/event',destination:'/events',permanent:true},{source:'/otherdata',destination:'/',permanent:true}];},
  async headers(){
    return [
      {
        source: '/:path*',
        headers: [
          {key:'X-Content-Type-Options',value:'nosniff'},
          {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
          {key:'X-Frame-Options',value:'DENY'},
          {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {key:'Cache-Control', value:'public, max-age=31536000, immutable'}
        ]
      },
      {
        source: '/fonts/:path*',
        headers: [
          {key:'Cache-Control', value:'public, max-age=31536000, immutable'}
        ]
      }
    ];
  }
}; export default config;
