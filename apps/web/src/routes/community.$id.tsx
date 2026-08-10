import { createFileRoute, notFound } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getPublicRegexDocument } from '~/server/regexes'
import { canonicalLink, seo } from '~/utils/seo'

export const Route = createFileRoute('/community/$id')({
  loader: async ({ params }) => {
    const document = await getPublicRegexDocument({ data: params.id })
    if (!document) throw notFound()
    return document
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? seo({
          title: `${loaderData.title} by ${loaderData.ownerName ?? 'community'} — iHateRegex`,
          description: `/${loaderData.pattern}/${loaderData.flags} — a community regex with a railroad diagram, live matching, and notes.`,
          path: `/community/${loaderData.id}`,
        })
      : [{ title: 'Community regex — iHateRegex' }],
    links: loaderData ? [canonicalLink(`/community/${loaderData.id}`)] : [],
  }),
  component: PublicRegex,
})

function PublicRegex() {
  const document = Route.useLoaderData()
  return <RegexWorkbench initialDraft={document} documentId={document.id} mode="public" initiallyPublic ownerName={document.ownerName} embedPath={`/embed/r/${document.id}`} />
}
