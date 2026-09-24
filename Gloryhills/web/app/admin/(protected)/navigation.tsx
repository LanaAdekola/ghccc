'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
export function AdminNavigation({role}:{role:string}) {
 const path=usePathname();
 const links=[['/admin/media-tools','Media tools'],...(role!=='marketing_admin'?[['/admin','Content dashboard'],['/admin/edit/new','Create content'],['/admin/media','Media library']]:[]),...(role!=='media_editor'?[['/admin/marketing','Marketing & analytics']]:[]),...(role==='super_admin'?[['/admin/audit-logs','Audit logs']]:[])];
 return <nav className="admin-navigation" aria-label="Administration">{links.map(([href,label])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav>;
}
