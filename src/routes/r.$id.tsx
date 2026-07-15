import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getRegexDocument } from '~/server/regexes'
import { getSessionUser } from '~/server/session'

export const Route = createFileRoute('/r/$id')({
  loader: async ({ params }) => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/auth', search: { returnTo: `/r/${params.id}` } })
    const document = await getRegexDocument({ data: params.id })
    if (!document) throw notFound()
    return document
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} — iHateRegex` : 'Shared regex — iHateRegex' }],
  }),
  component: SharedRegex,
})

function SharedRegex() {
  const document = Route.useLoaderData()
  return <RegexWorkbench initialDraft={document} documentId={document.id} initiallyPublic={document.isPublic} />
}
