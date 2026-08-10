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

export function getCatalogNotes(id: string) {
  return markdownModules[`../content/regex/${id}.md`]
}

export function getRelatedEntries(id: string, limit = 4) {
  const entry = getCatalogEntry(id)
  if (!entry) return []
  return catalog
    .filter((candidate) => candidate.id !== id)
    .map((candidate) => ({
      entry: candidate,
      overlap: candidate.tags.filter((tag) => entry.tags.includes(tag)).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map(({ entry: related }) => related)
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
