# Current page inventory

| Existing route | Source | Decision |
|---|---|---|
| / | src/pages/index.jsx → Home | Redesign; preserve mission and resource content |
| /about-us | menu.json → OtherPages | Port mission, vision, senior pastor and six leadership records |
| /sermon | menu.json → OtherPages | Redirect to /sermons; preserve valid source links |
| /event | menu.json → OtherPages | Redirect to /events; quarantine samples and historic promotions |
| /otherdata | src/pages/otherdata.jsx | Retire experiment; redirect to home |
| /admin | public/admin/index.html | Replace Netlify CMS with Supabase-protected administration |

Generated Gatsby development 404 is not authored content. Footer mentions Give, Blog and Resources but has no corresponding working routes. Existing Markdown does not create detail pages. Source review covers all authored route components; browser verification remains subject to legacy startup.
