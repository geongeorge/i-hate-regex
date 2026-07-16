import regexesJson from '~/content/regexes.json'
import type { CatalogEntry, RegexDraft } from '~/types/regex'

const markdownModules = import.meta.glob<string>('../content/regex/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

export const catalog = regexesJson as Array<CatalogEntry>

export function getCatalogEntry(id: string) {
  return catalog.find((entry) => entry.id === id)
}

export function getCatalogDraft(id: string): RegexDraft | undefined {
  const entry = getCatalogEntry(id)
  if (!entry) return undefined

  const notes = markdownModules[`../content/regex/${id}.md`] ?? entry.description

  return {
    title: entry.title,
    pattern: entry.regex,
    flags: entry.flag,
    testText: entry.matchText.join('\n'),
    notes,
  }
}
