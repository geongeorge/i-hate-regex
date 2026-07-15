import { createFileRoute } from '@tanstack/react-router'
import cheatsheet from '~/content/cheatsheet.json'

export const Route = createFileRoute('/cheatsheet')({ component: Cheatsheet })

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
            <code>{item.regex}</code>
            <p dangerouslySetInnerHTML={{ __html: item.usage }} />
          </article>
        ))}
      </div>
    </main>
  )
}
