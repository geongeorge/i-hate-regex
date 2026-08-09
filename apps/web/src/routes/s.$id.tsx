import { createFileRoute, notFound } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'
import { getRegexSnapshot } from '~/server/regexes'

export const Route = createFileRoute('/s/$id')({
  loader: async ({ params }) => {
    const snapshot = await getRegexSnapshot({ data: params.id })
    if (!snapshot) throw notFound()
    return snapshot
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} — shared regex — iHateRegex` : 'Shared regex — iHateRegex' }],
  }),
  component: SharedSnapshot,
})

function SharedSnapshot() {
  const snapshot = Route.useLoaderData()
  return (
    <RegexWorkbench
      initialDraft={snapshot}
      documentId={snapshot.id}
      mode="public"
      sourceLabel="Shared regex · read only"
      sharePath={`/s/${snapshot.id}`}
      embedPath={`/embed/s/${snapshot.id}`}
    />
  )
}
