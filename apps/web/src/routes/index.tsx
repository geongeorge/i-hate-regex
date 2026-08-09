import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, MagnifyingGlass } from '@phosphor-icons/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { catalog } from '~/data/catalog'
import { tokenizeRegex } from '~/lib/regex-explain'

export const Route = createFileRoute('/')({
  component: Home,
})

const demoPattern = '[^@\\s]+@[^@\\s]+\\.[^@\\s]+'
const demoFlags = 'gm'
const demoLines = ['hello@ihateregex.io', 'not-an-email', 'team@example.dev']

function HeroDemo() {
  const svgRef = useRef<SVGSVGElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<{ index: number; left: number } | null>(null)
  const tokens = useMemo(() => tokenizeRegex(demoPattern, demoFlags), [])
  const matchCount = useMemo(
    () => demoLines.filter((line) => new RegExp(demoPattern).test(line)).length,
    [],
  )

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let cancelled = false
    import('@ihateregex/regex-railroad-diagram')
      .then(({ renderRegexDiagram }) => {
        if (cancelled) return
        return renderRegexDiagram(svg, { pattern: demoPattern, flags: demoFlags })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  function activateToken(index: number, target: HTMLElement) {
    const row = rowRef.current
    if (!row) return
    const rowRect = row.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    const left = Math.max(12, Math.min(rect.left - rowRect.left, rowRect.width - 260))
    setActive({ index, left })
  }

  const activeToken = active ? tokens[active.index] : null

  return (
    <div className="hero-demo" aria-label="A live example: an email regex, its railroad diagram, and its matches">
      <div className="demo-topline">
        <span className="demo-file">email.regex</span>
        <span className="demo-live">live</span>
      </div>
      <div ref={rowRef} className="demo-expression-row" onMouseLeave={() => setActive(null)}>
        <div className="demo-expression">
          <span className="demo-slash">/</span>
          {tokens.map((token, index) => (
            <span
              key={index}
              className={`tok-${token.type} demo-tok ${active?.index === index ? 'tok-hover' : ''}`}
              onMouseEnter={(event) => activateToken(index, event.currentTarget)}
            >
              {token.text}
            </span>
          ))}
          <span className="demo-slash">/</span>
          <span className="tok-meta">{demoFlags}</span>
        </div>
        {activeToken && active && (
          <div className="token-popover demo-popover" style={{ left: active.left }} role="tooltip">
            <div className="token-popover-head">
              <span className={`token-popover-type tok-${activeToken.type}`}>{activeToken.title}</span>
              <code>{activeToken.text}</code>
            </div>
            <p>{activeToken.detail}</p>
          </div>
        )}
      </div>
      <div className="demo-diagram">
        <svg ref={svgRef} className="hero-diagram" role="img" aria-label="Railroad diagram of the email regular expression" />
      </div>
      <div className="demo-test">
        {demoLines.map((line) => (
          <span key={line} className={new RegExp(demoPattern).test(line) ? 'is-match' : ''}>{line}</span>
        ))}
      </div>
      <div className="demo-footer">
        <span>{matchCount} matches</span>
        <span className="demo-hint">hover the pattern to decode it</span>
      </div>
    </div>
  )
}

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
        <div className="hero-copy">
          <p className="hero-tagline">Don’t just use it. Understand it.</p>
          <h1 className="hero-title">
            <span className="hero-slash">/</span>regex without the{' '}
            <span className="hero-strike">guesswork</span>
            <span className="hero-slash">/</span><span className="hero-flag">g</span>
          </h1>
          <p className="hero-description">
            Test a pattern, watch its structure drawn as a diagram, hover any part
            to learn what it does, and share one link with your team.
          </p>
          <div className="hero-actions">
            <Link to="/playground" className="button hero-button">
              Start a regex <ArrowRight size={17} weight="bold" />
            </Link>
            <a href="#library" className="text-link">Browse the library</a>
          </div>
        </div>

        <HeroDemo />

        <div className="feature-flags" aria-label="What you get">
          <div><code>--diagram</code><span>every pattern drawn as a railroad you can read</span></div>
          <div><code>--explain</code><span>hover any token for a plain-English answer</span></div>
          <div><code>--share</code><span>one link your whole team can open</span></div>
        </div>
      </section>

      <section id="library" className="library-section">
        <div className="section-heading">
          <div>
            <span className="section-label">pattern library · {catalog.length} entries</span>
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
