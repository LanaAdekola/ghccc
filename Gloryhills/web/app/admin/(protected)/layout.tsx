import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';
import {logout} from './actions';
export default async function Layout({children}:{children:React.ReactNode}){await requireAdmin();return <main id="main" className="page-heading"><p className="eyebrow">CONTENT MANAGEMENT</p><div className="admin-links"><Link href="/admin">Dashboard</Link><Link href="/admin/edit/new">New content</Link><form action={logout}><button className="button small">Sign out</button></form></div>{children}</main>}
