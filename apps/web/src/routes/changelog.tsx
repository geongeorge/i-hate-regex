import { createFileRoute } from '@tanstack/react-router'
import { RelayEmbed } from '~/components/RelayEmbed'
import { canonicalLink, seo } from '~/utils/seo'

export const Route = createFileRoute('/changelog')({
  head: () => ({
    meta: seo({
      title: 'Changelog — iHateRegex',
      description: 'Every update to iHateRegex: new features, fixes, and improvements to the playground, diagrams, and pattern library.',
      path: '/changelog',
    }),
    links: [canonicalLink('/changelog')],
  }),
  component: Changelog,
})

function Changelog() {
  return (
    <main className="cheatsheet-page">
      <header className="page-intro">
        <span className="eyebrow">Product updates</span>
        <h1>Everything we’ve shipped.</h1>
        <p>Every change to the playground, the diagrams, and the pattern library.</p>
      </header>

      <RelayEmbed slot="changelog" />
    </main>
  )
}
