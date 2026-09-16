import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';

export default async function AuditLogs() {
  const {db} = await requireAdmin('super_admin');

  const {data: logs, error} = await db
    .from('audit_logs')
    .select('*')
    .order('created_at', {ascending: false})
    .limit(100);

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12}}>
        <div>
          <p className="eyebrow">GOVERNANCE & COMPLIANCE</p>
          <h1>Administrative Audit Trail</h1>
          <p className="lead" style={{color: '#666', margin: 0}}>
            System log recording content creation, editorial publications, unpublishing, archives, role changes, and setting updates.
          </p>
        </div>
        <Link href="/admin" className="button small light">
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{background: '#f8fafc', padding: 16, borderRadius: 'var(--radius)', border: '1px solid #e2e8f0', marginBottom: 28}}>
        <p style={{margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5}}>
          <strong>Security Note:</strong> The audit trail deliberately excludes passwords, authentication tokens, and private form submission bodies.
          Only verified super-administrators can view this log.
        </p>
      </div>

      {error && <p role="alert">Unable to load audit logs. Please verify super-administrator database policies.</p>}

      <div style={{overflowX: 'auto', background: '#ffffff', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left'}}>
          <thead>
            <tr style={{background: '#f1f5f9', borderBottom: '1px solid #e2e8f0'}}>
              <th style={{padding: '12px 16px', fontWeight: 600, color: '#334155'}}>Timestamp</th>
              <th style={{padding: '12px 16px', fontWeight: 600, color: '#334155'}}>Action</th>
              <th style={{padding: '12px 16px', fontWeight: 600, color: '#334155'}}>Content Type</th>
              <th style={{padding: '12px 16px', fontWeight: 600, color: '#334155'}}>Status Transition</th>
              <th style={{padding: '12px 16px', fontWeight: 600, color: '#334155'}}>Actor</th>
              <th style={{padding: '12px 16px', fontWeight: 600, color: '#334155'}}>Record ID</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const isDelete = log.action === 'DELETE';
                const isRole = log.action === 'ROLE_CHANGE';
                const isPublish = log.action === 'PUBLISH';
                const isArchive = log.action === 'ARCHIVE';

                return (
                  <tr key={log.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                    <td style={{padding: '12px 16px', whiteSpace: 'nowrap', color: '#64748b'}}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{padding: '12px 16px'}}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: isDelete
                            ? '#fee2e2'
                            : isRole
                            ? '#fef3c7'
                            : isPublish
                            ? '#dcfce7'
                            : isArchive
                            ? '#f3f4f6'
                            : '#e0e7ff',
                          color: isDelete
                            ? '#b91c1c'
                            : isRole
                            ? '#b45309'
                            : isPublish
                            ? '#15803d'
                            : isArchive
                            ? '#4b5563'
                            : '#3730a3',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{padding: '12px 16px', fontWeight: 500, color: '#1e293b'}}>
                      {log.content_type || log.table_name}
                    </td>
                    <td style={{padding: '12px 16px', color: '#475569'}}>
                      {log.previous_status || log.new_status ? (
                        <>
                          <span style={{color: '#94a3b8'}}>{log.previous_status || 'none'}</span>
                          {' → '}
                          <span style={{fontWeight: 600}}>{log.new_status || 'none'}</span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{padding: '12px 16px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem'}}>
                      {log.actor ? `${log.actor.slice(0, 8)}...` : 'system'}
                    </td>
                    <td style={{padding: '12px 16px', fontFamily: 'monospace', color: '#64748b', fontSize: '0.8rem'}}>
                      {log.record_id ? `${log.record_id.slice(0, 12)}...` : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{padding: '24px 16px', textAlign: 'center', color: '#64748b'}}>
                  No audit log entries recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

