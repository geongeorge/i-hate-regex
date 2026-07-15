import pg from 'pg'
import { betterAuth } from 'better-auth'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

const connectionString = process.env.DATABASE_URL

if (!connectionString) throw new Error('DATABASE_URL is not configured')

const globalForAuth = globalThis as typeof globalThis & {
  regexAuthPool?: pg.Pool
}

const authPool = globalForAuth.regexAuthPool ?? new pg.Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 30_000,
})

globalForAuth.regexAuthPool = authPool

export const auth = betterAuth({
  appName: 'iHateRegex',
  database: authPool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  plugins: [tanstackStartCookies()],
})

export async function getCurrentSession() {
  return auth.api.getSession({ headers: getRequestHeaders() })
}

export async function requireCurrentUser() {
  const session = await getCurrentSession()
  if (!session) throw new Error('Please sign in to save regexes')
  return session.user
}
