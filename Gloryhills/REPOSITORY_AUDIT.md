# Repository audit — 2026-09-15

## Architecture and evidence
Gatsby 5.14.3 and React/React DOM 16.14.0 are installed. npm with package-lock.json; `.npmrc` enables legacy-peer-deps. React type declarations target 18, inconsistent with runtime. Node 20.19.2 and npm 11.4.0 are available. Gatsby and Vite scripts coexist, but Gatsby owns production. No Next.js or Supabase implementation exists.

The working tree already contains modifications to package.json, package-lock.json and generated admin bundles. Preserve those changes. The new app lives in `web/`; Vercel must use that root. Legacy files remain until parity and security verification pass.

## Routes and rendering
See CURRENT_PAGE_INVENTORY.md. Filesystem pages plus menu-driven createPages in gatsby-node.js. There are no real sermon/event detail routes. `/otherdata` is a navigation/footer experiment. `/admin` is a generated Netlify CMS bundle, not a custom authenticated dashboard.

## Content and data dependencies
Local JSON: src/siteContents/menu.json, home/data.json, others/aboutus.json, others/sermon.json, others/events.json. GraphQL queries use allMenuJson, OthersJson, Mdx and Sharp-transformed images. Filesystem sourcing includes overlapping datalogs paths. MDX is registered twice with unsupported name/path options. Markdown content comprises one event and one YouTube sermon. Netlify CMS uses git-gateway/main; its folder paths use gloryhills while image references use Gloryhills. Spotify collection points to a missing folder. No database dump, Supabase credentials, application API, fetch/axios integration or public form handler was found in source. Old admin authentication depends on Netlify Identity/Git Gateway, whose live configuration is unavailable.

## Styling and components
Tailwind 3.4.3, PostCSS, global CSS, compiled page CSS, inline styles and generated JSX/TSX SVG components. Roboto is loaded remotely through CSS. Tailwind globs contain spaces and theme nesting is malformed. No Sass or styled-components dependency.

Preserve content and original images; adapt simple icons, mission/vision composition and resource links. Replace Gatsby navigation, HeroSection, SuperGrid/ImageGrid and footer with semantic responsive components. Replace Helmet SEO. Retire unused generated decorative templates and Vite entry only after parity. Do not copy lorem ipsum, corporate boilerplate or fictional testimony text into production.

## SEO
SiteMeta uses Helmet, lacks canonical/OG/schema coverage, constructs undefined image URLs, and uses an invalid icon link. Declared historic domain is https://ghccglobal.org; ownership/canonical domain needs confirmation. No complete sitemap or redirect map. Installed robots plugin is not configured.

## Forms and content integrity
No functional public forms found. Footer email is kenzi.lawson@example.com and is a placeholder. Phone +2347088665454, address 4 Ogun River Road Isheri Magodo, Sunday 7:30am, Wednesday 6pm and last Saturday 4pm are historical source values requiring confirmation. Event Markdown contains unrelated fictional clockmaker prose. Sermon Markdown has sample description and invalid you.tube URL. Grocery/iStock files are unsuitable for publication without provenance. Existing 2024/2025 events must not be described as upcoming.

## Build verification
Initial build hit a sandbox write restriction in Gatsby config storage. Retried using XDG_CONFIG_HOME under /tmp. Build reports gatsby-plugin-image_95314 at src/components/library/grid.jsx:44: computed StaticImage src cannot be extracted. Also warns about duplicate MDX unsupported options. Full build and browser review have not passed; do not infer parity from source inspection. Development startup was attempted separately. Runtime and audit results will be recorded in TEST_RESULTS.md. npm audit requested; no vulnerability counts asserted before a completed registry response.

## Recommendation
Build a fresh Next.js App Router structure in web/, port content incrementally, and retain old code untouched. React 16/Gatsby coupling and invalid image extraction make in-place conversion riskier. Supabase replaces missing backend services, not Gatsby's frontend runtime. Final cutover requires production build, responsive/browser tests, real authenticated workflows and executable RLS verification.

## Completed dependency and runtime checks
The legacy npm audit returned 98 vulnerabilities: 12 low, 39 moderate, 45 high and 2 critical. The isolated Next.js app audit returned zero on 2026-09-15. The legacy development bundle also fails because React DOM 16 lacks react-dom/client, which Gatsby 5 imports. A working visual review of the old routes is blocked by this incompatibility. Gatsby attempts regenerate public/admin and public/page-data artifacts; do not mistake generated bundle changes for authored migration changes.

## User-confirmed updates
The church has two locations: the existing Isheri Magodo location and headquarters at 3rd Floor, Tejumola House, Plot 24 Ogunnusi Road (beside CLAM), Ojodu Berger, Lagos. Headquarters only: Wednesday 6pm–8:30pm and Sunday 8am–1pm WAT. Spotify podcast supplied and integrated. User will create a new Supabase project; no project was previously available.
