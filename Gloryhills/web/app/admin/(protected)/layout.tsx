import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';
import {logout} from './actions';
import {AdminNavigation} from './navigation';
export default async function Layout({children}: {children: React.ReactNode}) {
 const {role,user}=await requireAdmin('marketing_admin');
 return <div className="admin-shell"><aside className="admin-sidebar"><Link className="admin-brand" href={role==='marketing_admin'?'/admin/marketing':'/admin'}><span className="admin-monogram">GH</span><span>Glory Hills<small>TEAM WORKSPACE</small></span></Link><p className="admin-nav-caption">MANAGE YOUR WEBSITE</p><AdminNavigation role={role}/><div className="admin-sidebar-bottom"><Link href="/" target="_blank" rel="noopener noreferrer">View public website ↗</Link><p>Prepare your content, preview it, then publish when it is ready.</p></div></aside><div className="admin-workspace"><header className="admin-topbar"><div><span className="admin-role">{role.replaceAll('_',' ')}</span><p>{user.email||user.id.slice(0,8)}</p></div><form action={logout}><button className="button small light">Sign out</button></form></header><main id="main" className="admin-content">{children}</main></div></div>;
}
