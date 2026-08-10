import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowRight, CheckCircle, XCircle } from '@phosphor-icons/react'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getCatalogDraft, getCatalogEntry, getRelatedEntries } from '~/data/catalog'
import { canonicalLink, jsonLd, seo, siteUrl } from '~/utils/seo'

export const Route = createFileRoute('/expr/$id')({
  loader: ({ params }) => {
    const draft = getCatalogDraft(params.id)
    const entry = getCatalogEntry(params.id)
    if (!draft || !entry) throw notFound()
    return {
      draft,
      tagline: entry.tagline,
      description: entry.description,
      id: entry.id,
      title: entry.title,
      related: getRelatedEntries(entry.id).map(({ id, title, tagline }) => ({ id, title, tagline })),
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo({
          title: `${loaderData.draft.title} regex — iHateRegex`,
          description: loaderData.description,
          image: `${siteUrl}/og/${loaderData.id}.png`,
          path: `/expr/${loaderData.id}`,
        })
      : [{ title: 'Regex — iHateRegex' }],
    links: loaderData ? [canonicalLink(`/expr/${loaderData.id}`)] : [],
    scripts: loaderData
      ? [
          jsonLd({
            '@type': 'TechArticle',
            headline: `${loaderData.title} regex`,
            description: loaderData.description,
            url: `${siteUrl}/expr/${loaderData.id}`,
            image: `${siteUrl}/og/${loaderData.id}.png`,
            author: { '@type': 'Organization', name: 'iHateRegex', url: siteUrl },
            publisher: { '@type': 'Organization', name: 'iHateRegex', url: siteUrl },
          }),
          jsonLd({
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Library', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: `${loaderData.title} regex`, item: `${siteUrl}/expr/${loaderData.id}` },
            ],
          }),
        ]
      : [],
  }),
  component: LibraryRegex,
})

function splitExamples(pattern: string, flags: string, testText: string) {
  const lines = testText.split('\n').map((line) => line.trim()).filter(Boolean)
  try {
    const scanFlags = flags.replace(/g/g, '')
    return {
      matching: lines.filter((line) => new RegExp(pattern, scanFlags).test(line)),
      failing: lines.filter((line) => !new RegExp(pattern, scanFlags).test(line)),
    }
  } catch {
    return { matching: [], failing: [] }
  }
}

function LibraryRegex() {
  const { draft, tagline, id, related } = Route.useLoaderData()
  const { matching, failing } = splitExamples(draft.pattern, draft.flags, draft.testText)

  return (
    <>
      <RegexWorkbench initialDraft={draft} sourceLabel={tagline} mode="library" embedPath={`/embed/expr/${id}`} />

      <section className="pattern-extras" aria-label="Examples and related patterns">
        <div className="extras-grid">
          <div className="extras-block">
            <h2>Strings that match</h2>
            <ul className="example-list">
              {matching.map((line) => (
                <li key={line}><CheckCircle size={14} weight="fill" /> <code>{line}</code></li>
              ))}
              {!matching.length && <li className="example-empty">No matching samples for this pattern.</li>}
            </ul>
          </div>
          <div className="extras-block">
            <h2>Strings that don’t match</h2>
            <ul className="example-list failing">
              {failing.map((line) => (
                <li key={line}><XCircle size={14} weight="fill" /> <code>{line}</code></li>
              ))}
              {!failing.length && <li className="example-empty">Every sample above matches.</li>}
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <div className="related-block">
            <h2>Related patterns</h2>
            <div className="related-grid">
              {related.map((item) => (
                <Link key={item.id} to="/expr/$id" params={{ id: item.id }} className="related-card">
                  <span className="related-title">{item.title}</span>
                  <span className="related-tagline">{item.tagline}</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
