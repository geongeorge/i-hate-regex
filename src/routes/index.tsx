import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen, Database, GitBranch, MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { catalog } from '~/data/catalog'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return catalog
    return catalog.filter((entry) =>
      [entry.title, entry.description, ...entry.tags].join(' ').toLowerCase().includes(normalized),
    )
  }, [query])

  return (
    <main>
      <section className="hero">
        <div className="hero-noise" />
        <div className="hero-copy">
          <p className="hero-kicker"><span /> Don’t just use it. Understand it.</p>
          <h1>Regex without the<br /><em>guesswork.</em></h1>
          <p className="hero-description">
            Test patterns, see their structure, document the tricky parts, and share a durable workspace with your team.
          </p>
          <div className="hero-actions">
            <Link to="/playground" className="button hero-button">
              Start a regex <ArrowRight size={17} weight="bold" />
            </Link>
            <a href="#library" className="text-link">Browse the library</a>
          </div>
        </div>

        <div className="hero-demo" aria-label="Example regular expression card">
          <div className="demo-topline">
            <span className="demo-dot red" /><span className="demo-dot yellow" /><span className="demo-dot green" />
            <span className="demo-file">email.regex</span>
          </div>
          <div className="demo-expression"><span>/</span>[^@\s]+@[^@\s]+\.[^@\s]+<span>/gm</span></div>
          <div className="demo-test">
            <span>hello@ihateregex.io</span>
            <span>not-an-email</span>
            <span>team@example.dev</span>
          </div>
          <div className="demo-footer"><span><Sparkle size={14} weight="fill" /> 2 matches</span><span>exit 0 · valid expression</span></div>
        </div>
      </section>

      <section className="feature-strip" aria-label="Product features">
        <div><GitBranch /><span><strong>See the structure</strong>Browser-rendered railroad diagrams</span></div>
        <div><BookOpen /><span><strong>Explain the why</strong>Markdown notes beside every pattern</span></div>
        <div><Database /><span><strong>Share a workspace</strong>Saved in Postgres, not query strings</span></div>
      </section>

      <section id="library" className="library-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">29 practical patterns</span>
            <h2>A library for the regex you actually write.</h2>
          </div>
          <label className="catalog-search">
            <MagnifyingGlass size={18} />
            <span className="sr-only">Search patterns</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search email, URL, date…" />
          </label>
        </div>

        <div className="catalog-grid">
          {results.map((entry, index) => (
            <Link key={entry.id} to="/expr/$id" params={{ id: entry.id }} className="catalog-card">
              <div className="catalog-card-top">
                <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
                <ArrowRight size={17} weight="bold" />
              </div>
              <h3>{entry.title}</h3>
              <p>{entry.description}</p>
              <div className="catalog-terminal">
                <span>$ pattern</span>
                <code>/{entry.regex}/{entry.flag}</code>
              </div>
              <div className="tag-row">
                {entry.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </Link>
          ))}
        </div>
        {!results.length && <div className="no-results">No patterns found. Try a broader search.</div>}
      </section>
    </main>
  )
}
