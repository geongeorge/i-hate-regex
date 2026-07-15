import { createFileRoute, notFound } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getCatalogDraft, getCatalogEntry } from '~/data/catalog'

export const Route = createFileRoute('/library/$id')({
  loader: ({ params }) => {
    const draft = getCatalogDraft(params.id)
    const entry = getCatalogEntry(params.id)
    if (!draft || !entry) throw notFound()
    return { draft, tagline: entry.tagline }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.draft.title} regex — iHateRegex` : 'Regex — iHateRegex' }],
  }),
  component: LibraryRegex,
})

function LibraryRegex() {
  const { draft, tagline } = Route.useLoaderData()
  return <RegexWorkbench initialDraft={draft} sourceLabel={tagline} mode="library" />
}
