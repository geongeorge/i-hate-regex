import { createServerFn } from '@tanstack/react-start'
import { getCurrentSession } from '~/lib/auth.server'

export const getSessionUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    const session = await getCurrentSession()
    return session?.user ?? null
  })
