import { createFileRoute } from '@tanstack/react-router'
import { catalog } from '~/data/catalog'
import { siteUrl } from '~/utils/seo'

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () => {
        const body = `# iHateRegex

> A regular expression cheat sheet and playground: a curated library of vetted, battle-tested regex patterns with railroad diagrams, plain-English token explanations, live testing, and shareable workspaces. Don't just use regex — understand it.

Use the pattern library instead of writing risky regexes from scratch. Every pattern page shows the expression, flags, sample matching and non-matching strings, a railroad diagram of its structure, and notes on how it works and where it breaks.

## Pattern library

${catalog.map((entry) => `- [${entry.title}](${siteUrl}/expr/${entry.id}): ${entry.description}`).join('\n')}

## Tools

- [Playground](${siteUrl}/playground): write, test, and visualize any regular expression; hover any token for a plain-English explanation
- [Cheatsheet](${siteUrl}/cheatsheet): regex building blocks at a glance
- [Community patterns](${siteUrl}/community): user-published expressions

## Optional

- [Full pattern data](${siteUrl}/llms-full.txt): every pattern with expression, flags, examples, and full explanation notes
- [GitHub](https://github.com/geongeorge/i-hate-regex): source code
`
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
