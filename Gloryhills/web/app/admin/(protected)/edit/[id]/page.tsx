import {origin} from '@/lib/seo';
import {notFound, redirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {requireAdmin} from '@/lib/supabase';
import {kinds, mediaEditorAllowedKinds} from '@/lib/validation';
import {save, upload} from '../../actions';

export default async function Edit({
  params,
  searchParams,
}: {
  params: Promise<{id: string}>;
  searchParams: Promise<{error?: string; uploaded?: string}>;
}) {
  const {id} = await params;
  const q = await searchParams;
  const {db, role} = await requireAdmin();

  const row = id === 'new' ? null : (await db.from('content').select('*').eq('id', id).single()).data;

  if (id !== 'new' && !row) notFound();

  // Role restriction: media_editor cannot edit financial or site settings
  if (role === 'media_editor' && row && !mediaEditorAllowedKinds.includes(row.kind)) {
    redirect('/admin?error=forbidden');
  }

  const displayedKinds = role === 'media_editor' ? mediaEditorAllowedKinds : kinds;
  const currentImageUrl = q.uploaded || row?.image_url || '';
  const currentData = row?.data || {};

  return (
    <div style={{maxWidth: '860px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <h1>{row ? `Edit: ${row.title}` : 'Create New Content'}</h1>
        <Link href="/admin" className="button small light">
          ← Back to Dashboard
        </Link>
      </div>

      {q.error === 'validation' && (
        <p className="notice" role="alert" style={{background: '#fee2e2', color: '#b91c1c', borderColor: '#f87171'}}>
          Validation error: Please check that required fields are filled, URLs start with https://, and images include descriptive alt text.
        </p>
      )}
      {q.error === 'save' && (
        <p className="notice" role="alert" style={{background: '#fee2e2', color: '#b91c1c', borderColor: '#f87171'}}>
          Database error: Unable to save content. Check database permissions or slug uniqueness.
        </p>
      )}
      {q.error === 'upload' && (
        <p className="notice" role="alert" style={{background: '#fee2e2', color: '#b91c1c', borderColor: '#f87171'}}>
          Upload failed: Images must be JPEG, PNG, or WebP and under 5 MB in size.
        </p>
      )}
      {q.uploaded && (
        <p className="notice" role="status" style={{background: '#f0fdf4', color: '#15803d', borderColor: '#86efac'}}>
          ✓ Image successfully uploaded! Remember to save this content to apply changes.
        </p>
      )}

      {/* Main Content Form */}
      <form className="form" action={save} style={{background: '#ffffff', padding: '28px', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0'}}>
        <input type="hidden" name="id" value={id} />

        <fieldset style={{border: 0, padding: 0, margin: '0 0 24px'}}>
          <legend style={{fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#74162a'}}>1. Basic Details</legend>

          <label>
            Content Type
            <select name="kind" defaultValue={row?.kind || 'sermons'}>
              {displayedKinds.map((x) => (
                <option key={x} value={x}>
                  {x.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>

          <label>
            URL Slug (Pre-publication permalink)
            <input
              name="slug"
              required
              pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
              defaultValue={row?.slug || ''}
              placeholder="e.g. grace-and-truth"
            />
            <small style={{color: '#666'}}>Use lowercase letters, numbers, and hyphens. Finalize before initial publishing.</small>
          </label>

          <label>
            Title
            <input name="title" required maxLength={180} defaultValue={row?.title || ''} placeholder="Title of sermon, event, or page" />
          </label>

          <label>
            Brief Description
            <textarea name="description" maxLength={1000} rows={3} defaultValue={row?.description || ''} placeholder="Summary displayed in listings and search previews" />
          </label>

          <label>
            Main Body Content
            <textarea name="body" rows={8} defaultValue={row?.body || ''} placeholder="Detailed text, exposition, or notes" />
          </label>

          <label>
            External Resource / Video Link
            <input name="external_url" type="url" defaultValue={row?.external_url || ''} placeholder="https://www.youtube.com/watch?v=..." />
            <small style={{color: '#666'}}>For sermons: paste the YouTube link here to automatically embed and generate VideoObject schema.</small>
          </label>
        </fieldset>

        <fieldset style={{border: 0, padding: 0, margin: '0 0 24px', borderTop: '1px solid #e2e8f0', paddingTop: 20}}>
          <legend style={{fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#74162a'}}>2. Schedule & Presentation</legend>

          <label>
            Event Date & Time (WAT / UTC)
            <input type="datetime-local" name="starts_at" defaultValue={row?.starts_at?.slice(0, 16) || ''} />
          </label>

          <label>
            Display Order
            <input type="number" min="0" max="10000" name="display_order" defaultValue={row?.display_order || 0} />
            <small style={{color: '#666'}}>Lower numbers appear first in lists.</small>
          </label>

          <label className="check" style={{marginTop: 10}}>
            <input type="checkbox" name="featured" defaultChecked={row?.featured || false} />
            <span>Feature this item prominently on the homepage / section top</span>
          </label>

          <label style={{marginTop: 16}}>
            Publication Workflow Status
            <select name="status" defaultValue={row?.status || 'draft'}>
              <option value="draft">Draft (Private, not visible on website)</option>
              <option value="published">Published (Live to public and sitemap)</option>
              <option value="archived">Archived (Unlisted from website, recoverable)</option>
            </select>
          </label>

          {row?.published_at && (
            <input type="hidden" name="published_at" value={row.published_at} />
          )}
        </fieldset>

        <fieldset style={{border: 0, padding: 0, margin: '0 0 24px', borderTop: '1px solid #e2e8f0', paddingTop: 20}}>
          <legend style={{fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#74162a'}}>3. Media & Visuals</legend>

          <label>
            Image File / Path
            <input name="image_url" defaultValue={currentImageUrl} placeholder="Filename in media library or /images/..." />
            <small style={{color: '#666'}}>
              Upload a new file below or copy a filename from the <Link href="/admin/media" target="_blank">Media Library</Link>.
            </small>
          </label>

          {currentImageUrl && (
            <div style={{margin: '12px 0', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
              <p style={{margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600}}>Image Preview:</p>
              <Image
                src={currentImageUrl.startsWith('/') ? currentImageUrl : `/api/media/${encodeURIComponent(currentImageUrl)}`}
                alt="Uploaded preview"
                width={600}
                height={350}
                unoptimized
                style={{maxWidth: '100%', height: 'auto', maxHeight: '240px', objectFit: 'cover', borderRadius: '4px'}}
              />
            </div>
          )}

          <label>
            Image Alternative Text (Required when a non-decorative image is attached)
            <input name="image_alt" defaultValue={row?.image_alt || ''} placeholder="Describe the image content for accessibility" />
            <small style={{color: '#666'}}>Required for WCAG AA compliance. Filenames (e.g. photo.jpg) are rejected.</small>
          </label>

          <label className="check" style={{marginTop: 8}}>
            <input type="checkbox" name="field_is_decorative" value="true" defaultChecked={currentData.is_decorative === 'true'} />
            <span>Mark image as purely decorative (intentional empty alt text for screen readers)</span>
          </label>

          <label>
            Image Caption (Optional)
            <input name="caption" defaultValue={currentData.caption || ''} placeholder="Optional photo credit or explanatory caption" />
          </label>
        </fieldset>

        {/* Dedicated SEO Controls Section */}
        <fieldset style={{border: 0, padding: 0, margin: '0 0 24px', borderTop: '1px solid #e2e8f0', paddingTop: 20}}>
          <legend style={{fontSize: '1.2rem', fontWeight: 600, marginBottom: 16, color: '#74162a'}}>4. Search Engine Optimization (SEO) & Social Sharing</legend>
          <p style={{fontSize: '0.85rem', color: '#666', marginTop: 0}}>
            Control how this content appears on Google, Facebook, X (Twitter), and WhatsApp. If left blank, sensible defaults will be generated automatically.
          </p>

          <label>
            SEO Title Tag
            <input
              name="seo_title"
              maxLength={180}
              defaultValue={row?.seo_title || ''}
              placeholder="e.g. Walking in Divine Purpose | Glory Hills Community Church"
            />
            <small style={{color: '#666'}}>Recommended: 50–60 characters. Search engines typically truncate longer titles.</small>
          </label>

          <label>
            Meta Description
            <textarea
              name="seo_description"
              rows={3}
              maxLength={300}
              defaultValue={row?.seo_description || ''}
              placeholder="Concise, compelling overview for search result snippets"
            />
            <small style={{color: '#666'}}>Recommended: 140–160 characters.</small>
          </label>

          <label>
            Open Graph Title (Social Media)
            <input name="og_title" defaultValue={currentData.og_title || ''} placeholder="Leave blank to use SEO title" />
          </label>

          <label>
            Open Graph Description (Social Media)
            <textarea name="og_description" rows={2} defaultValue={currentData.og_description || ''} placeholder="Leave blank to use Meta Description" />
          </label>

          <label>
            Social Sharing Image (OG Image)
            <input name="og_image" defaultValue={currentData.og_image || ''} placeholder="Leave blank to use content image or church default" />
          </label>

          <label className="check" style={{marginTop: 12}}>
            <input type="checkbox" name="noindex" defaultChecked={currentData.noindex === 'true'} />
            <span>Search Engine Indexing: Check to hide this page from search engines (noindex)</span>
          </label>

          {/* Live Search & Social Preview */}
          <div style={{marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
            <p style={{margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#334155'}}>
              Search Result Snippet Preview (Google):
            </p>
            <div style={{fontFamily: 'arial, sans-serif', color: '#202124'}}>
              <div style={{fontSize: '0.8rem', color: '#202124', marginBottom: 2}}>
                {origin()}/{row?.kind === 'pages' ? row?.slug : `${row?.kind || 'content'}/${row?.slug || 'preview'}`}
              </div>
              <div style={{fontSize: '1.2rem', color: '#1a0dab', textDecoration: 'none', lineHeight: '1.3'}}>
                {row?.seo_title || row?.title || 'Page Title'} | Glory Hills Community Church
              </div>
              <div style={{fontSize: '0.85rem', color: '#4d5156', marginTop: 3}}>
                {row?.seo_description || row?.description || 'Page description will appear here as a snippet in search results...'}
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset><legend>Content-specific details</legend><p>Complete the fields relevant to this content. Service schedules need location, day, start, end and timezone; gallery images need the album slug.</p>{[['speaker','Sermon speaker'],['venue','Event venue'],['location','Service location'],['day','Service day'],['start','Start time (HH:MM)'],['end','End time (HH:MM)'],['timezone','Timezone (Africa/Lagos)'],['album_slug','Gallery album slug']].map(([key,label])=><label key={key}>{label}<input name={'field_'+key} defaultValue={currentData[key]||''}/></label>)}</fieldset>
        {/* Additional Data Envelope (Preserved for system configuration) */}
        {role !== 'media_editor' && (
          <details style={{marginBottom: 24}}>
            <summary style={{cursor: 'pointer', fontSize: '0.9rem', color: '#666'}}>
              Advanced Settings & Additional Fields (JSON)
            </summary>
            <div style={{marginTop: 10}}>
              <textarea name="data" rows={5} defaultValue={JSON.stringify(currentData, null, 2)} />
              <small style={{color: '#666'}}>Custom attributes, giving bank credentials, and system settings.</small>
            </div>
          </details>
        )}

        <div style={{display: 'flex', gap: 12, alignItems: 'center', marginTop: 24}}>
          <button className="button" type="submit">
            Save Content Record
          </button>
          <Link href="/admin" className="button light">
            Cancel
          </Link>
        </div>
      </form>

      {/* Image Upload Form */}
      <section style={{marginTop: 40, padding: 24, background: '#f8fafc', borderRadius: 'var(--radius)', border: '1px solid #e2e8f0'}}>
        <h2 style={{fontSize: '1.15rem', marginTop: 0}}>Upload New Image File</h2>
        <p style={{fontSize: '0.85rem', color: '#666'}}>
          Upload JPEG, PNG, or WebP (max 5 MB). File will be given a secure unique filename and stored safely in Supabase Storage.
        </p>
        <form className="form" action={upload} style={{display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap'}}>
          <input type="hidden" name="id" value={id} />
          <label style={{flex: 1, minWidth: '240px', margin: 0}}>
            Select File
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
          </label>
          <button className="button small" type="submit">
            Upload to Library
          </button>
        </form>
      </section>
    </div>
  );
}
