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

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.AUTH_EMAIL_FROM ?? 'iHateRegex <auth@ihateregex.io>',
      to,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`Could not send the email (${response.status}): ${detail}`)
  }

  const { id } = (await response.json()) as { id?: string }
  console.log(`[auth] email "${subject}" queued via Resend (${id ?? 'no id'})`)
}

export const auth = betterAuth({
  appName: 'iHateRegex',
  database: authPool,
  trustedOrigins:
    process.env.NODE_ENV === 'production'
      ? process.env.RAILWAY_PUBLIC_DOMAIN
        ? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`]
        : []
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    async sendVerificationEmail({ user, url }) {
      await sendEmail(
        user.email,
        'Verify your iHateRegex email',
        `<div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 460px; margin: 0 auto; padding: 24px 8px; color: #11161c;">
          <p style="font-size: 18px; font-weight: 700;">i<span style="color: #e53e3e;">Hate</span>Regex</p>
          <p>Hi ${user.name || 'there'}, confirm your email address to finish setting up your account.</p>
          <p style="margin: 28px 0;">
            <a href="${url}" style="background: #e53e3e; color: #ffffff; padding: 11px 18px; border-radius: 4px; text-decoration: none; font-weight: 600;">Verify email</a>
          </p>
          <p style="color: #65717e; font-size: 13px;">This link expires in one hour. If you didn't create an account, you can ignore this email.</p>
        </div>`,
      )
    },
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
