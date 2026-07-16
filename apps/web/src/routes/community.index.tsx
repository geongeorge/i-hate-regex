import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Globe, Sparkle } from '@phosphor-icons/react'
import { listCommunityRegexDocuments } from '~/server/regexes'

export const Route = createFileRoute('/community/')({
  loader: () => listCommunityRegexDocuments(),
  head: () => ({ meta: [{ title: 'Community regexes — iHateRegex' }] }),
  component: Community,
})

function Community() {
  const documents = Route.useLoaderData()

  return (
    <main className="collection-page community-page">
      <header className="collection-header community-header">
        <div>
          <span className="eyebrow">Published by people who care</span>
          <h1>The community pattern shelf.</h1>
          <p>Useful expressions with the context intact—publicly shared, clearly explained, and safe to remix.</p>
        </div>
        <span className="community-orbit"><Globe size={28} /><i /><i /></span>
      </header>

      {documents.length ? (
        <div className="document-grid">
          {documents.map((document) => (
            <Link key={document.id} to="/community/$id" params={{ id: document.id }} className="document-card community-card">
              <div className="document-card-top">
                <span className="visibility-pill public"><Sparkle size={13} /> By {document.ownerName ?? 'community'}</span>
                <ArrowRight size={17} />
              </div>
              <h2>{document.title}</h2>
              <div className="document-terminal"><span>$ pattern</span><code>/{document.pattern}/{document.flags}</code></div>
              <p>{document.notes.replace(/[#*_`]/g, '').slice(0, 130) || 'Shared without notes.'}</p>
              <span className="document-date">Published {new Date(document.publishedAt ?? document.updatedAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      ) : (
        <section className="empty-collection">
          <span><Globe size={24} /></span>
          <h2>The shelf is waiting.</h2>
          <p>Be the first to publish a regex with a good explanation.</p>
          <Link to="/playground" className="button primary-button">Create a pattern</Link>
        </section>
      )}
    </main>
  )
}
