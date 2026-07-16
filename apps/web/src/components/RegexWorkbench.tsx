import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Check,
  Cloud,
  CloudArrowUp,
  Code,
  Copy,
  FileText,
  FloppyDisk,
  Globe,
  LockKey,
  MagicWand,
  PencilLine,
  Sparkle,
} from '@phosphor-icons/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MatchPreview } from './MatchPreview'
import { RegexDiagram } from './RegexDiagram'
import { authClient } from '~/lib/auth-client'
import {
  createRegexDocument,
  publishRegexDocument,
  saveRegexDocument,
} from '~/server/regexes'
import type { RegexDraft } from '~/types/regex'

const draftStorageKey = 'ihateregex:pending-draft'

const flagOptions = [
  { value: 'g', label: 'global' },
  { value: 'i', label: 'ignore case' },
  { value: 'm', label: 'multiline' },
  { value: 's', label: 'dot all' },
  { value: 'u', label: 'unicode' },
  { value: 'y', label: 'sticky' },
]

type Props = {
  initialDraft: RegexDraft
  documentId?: string
  sourceLabel?: string
  mode?: 'editable' | 'library' | 'public'
  initiallyPublic?: boolean
  ownerName?: string
}

export function RegexWorkbench({
  initialDraft,
  documentId,
  sourceLabel,
  mode = 'editable',
  initiallyPublic = false,
  ownerName,
}: Props) {
  const navigate = useNavigate()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [draft, setDraft] = useState(initialDraft)
  const [savedDraft, setSavedDraft] = useState(initialDraft)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isPublic, setIsPublic] = useState(initiallyPublic)
  const [notice, setNotice] = useState<string | null>(null)
  const [notesMode, setNotesMode] = useState<'write' | 'preview'>('write')
  const readOnly = mode !== 'editable'

  useEffect(() => {
    if (readOnly || documentId) return
    const pending = window.sessionStorage.getItem(draftStorageKey)
    if (!pending) return
    try {
      const restored = JSON.parse(pending) as RegexDraft
      setDraft(restored)
      setSavedDraft(initialDraft)
      setNotice('Draft restored after sign in')
      window.sessionStorage.removeItem(draftStorageKey)
    } catch {
      window.sessionStorage.removeItem(draftStorageKey)
    }
  }, [documentId, initialDraft, readOnly])

  const regexError = useMemo(() => {
    try {
      new RegExp(draft.pattern, draft.flags)
      return null
    } catch (cause) {
      return cause instanceof Error ? cause.message.replace(/^Invalid regular expression:\s*/, '') : 'Invalid expression'
    }
  }, [draft.pattern, draft.flags])

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft)

  function patchDraft(patch: Partial<RegexDraft>) {
    if (readOnly) return
    setDraft((current) => ({ ...current, ...patch }))
    setNotice(null)
  }

  function toggleFlag(flag: string) {
    const next = draft.flags.includes(flag)
      ? draft.flags.replace(flag, '')
      : `${draft.flags}${flag}`
    patchDraft({ flags: next })
  }

  async function save() {
    if (regexError || saving || readOnly) return null

    if (!session?.user) {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft))
      await navigate({ to: '/auth', search: { returnTo: '/playground' } })
      return null
    }

    setSaving(true)
    setNotice(null)

    try {
      if (documentId) {
        const saved = await saveRegexDocument({ data: { id: documentId, draft } })
        if (!saved) throw new Error('This regex is unavailable or belongs to another account')
        setSavedDraft(draft)
        setNotice('Saved privately')
        return saved
      }

      const created = await createRegexDocument({ data: draft })
      setSavedDraft(draft)
      await navigate({ to: '/r/$id', params: { id: created.id } })
      return created
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not save this regex')
      return null
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished() {
    if (!documentId || publishing) return
    setPublishing(true)
    setNotice(null)
    try {
      if (isDirty) {
        const saved = await save()
        if (!saved) return
      }
      const updated = await publishRegexDocument({ data: { id: documentId, published: !isPublic } })
      if (!updated) throw new Error('This regex is unavailable or belongs to another account')
      setIsPublic(updated.isPublic)
      setNotice(updated.isPublic ? 'Published to the community' : 'Made private')
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not change visibility')
    } finally {
      setPublishing(false)
    }
  }

  async function remix() {
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify({
      ...draft,
      title: `${draft.title} remix`,
    }))
    await navigate({ to: '/playground' })
  }

  async function copyPublicLink() {
    if (!documentId) return
    await navigator.clipboard.writeText(`${window.location.origin}/community/${documentId}`)
    setNotice('Public link copied')
  }

  const accessLabel = mode === 'library'
    ? 'Curated library · read only'
    : mode === 'public'
      ? `${ownerName ? `Shared by ${ownerName}` : 'Community pattern'} · read only`
      : documentId
        ? isPublic ? 'Community published' : 'Private workspace'
        : 'New private workspace'

  return (
    <main className={`workbench-shell ${readOnly ? 'readonly-workbench' : ''}`}>
      <header className="workbench-header">
        <div className="title-field-wrap">
          <span className="eyebrow">{sourceLabel ?? accessLabel}</span>
          <label htmlFor="regex-title" className="sr-only">Regex title</label>
          <input
            id="regex-title"
            className="title-field"
            value={draft.title}
            onChange={(event) => patchDraft({ title: event.target.value })}
            placeholder="Untitled regex"
            readOnly={readOnly}
          />
        </div>

        <div className="save-cluster">
          {readOnly ? (
            <>
              <span className="save-state"><LockKey size={14} /> View-only original</span>
              {mode === 'public' && <button className="button ghost-button" type="button" onClick={copyPublicLink}><Copy size={16} /> Copy link</button>}
              <button className="button primary-button" type="button" onClick={remix}><MagicWand size={16} /> Remix in playground</button>
            </>
          ) : (
            <>
              <span className={`save-state ${isDirty ? 'dirty' : ''}`} role="status" aria-live="polite">
                {isDirty ? <PencilLine size={14} /> : <Cloud size={14} />}
                {notice ?? (isDirty ? 'Unsaved changes' : documentId ? 'Saved' : sessionPending ? 'Checking session' : session?.user ? 'Private draft' : 'Sign in to save')}
              </span>
              {documentId && isPublic && (
                <Link className="button ghost-button" to="/community/$id" params={{ id: documentId }}><Globe size={16} /> Public page</Link>
              )}
              {documentId && (
                <button className="button ghost-button" type="button" onClick={togglePublished} disabled={publishing}>
                  {isPublic ? <LockKey size={16} /> : <Globe size={16} />}
                  {publishing ? 'Updating…' : isPublic ? 'Unpublish' : 'Publish'}
                </button>
              )}
              <button
                className="button primary-button"
                type="button"
                onClick={save}
                disabled={Boolean(regexError) || saving || (!isDirty && Boolean(documentId))}
              >
                {saving ? <CloudArrowUp className="spin" size={16} /> : documentId ? <FloppyDisk size={16} /> : <Sparkle size={16} />}
                {saving ? 'Saving…' : documentId ? 'Save' : session?.user ? 'Save privately' : 'Sign in to save'}
              </button>
            </>
          )}
        </div>
      </header>

      {readOnly && (
        <div className="readonly-ribbon">
          <LockKey size={15} />
          <span>This page is intentionally read-only. Remix it to experiment without changing the original.</span>
        </div>
      )}

      <div className="workbench-grid">
        <div className="workbench-primary">
          <section className={`panel expression-panel ${regexError ? 'has-error' : ''}`}>
            <div className="panel-heading compact-heading">
              <div><span className="eyebrow">JavaScript</span><h2>Expression</h2></div>
              <Code size={18} />
            </div>

            <div className="expression-input-row">
              <span className="regex-slash">/</span>
              <label htmlFor="regex-pattern" className="sr-only">Regular expression</label>
              <textarea
                id="regex-pattern"
                value={draft.pattern}
                onChange={(event) => patchDraft({ pattern: event.target.value })}
                aria-invalid={Boolean(regexError)}
                spellCheck={false}
                rows={2}
                readOnly={readOnly}
              />
              <span className="regex-slash">/</span>
              <span className="inline-flags">{draft.flags}</span>
            </div>

            <div className="flag-row" aria-label="Regular expression flags">
              {flagOptions.map((flag) => {
                const selected = draft.flags.includes(flag.value)
                return readOnly ? (
                  <span key={flag.value} className={`flag-chip ${selected ? 'selected' : ''} ${!selected ? 'muted-flag' : ''}`}>
                    {selected && <Check size={12} />}{flag.value}<span>{flag.label}</span>
                  </span>
                ) : (
                  <button key={flag.value} className={`flag-chip ${selected ? 'selected' : ''}`} type="button" onClick={() => toggleFlag(flag.value)} aria-pressed={selected} title={flag.label}>
                    {selected && <Check size={12} />}{flag.value}<span>{flag.label}</span>
                  </button>
                )
              })}
            </div>
            {regexError && <p className="field-error">{regexError}</p>}
          </section>

          <MatchPreview pattern={draft.pattern} flags={draft.flags} text={draft.testText} onChange={(testText) => patchDraft({ testText })} error={regexError} readOnly={readOnly} />
          <RegexDiagram pattern={draft.pattern} flags={draft.flags} error={regexError} />
        </div>

        <aside className="panel notes-panel">
          <div className="panel-heading notes-heading">
            <div><span className="eyebrow">Context</span><h2>Markdown notes</h2></div>
            {!readOnly && (
              <div className="segmented-control" role="tablist" aria-label="Markdown mode">
                <button type="button" className={notesMode === 'write' ? 'active' : ''} onClick={() => setNotesMode('write')} role="tab" aria-selected={notesMode === 'write'}><FileText size={14} /> Write</button>
                <button type="button" className={notesMode === 'preview' ? 'active' : ''} onClick={() => setNotesMode('preview')} role="tab" aria-selected={notesMode === 'preview'}><Sparkle size={14} /> Preview</button>
              </div>
            )}
          </div>

          {!readOnly && notesMode === 'write' ? (
            <textarea className="notes-editor" aria-label="Markdown notes" value={draft.notes} onChange={(event) => patchDraft({ notes: event.target.value })} placeholder={'## What it matches\n\nExplain the expression, edge cases, and examples…'} spellCheck />
          ) : (
            <article className="markdown-preview">
              {draft.notes ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.notes}</ReactMarkdown> : <p className="empty-note">No notes were added for this expression.</p>}
            </article>
          )}

          <div className="notes-footer"><span>{draft.notes.length.toLocaleString()} characters</span><span>{readOnly ? 'Rendered notes' : 'Markdown supported'}</span></div>
        </aside>
      </div>
    </main>
  )
}
