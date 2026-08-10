import { createFileRoute } from '@tanstack/react-router'
import { catalog, getCatalogNotes } from '~/data/catalog'
import { siteUrl } from '~/utils/seo'

export const Route = createFileRoute('/llms-full.txt')({
  server: {
    handlers: {
      GET: () => {
        const sections = catalog.map((entry) => {
          const notes = getCatalogNotes(entry.id)
          const scanFlags = entry.flag.replace(/g/g, '')
          let matching: Array<string> = []
          let failing: Array<string> = []
          try {
            matching = entry.matchText.filter((line) => new RegExp(entry.regex, scanFlags).test(line))
            failing = entry.matchText.filter((line) => !new RegExp(entry.regex, scanFlags).test(line))
          } catch {
            // leave example lists empty if the pattern fails to compile
          }

          return `## ${entry.title}

${entry.description}

- Pattern: \`/${entry.regex}/${entry.flag}\`
- Page: ${siteUrl}/expr/${entry.id}
- Tags: ${entry.tags.join(', ')}
- Matches: ${matching.map((line) => `\`${line}\``).join(', ') || '—'}
- Does not match: ${failing.map((line) => `\`${line}\``).join(', ') || '—'}
${notes ? `\n${notes.trim()}\n` : ''}`
        })

        const body = `# iHateRegex — full pattern library

> Curated, battle-tested regular expressions with examples and explanations.
> Each pattern below includes the expression, flags, sample strings, and notes.
> Interactive versions with railroad diagrams: ${siteUrl}

${sections.join('\n---\n\n')}
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
