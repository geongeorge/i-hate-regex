import pg from 'pg'
import type { RegexDocument, RegexDraft } from '~/types/regex'

const globalForDb = globalThis as typeof globalThis & {
  regexDbPool?: pg.Pool
}

function getPool() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not configured')

  if (!globalForDb.regexDbPool) {
    globalForDb.regexDbPool = new pg.Pool({
      connectionString,
      max: 8,
      idleTimeoutMillis: 30_000,
    })
  }

  return globalForDb.regexDbPool
}

type DocumentRow = {
  id: string
  title: string
  pattern: string
  flags: string
  test_text: string
  notes: string
  is_public: boolean
  owner_name?: string | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
}

const documentFields = `
  d.id, d.title, d.pattern, d.flags, d.test_text, d.notes,
  d.is_public, d.published_at, d.created_at, d.updated_at,
  u.name AS owner_name
`

function toDocument(row: DocumentRow): RegexDocument {
  return {
    id: row.id,
    title: row.title,
    pattern: row.pattern,
    flags: row.flags,
    testText: row.test_text,
    notes: row.notes,
    isPublic: row.is_public,
    ownerName: row.owner_name ?? undefined,
    publishedAt: row.published_at?.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

export async function findOwnedDocument(id: string, userId: string) {
  const result = await getPool().query<DocumentRow>(
    `SELECT ${documentFields}
     FROM regex_documents d
     LEFT JOIN "user" u ON u.id = d.user_id
     WHERE d.id = $1 AND d.user_id = $2`,
    [id, userId],
  )
  return result.rows[0] ? toDocument(result.rows[0]) : null
}

export async function findPublicDocument(id: string) {
  const result = await getPool().query<DocumentRow>(
    `SELECT ${documentFields}
     FROM regex_documents d
     LEFT JOIN "user" u ON u.id = d.user_id
     WHERE d.id = $1 AND d.is_public = true`,
    [id],
  )
  return result.rows[0] ? toDocument(result.rows[0]) : null
}

export async function listOwnedDocuments(userId: string) {
  const result = await getPool().query<DocumentRow>(
    `SELECT ${documentFields}
     FROM regex_documents d
     LEFT JOIN "user" u ON u.id = d.user_id
     WHERE d.user_id = $1
     ORDER BY d.updated_at DESC`,
    [userId],
  )
  return result.rows.map(toDocument)
}

export async function listPublicDocuments() {
  const result = await getPool().query<DocumentRow>(
    `SELECT ${documentFields}
     FROM regex_documents d
     LEFT JOIN "user" u ON u.id = d.user_id
     WHERE d.is_public = true
     ORDER BY d.published_at DESC NULLS LAST
     LIMIT 60`,
  )
  return result.rows.map(toDocument)
}

export async function insertDocument(id: string, userId: string, draft: RegexDraft) {
  const result = await getPool().query<DocumentRow>(
    `INSERT INTO regex_documents (id, user_id, title, pattern, flags, test_text, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, pattern, flags, test_text, notes, is_public,
       published_at, created_at, updated_at`,
    [id, userId, draft.title, draft.pattern, draft.flags, draft.testText, draft.notes],
  )
  return toDocument(result.rows[0])
}

export async function updateDocument(id: string, userId: string, draft: RegexDraft) {
  const result = await getPool().query<DocumentRow>(
    `UPDATE regex_documents
     SET title = $3, pattern = $4, flags = $5, test_text = $6,
         notes = $7, updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, pattern, flags, test_text, notes, is_public,
       published_at, created_at, updated_at`,
    [id, userId, draft.title, draft.pattern, draft.flags, draft.testText, draft.notes],
  )
  return result.rows[0] ? toDocument(result.rows[0]) : null
}

export async function setDocumentPublished(id: string, userId: string, published: boolean) {
  const result = await getPool().query<DocumentRow>(
    `UPDATE regex_documents
     SET is_public = $3,
         published_at = CASE WHEN $3 THEN COALESCE(published_at, now()) ELSE NULL END,
         updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, pattern, flags, test_text, notes, is_public,
       published_at, created_at, updated_at`,
    [id, userId, published],
  )
  return result.rows[0] ? toDocument(result.rows[0]) : null
}
