import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Check, EnvelopeSimple, Key, ShieldCheck, Sparkle } from '@phosphor-icons/react'
import { type FormEvent, useState } from 'react'
import { z } from 'zod'
import { authClient } from '~/lib/auth-client'

const searchSchema = z.object({
  returnTo: z.string().optional().transform((value) => value?.startsWith('/') && !value.startsWith('//') ? value : '/me'),
})

export const Route = createFileRoute('/auth')({
  validateSearch: (search) => searchSchema.parse(search),
  component: AuthPage,
})

function AuthPage() {
  const { returnTo } = Route.useSearch()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [resent, setResent] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = mode === 'signup'
      ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
      : await authClient.signIn.email({ email: email.trim(), password })

    if (result.error) {
      if (result.error.code === 'EMAIL_NOT_VERIFIED') {
        setPendingEmail(email.trim())
        setSubmitting(false)
        return
      }
      setError(result.error.message ?? 'Authentication failed')
      setSubmitting(false)
      return
    }

    if (mode === 'signup') {
      setPendingEmail(email.trim())
      setSubmitting(false)
      return
    }

    window.location.assign(returnTo)
  }

  async function resendVerification() {
    if (!pendingEmail || submitting) return
    setSubmitting(true)
    const result = await authClient.sendVerificationEmail({ email: pendingEmail, callbackURL: returnTo })
    setSubmitting(false)
    if (result.error) {
      setError(result.error.message ?? 'Could not resend the email')
      return
    }
    setResent(true)
  }

  if (pendingEmail) {
    return (
      <main className="auth-page">
        <section className="auth-card verify-card">
          <span className="auth-icon"><EnvelopeSimple size={20} weight="bold" /></span>
          <h2>Check your inbox</h2>
          <p>
            We sent a verification link to <strong>{pendingEmail}</strong>.
            Click it to activate your account — the link is valid for one hour.
          </p>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button auth-submit" type="button" onClick={resendVerification} disabled={submitting || resent}>
            {resent ? 'Email sent again' : submitting ? 'One moment…' : 'Resend the email'}
          </button>
          <button className="auth-backlink" type="button" onClick={() => { setPendingEmail(null); setResent(false); setError(null) }}>
            Use a different email
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <span className="eyebrow">Your regex notebook</span>
        <h1>Keep the clever parts. Lose the mystery.</h1>
        <p>Save private workspaces, revisit the reasoning, and publish only the patterns you want the community to see.</p>
        <div className="auth-benefits">
          <span><ShieldCheck size={18} /><strong>Private by default</strong></span>
          <span><Sparkle size={18} /><strong>Publish when ready</strong></span>
          <span><Key size={18} /><strong>Secure cookie sessions</strong></span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(null) }}>Log in</button>
          <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(null) }}>Create account</button>
        </div>
        <div className="auth-card-heading">
          <span className="auth-icon"><Key size={20} weight="bold" /></span>
          <div><h2>{mode === 'login' ? 'Welcome back' : 'Make regex feel lighter'}</h2><p>{mode === 'login' ? 'Pick up where you left off.' : 'Your first workspace stays private.'}</p></div>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && (
            <label><span>Display name</span><input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} autoComplete="name" placeholder="Ada" /></label>
          )}
          <label><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" /></label>
          <label><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="button auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'One moment…' : mode === 'login' ? 'Log in' : 'Create my account'} <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-fineprint"><Check size={13} /> Your saved regexes are never public unless you publish them.</p>
        <Link to="/" className="auth-backlink">Continue browsing without an account</Link>
      </section>
    </main>
  )
}
