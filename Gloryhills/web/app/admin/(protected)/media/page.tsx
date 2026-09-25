import Link from 'next/link';
import Image from 'next/image';
import {requireAdmin} from '@/lib/supabase';
import {upload} from '../actions';

export default async function MediaLibrary({
  searchParams,
}: {
  searchParams: Promise<{uploaded?: string; error?: string}>;
}) {
  const {db} = await requireAdmin('media_editor');
  const q = await searchParams;

  // Retrieve objects from church-media storage bucket
  const {data: files, error} = await db.storage
    .from('church-media')
    .list('', {limit: 100, sortBy: {column: 'created_at', order: 'desc'}});

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12}}>
        <div>
          <p className="eyebrow">ASSET REPOSITORY</p>
          <h1>Church Media Library</h1>
          <p className="lead" style={{color: '#666', margin: 0}}>
            Browse, upload, and reuse church photography, sermon artwork, and event posters.
          </p>
        </div>
        <Link href="/admin" className="button small light">
          ← Back to Dashboard
        </Link>
      </div>

      {q.uploaded && (
        <p className="notice" role="status" style={{background: '#f0fdf4', color: '#15803d', borderColor: '#86efac'}}>
          ✓ Image successfully uploaded and stored: <code>{q.uploaded}</code>. You can copy this filename and paste it into any content record.
        </p>
      )}
      {q.error === 'upload' && (
        <p className="notice" role="alert" style={{background: '#fee2e2', color: '#b91c1c', borderColor: '#f87171'}}>
          Upload failed. Please ensure the file is an image (JPEG, PNG, or WebP) and under 5 MB.
        </p>
      )}

      {/* Upload Box */}
      <section
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 'var(--radius)',
          padding: '24px',
          marginBottom: 36,
        }}
      >
        <h2 style={{fontSize: '1.2rem', marginTop: 0}}>Upload New Photograph or Graphic</h2>
        <p style={{fontSize: '0.85rem', color: '#666'}}>
          Supported formats: JPEG, PNG, WebP. Maximum file size: 5 MB. Files are stored securely with automated unique filenames.
        </p>
        <form className="form" action={upload} style={{display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap'}}>
          <input type="hidden" name="id" value="media-library" />
          <input type="hidden" name="redirect" value="/admin/media" />
          <label style={{flex: 1, minWidth: '240px', margin: 0}}>
            Select File from Device
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <label style={{flex: 1, minWidth: '240px', margin: 0}}>
            Descriptive Alt Text (For accessibility)
            <input name="alt" placeholder="Describe the image content (avoid filenames)" maxLength={300} />
          </label>
          <button className="button" type="submit">
            Upload Image
          </button>
        </form>
      </section>

      {/* Media Grid */}
      <h2>Stored Media Files ({files?.length || 0})</h2>
      {error && <p role="alert">Unable to fetch media library items. Check database storage policies.</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 20,
          marginTop: 16,
        }}
      >
        {files && files.length > 0 ? (
          files
            .filter((f) => !f.name.startsWith('.'))
            .map((f) => {
              const mediaUrl = `/api/media/${encodeURIComponent(f.name)}`;
              return (
                <article
                  key={f.id || f.name}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div
                    style={{
                      height: '160px',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Image
                      src={mediaUrl}
                      alt={f.metadata?.alt || ''}
                      width={300}
                      height={200}
                      unoptimized
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                  </div>

                  <div style={{padding: '12px'}}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                      }}
                    >
                      {f.name}
                    </p>
                    <p style={{margin: '4px 0 10px', fontSize: '0.75rem', color: '#64748b'}}>
                      {f.metadata?.size ? `${Math.round(f.metadata.size / 1024)} KB` : ''} ·{' '}
                      {f.created_at ? new Date(f.created_at).toLocaleDateString() : ''}
                    </p>

                    <div style={{display: 'flex', gap: 6}}>
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button small light"
                        style={{flex: 1, textAlign: 'center', fontSize: '0.75rem', padding: '6px 8px'}}
                      >
                        View Full ↗
                      </a>
                    </div>
                  </div>
                </article>
              );
            })
        ) : (
          <p>No uploaded media files found yet. Upload your first image above.</p>
        )}
      </div>
    </div>
  );
}
