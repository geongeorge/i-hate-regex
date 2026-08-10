import { useEffect, useMemo, useRef, useState } from 'react'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getCatalogDraft } from '~/data/catalog'
import { tokenizeRegex } from '~/lib/regex-explain'
import { getPublicRegexDocument, getRegexSnapshot } from '~/server/regexes'

type EmbedData = {
  title: string
  pattern: string
  flags: string
  canonicalPath: string
}

export const Route = createFileRoute('/embed/$kind/$id')({
  loader: async ({ params }): Promise<EmbedData> => {
    const { kind, id } = params

    if (kind === 'expr') {
      const draft = getCatalogDraft(id)
      if (!draft) throw notFound()
      return { title: draft.title, pattern: draft.pattern, flags: draft.flags, canonicalPath: `/expr/${id}` }
    }

    if (kind === 'r') {
      const document = await getPublicRegexDocument({ data: id })
      if (!document) throw notFound()
      return { title: document.title, pattern: document.pattern, flags: document.flags, canonicalPath: `/community/${id}` }
    }

    if (kind === 's') {
      const snapshot = await getRegexSnapshot({ data: id })
      if (!snapshot) throw notFound()
      return { title: snapshot.title, pattern: snapshot.pattern, flags: snapshot.flags, canonicalPath: `/s/${id}` }
    }

    throw notFound()
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — iHateRegex embed` : 'iHateRegex embed' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: EmbedPage,
})

function EmbedPage() {
  const { title, pattern, flags, canonicalPath } = Route.useLoaderData()
  const svgRef = useRef<SVGSVGElement>(null)
  const [hotRange, setHotRange] = useState<{ start: number; end: number } | null>(null)
  const tokens = useMemo(() => {
    try {
      return tokenizeRegex(pattern, flags)
    } catch {
      return null
    }
  }, [pattern, flags])

  function applyDiagramHighlight(range: { start: number; end: number } | null) {
    import('@ihateregex/railviz').then(({ highlightRange }) => {
      if (svgRef.current) highlightRange(svgRef.current, range)
    })
  }

  function handleTokenHover(range: { start: number; end: number } | null) {
    setHotRange(range)
    applyDiagramHighlight(range)
  }

  function handleDiagramHover(event: React.MouseEvent) {
    import('@ihateregex/railviz').then(({ rangeFromElement, highlightRange }) => {
      const range = rangeFromElement(event.target as Element)
      setHotRange(range)
      if (svgRef.current) highlightRange(svgRef.current, range)
    })
  }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let cancelled = false
    import('@ihateregex/railviz')
      .then(({ renderRailviz }) => {
        if (cancelled) return
        renderRailviz(svg, { pattern, flags })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pattern, flags])

  return (
    <div className="embed-page">
      <div className="embed-pattern" onMouseLeave={() => handleTokenHover(null)}>
        <span className="demo-slash">/</span>
        {tokens?.map((token, index) => (
          <span
            key={index}
            className={`tok-${token.type} demo-tok ${
              hotRange && token.start < hotRange.end && token.end > hotRange.start ? 'tok-hover' : ''
            }`}
            onMouseEnter={() => handleTokenHover({ start: token.start, end: token.end })}
          >
            {token.text}
          </span>
        )) ?? pattern}
        <span className="demo-slash">/</span>
        <span className="tok-meta">{flags}</span>
      </div>
      <div className="embed-diagram">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Railroad diagram of the ${title} regular expression`}
          onMouseOver={handleDiagramHover}
          onMouseLeave={() => { setHotRange(null); applyDiagramHighlight(null) }}
        />
      </div>
      <a className="embed-credit" href={`https://ihateregex.io${canonicalPath}`} target="_blank" rel="noreferrer">
        {title} · made with iHateRegex
      </a>
    </div>
  )
}
