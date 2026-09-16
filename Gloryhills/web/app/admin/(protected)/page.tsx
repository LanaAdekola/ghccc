import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';
import {kinds, mediaEditorAllowedKinds} from '@/lib/validation';
import {setRole, deleteSubmission, archiveContent, restoreContent, deleteContent} from './actions';

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{kind?: string; status?: string; saved?: string; deleted?: string; archived?: string; restored?: string; error?: string}>;
}) {
  const {db, role} = await requireAdmin();
  const q = await searchParams;

  let query = db.from('content').select('*').order('updated_at', {ascending: false}).limit(100);

  if (q.kind) {
    query = query.eq('kind', q.kind);
  }
  if (q.status && ['draft', 'published', 'archived'].includes(q.status)) {
    query = query.eq('status', q.status);
  }

  const {data: rows, error} = await query;

  // Private submissions are restricted to content_admin and super_admin
  const canViewSubmissions = role === 'content_admin' || role === 'super_admin';
  const {data: submissions} = canViewSubmissions
    ? await db.from('submissions').select('*').order('created_at', {ascending: false}).limit(50)
    : {data: null};

  const displayedKinds = role === 'media_editor' ? mediaEditorAllowedKinds : kinds;

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16}}>
        <h1>Content Dashboard</h1>
        <Link href="/admin/edit/new" className="button small">
          + Create New Content
        </Link>
      </div>

      {q.saved && <p className="notice" role="status">✓ Content successfully saved.</p>}
      {q.archived && <p className="notice" role="status">✓ Content moved to archive (unlisted from website).</p>}
      {q.restored && <p className="notice" role="status">✓ Content restored from archive to drafts.</p>}
      {q.deleted && <p className="notice" role="status">✓ Content record permanently removed.</p>}
      {q.error === 'forbidden' && <p role="alert" style={{color: '#e11d48'}}>Permission denied: Your role does not have authorization for that action.</p>}

      {/* Filter by Status */}
      <div style={{margin: '20px 0 10px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap'}}>
        <span style={{fontSize: '0.85rem', fontWeight: 600}}>Status:</span>
        <Link
          href={`/admin${q.kind ? `?kind=${q.kind}` : ''}`}
          className={`button small ${!q.status ? '' : 'light'}`}
        >
          All
        </Link>
        <Link
          href={`/admin?status=published${q.kind ? `&kind=${q.kind}` : ''}`}
          className={`button small ${q.status === 'published' ? '' : 'light'}`}
        >
          Published
        </Link>
        <Link
          href={`/admin?status=draft${q.kind ? `&kind=${q.kind}` : ''}`}
          className={`button small ${q.status === 'draft' ? '' : 'light'}`}
        >
          Drafts
        </Link>
        <Link
          href={`/admin?status=archived${q.kind ? `&kind=${q.kind}` : ''}`}
          className={`button small ${q.status === 'archived' ? '' : 'light'}`}
        >
          Archived
        </Link>
      </div>

      {/* Filter by Kind */}
      <nav className="admin-links" aria-label="Content types" style={{marginBottom: 30}}>
        <Link href={`/admin${q.status ? `?status=${q.status}` : ''}`} style={{fontWeight: !q.kind ? 'bold' : 'normal'}}>
          All types
        </Link>
        {displayedKinds.map((x) => (
          <Link
            key={x}
            href={`/admin?kind=${x}${q.status ? `&status=${q.status}` : ''}`}
            style={{fontWeight: q.kind === x ? 'bold' : 'normal'}}
          >
            {x.replaceAll('_', ' ')}
          </Link>
        ))}
      </nav>

      {error && <p role="alert">Content could not be loaded. Check database connection and permissions.</p>}

      {/* Content items */}
      <div className="cards">
        {rows && rows.length > 0 ? (
          rows.map((x) => (
            <article className="card" key={x.id} style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                  <p className="eyebrow" style={{margin: 0}}>{x.kind.replaceAll('_', ' ')}</p>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background: x.status === 'published' ? '#15803d' : x.status === 'archived' ? '#6b7280' : '#ca8a04',
                      color: '#fff',
                    }}
                  >
                    {x.status.toUpperCase()}
                  </span>
                </div>

                <h2 style={{fontSize: '1.25rem', marginTop: 0}}>{x.title}</h2>
                {x.description && <p style={{fontSize: '0.9rem', color: '#555'}}>{x.description.slice(0, 120)}...</p>}

                <div style={{fontSize: '0.78rem', color: '#777', margin: '12px 0'}}>
                  <p style={{margin: '2px 0'}}>Updated: {new Date(x.updated_at).toLocaleString()}</p>
                  {x.published_at && <p style={{margin: '2px 0'}}>Published: {new Date(x.published_at).toLocaleString()}</p>}
                </div>
              </div>

              <div style={{borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                <Link className="button small" href={`/admin/edit/${x.id}`}>
                  Edit
                </Link>
                <Link className="button small light" href={`/admin/preview/${x.id}`}>
                  Preview
                </Link>

                {x.status !== 'archived' ? (
                  <form action={archiveContent}>
                    <input type="hidden" name="id" value={x.id} />
                    <button
                      type="submit"
                      className="button small light"
                      style={{background: '#f1f5f9', color: '#475569'}}
                    >
                      Archive
                    </button>
                  </form>
                ) : (
                  (role === 'content_admin' || role === 'super_admin') && (
                    <form action={restoreContent}>
                      <input type="hidden" name="id" value={x.id} />
                      <button type="submit" className="button small light" style={{background: '#e0e7ff', color: '#3730a3'}}>
                        Restore
                      </button>
                    </form>
                  )
                )}

                {(role === 'content_admin' || role === 'super_admin') && (
                  <details style={{display: 'inline-block'}}>
                    <summary style={{cursor: 'pointer', fontSize: '0.8rem', color: '#e11d48', padding: '4px'}}>
                      Delete
                    </summary>
                    <div style={{position: 'absolute', background: '#fff', padding: '12px', border: '1px solid #e11d48', borderRadius: '6px', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
                      <p style={{margin: '0 0 8px', fontSize: '0.8rem', color: '#111'}}>Permanently delete this record?</p>
                      <form action={deleteContent}>
                        <input type="hidden" name="id" value={x.id} />
                        <button type="submit" className="button small" style={{background: '#e11d48', color: '#fff'}}>
                          Confirm Permanent Delete
                        </button>
                      </form>
                    </div>
                  </details>
                )}
              </div>
            </article>
          ))
        ) : (
          <p>No content records found matching this filter.</p>
        )}
      </div>

      {/* Private Submissions Section (Restricted to content_admin and super_admin) */}
      {canViewSubmissions && (
        <>
          <h2 style={{marginTop: 60}}>Private Form Submissions</h2>
          <p style={{color: '#666', fontSize: '0.9rem'}}>
            Confidential prayer requests and visitor inquiries. Submissions auto-expire after 90 days.
          </p>
          <div className="cards">
            {submissions && submissions.length > 0 ? (
              submissions.map((x) => (
                <article className="card" key={x.id}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <p className="eyebrow" style={{margin: 0}}>{x.kind}</p>
                    <span style={{fontSize: '0.75rem', color: '#888'}}>
                      {new Date(x.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3>{x.name}</h3>
                  <p style={{fontSize: '0.85rem', color: '#444'}}>
                    <a href={`mailto:${x.email}`} style={{textDecoration: 'underline'}}>
                      {x.email}
                    </a>
                  </p>
                  <p style={{whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '8px', borderRadius: '4px', fontSize: '0.9rem'}}>
                    {x.message}
                  </p>
                  <form action={deleteSubmission} style={{marginTop: '12px'}}>
                    <input type="hidden" name="id" value={x.id} />
                    <button className="button small light" style={{color: '#e11d48'}}>
                      Delete Submission
                    </button>
                  </form>
                </article>
              ))
            ) : (
              <p>No new submissions pending review.</p>
            )}
          </div>
        </>
      )}

      {/* Administrator Role Management (Restricted to super_admin) */}
      {role === 'super_admin' && (
        <section style={{marginTop: 60, padding: 24, border: '1px solid #e2e8f0', borderRadius: 'var(--radius)'}}>
          <h2>Administrator Access Management</h2>
          <p>
            Manage team access. <strong>Security Requirement:</strong> The church must retain at least two trusted
            super-administrator accounts.
          </p>
          <form className="form" action={setRole} style={{maxWidth: 600}}>
            <label>
              User ID (Supabase Auth UUID)
              <input name="user_id" required pattern="[0-9a-fA-F-]{36}" placeholder="e.g. 00000000-0000-0000-0000-000000000000" />
            </label>
            <label>
              Assigned Role
              <select name="role">
                <option value="media_editor">Media Editor (Sermons, Events, Social, Photos)</option>
                <option value="content_admin">Content Admin (Full CMS Content + Form Review)</option>
                <option value="super_admin">Super Administrator (Full System + Roles + Audit Logs)</option>
                <option value="remove">Remove Access</option>
              </select>
            </label>
            <button className="button">Update Role</button>
          </form>
        </section>
      )}
    </>
  );
}
