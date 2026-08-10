import { createFileRoute } from '@tanstack/react-router'
import cheatsheet from '~/content/cheatsheet.json'
import { canonicalLink, seo } from '~/utils/seo'

export const Route = createFileRoute('/cheatsheet')({
  head: () => ({
    meta: seo({
      title: 'Regex cheatsheet — iHateRegex',
      description: 'The tiny regex cheat sheet: anchors, character classes, quantifiers, groups, and lookarounds at a glance.',
      path: '/cheatsheet',
    }),
    links: [canonicalLink('/cheatsheet')],
  }),
  component: Cheatsheet,
})

function Cheatsheet() {
  return (
    <main className="cheatsheet-page">
      <header className="page-intro">
        <span className="eyebrow">Quick reference</span>
        <h1>The tiny regex cheatsheet.</h1>
        <p>Scan the building blocks, then open the playground to combine them.</p>
      </header>
      <div className="cheat-grid">
        {cheatsheet.map((item) => (
          <article className="cheat-card" key={item.regex}>
            <div className="cheat-command"><span>$ token</span><code>{item.regex}</code></div>
            <p dangerouslySetInnerHTML={{ __html: item.usage }} />
          </article>
        ))}
      </div>
    </main>
  )
}
