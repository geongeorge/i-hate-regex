import { randomBytes } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireCurrentUser } from '~/lib/auth.server'

const idSchema = z.string().regex(/^[A-Za-z0-9_-]{8,16}$/)

const draftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  pattern: z.string().max(5_000),
  flags: z.string().regex(/^[dgimsuvy]*$/).max(12),
  testText: z.string().max(50_000),
  notes: z.string().max(100_000),
})

export const getRegexDocument = createServerFn({ method: 'GET' })
  .validator((id: string) => idSchema.parse(id))
  .handler(async ({ data: id }) => {
    const user = await requireCurrentUser()
    const { findOwnedDocument } = await import('./db.server')
    return findOwnedDocument(id, user.id)
  })

export const getPublicRegexDocument = createServerFn({ method: 'GET' })
  .validator((id: string) => idSchema.parse(id))
  .handler(async ({ data: id }) => {
    const { findPublicDocument } = await import('./db.server')
    return findPublicDocument(id)
  })

export const listMyRegexDocuments = createServerFn({ method: 'GET' })
  .handler(async () => {
    const user = await requireCurrentUser()
    const { listOwnedDocuments } = await import('./db.server')
    return listOwnedDocuments(user.id)
  })

export const listCommunityRegexDocuments = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { listPublicDocuments } = await import('./db.server')
    return listPublicDocuments()
  })

export const createRegexDocument = createServerFn({ method: 'POST' })
  .validator((draft: unknown) => draftSchema.parse(draft))
  .handler(async ({ data: draft }) => {
    const user = await requireCurrentUser()
    const { insertDocument } = await import('./db.server')
    const id = randomBytes(7).toString('base64url')
    return insertDocument(id, user.id, draft)
  })

export const saveRegexDocument = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z.object({ id: idSchema, draft: draftSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const user = await requireCurrentUser()
    const { updateDocument } = await import('./db.server')
    return updateDocument(data.id, user.id, data.draft)
  })

export const publishRegexDocument = createServerFn({ method: 'POST' })
  .validator((input: unknown) =>
    z.object({ id: idSchema, published: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const user = await requireCurrentUser()
    const { setDocumentPublished } = await import('./db.server')
    return setDocumentPublished(data.id, user.id, data.published)
  })
