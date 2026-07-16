import { createFileRoute, notFound } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getPublicRegexDocument } from '~/server/regexes'

export const Route = createFileRoute('/community/$id')({
  loader: async ({ params }) => {
    const document = await getPublicRegexDocument({ data: params.id })
    if (!document) throw notFound()
    return document
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.title} by ${loaderData.ownerName ?? 'community'} — iHateRegex` : 'Community regex — iHateRegex' }] }),
  component: PublicRegex,
})

function PublicRegex() {
  const document = Route.useLoaderData()
  return <RegexWorkbench initialDraft={document} documentId={document.id} mode="public" initiallyPublic ownerName={document.ownerName} />
}
