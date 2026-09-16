import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';
import {logout} from './actions';

export default async function Layout({children}: {children: React.ReactNode}) {
  const {role, user} = await requireAdmin();

  return (
    <main id="main" className="page-heading">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12}}>
        <div>
          <p className="eyebrow">CHURCH ADMINISTRATION PORTAL</p>
          <p style={{margin: 0, fontSize: '0.85rem', color: '#888'}}>
            Signed in as <strong>{user.email || user.id.slice(0, 8)}</strong> · Role:{' '}
            <span
              style={{
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: role === 'super_admin' ? '#74162a' : role === 'content_admin' ? '#334155' : '#1e293b',
                color: '#fff',
              }}
            >
              {role.replace('_', ' ')}
            </span>
          </p>
        </div>
      </div>

      <nav
        className="admin-links"
        aria-label="Admin Navigation"
        style={{margin: '24px 0 36px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}
      >
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/media-tools">Media Tools</Link>
        <Link href="/admin/media">Media Library</Link>
        <Link href="/admin/edit/new">New Content</Link>
        {role === 'super_admin' && <Link href="/admin/audit-logs">Audit Logs</Link>}
        <form action={logout} style={{marginLeft: 'auto'}}>
          <button className="button small light">Sign out</button>
        </form>
      </nav>

      {children}
    </main>
  );
}
