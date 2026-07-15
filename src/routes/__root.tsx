/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { Library, LogIn, LogOut, Menu, NotebookPen, Sparkles, UsersRound, X } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { authClient } from '~/lib/auth-client'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'iHateRegex — Understand, test, and share regex',
        description: 'A modern regular expression playground with live matching, visual railroad diagrams, Markdown notes, and database-backed sharing.',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  shellComponent: RootDocument,
})

function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { data: session, isPending } = authClient.useSession()

  async function logOut() {
    await authClient.signOut()
    window.location.assign('/')
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand" aria-label="iHateRegex home">
          <span className="brand-mark">iH</span>
          <span>iHateRegex</span>
          <span className="beta-pill">next</span>
        </Link>

        <button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={open ? 'site-nav open' : 'site-nav'} aria-label="Primary navigation">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
            <Library size={16} /> Library
          </Link>
          <Link to="/cheatsheet" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
            Cheatsheet
          </Link>
          <Link to="/community" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
            <UsersRound size={16} /> Community
          </Link>
          {session?.user && (
            <Link to="/me" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
              <NotebookPen size={16} /> My regexes
            </Link>
          )}
          {!isPending && (session?.user ? (
            <button className="nav-auth-button" type="button" onClick={logOut} title={`Signed in as ${session.user.email}`}><span className="user-initial">{session.user.name.charAt(0)}</span><LogOut size={15} /> Log out</button>
          ) : (
            <Link to="/auth" search={{ returnTo: '/me' }} onClick={() => setOpen(false)}><LogIn size={16} /> Log in</Link>
          ))}
          <Link to="/playground" className="nav-cta" onClick={() => setOpen(false)}>
            <Sparkles size={16} /> Open playground
          </Link>
        </nav>
      </div>
    </header>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <SiteHeader />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
