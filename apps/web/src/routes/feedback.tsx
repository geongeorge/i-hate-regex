import { createFileRoute } from '@tanstack/react-router'
import { RelayEmbed } from '~/components/RelayEmbed'
import { canonicalLink, seo } from '~/utils/seo'

export const Route = createFileRoute('/feedback')({
  head: () => ({
    meta: seo({
      title: 'Feature requests — iHateRegex',
      description: 'Suggest a feature for iHateRegex, or vote on what other people have already asked for.',
      path: '/feedback',
    }),
    links: [canonicalLink('/feedback')],
  }),
  component: Feedback,
})

function Feedback() {
  return (
    <main className="cheatsheet-page">
      <header className="page-intro">
        <span className="eyebrow">Roadmap</span>
        <h1>What should we build next?</h1>
        <p>
          Ask for a feature, or vote on what someone else already asked for. The
          most wanted ideas get built first.
        </p>
      </header>

      <RelayEmbed slot="feature-requests" />
    </main>
  )
}
