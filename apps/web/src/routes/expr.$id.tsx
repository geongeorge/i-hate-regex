import { createFileRoute, notFound } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getCatalogDraft, getCatalogEntry } from '~/data/catalog'
import { seo } from '~/utils/seo'

export const Route = createFileRoute('/expr/$id')({
  loader: ({ params }) => {
    const draft = getCatalogDraft(params.id)
    const entry = getCatalogEntry(params.id)
    if (!draft || !entry) throw notFound()
    return { draft, tagline: entry.tagline, description: entry.description, id: entry.id }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo({
          title: `${loaderData.draft.title} regex — iHateRegex`,
          description: loaderData.description,
          image: `https://ihateregex.io/og/${loaderData.id}.png`,
        })
      : [{ title: 'Regex — iHateRegex' }],
  }),
  component: LibraryRegex,
})

function LibraryRegex() {
  const { draft, tagline } = Route.useLoaderData()
  const { id } = Route.useParams()
  return <RegexWorkbench initialDraft={draft} sourceLabel={tagline} mode="library" embedPath={`/embed/expr/${id}`} />
}
