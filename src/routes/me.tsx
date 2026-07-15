import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { ArrowRight, FilePlus, Globe, LockKey } from '@phosphor-icons/react'
import { listMyRegexDocuments } from '~/server/regexes'
import { getSessionUser } from '~/server/session'

export const Route = createFileRoute('/me')({
  loader: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/auth', search: { returnTo: '/me' } })
    return { user, documents: await listMyRegexDocuments() }
  },
  head: () => ({ meta: [{ title: 'My regexes — iHateRegex' }] }),
  component: MyRegexes,
})

function MyRegexes() {
  const { user, documents } = Route.useLoaderData()

  return (
    <main className="collection-page">
      <header className="collection-header">
        <div><span className="eyebrow">Private notebook</span><h1>{user.name}’s regexes</h1><p>Draft privately. Publish deliberately. Every edit stays attached to your account.</p></div>
        <Link to="/playground" className="button hero-button"><FilePlus size={17} /> New regex</Link>
      </header>

      {documents.length ? (
        <div className="document-grid">
          {documents.map((document) => (
            <Link key={document.id} to="/r/$id" params={{ id: document.id }} className="document-card">
              <div className="document-card-top">
                <span className={`visibility-pill ${document.isPublic ? 'public' : ''}`}>{document.isPublic ? <Globe size={13} /> : <LockKey size={13} />}{document.isPublic ? 'Published' : 'Private'}</span>
                <ArrowRight size={17} />
              </div>
              <h2>{document.title}</h2>
              <div className="document-terminal"><span>$ pattern</span><code>/{document.pattern}/{document.flags}</code></div>
              <p>{document.notes.replace(/[#*_`]/g, '').slice(0, 130) || 'No notes yet.'}</p>
              <span className="document-date">Updated {new Date(document.updatedAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      ) : (
        <section className="empty-collection"><span><FilePlus size={24} /></span><h2>Your notebook is quiet.</h2><p>Start with a pattern you never want to decode twice.</p><Link to="/playground" className="button primary-button">Open playground</Link></section>
      )}
    </main>
  )
}
