export type RegexDraft = {
  title: string
  pattern: string
  flags: string
  testText: string
  notes: string
}

export type RegexDocument = RegexDraft & {
  id: string
  isPublic: boolean
  ownerName?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export type CatalogEntry = {
  id: string
  title: string
  tagline: string
  description: string
  regex: string
  flag: string
  matchText: Array<string>
  cheatRegex: Array<string>
  embedHeight: number
  tags: Array<string>
}
