/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { Books, BracketsCurly, List, Notebook, SignIn, SignOut, TerminalWindow, UsersThree, X } from '@phosphor-icons/react'
import { type ReactNode, useState } from 'react'
import { ThemeToggle } from '~/components/ThemeToggle'
import { authClient } from '~/lib/auth-client'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

const themeScript = `(function(){try{var saved=localStorage.getItem('ihateregex:theme');var theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme}catch(e){}})()`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'iHateRegex — Understand, test, and share regex',
        description: 'A modern regular expression playground with live matching, visual railroad diagrams, rich notes, and easy sharing.',
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
          <span>i<span className="brand-hate">Hate</span>Regex</span>
        </Link>

        <button className="mobile-menu-button" type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} aria-controls="site-navigation">
          {open ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
        </button>

        <nav id="site-navigation" className={open ? 'site-nav open' : 'site-nav'} aria-label="Primary navigation">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
            <Books size={16} /> Library
          </Link>
          <Link to="/cheatsheet" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
            <BracketsCurly size={16} /> Cheatsheet
          </Link>
          <Link to="/community" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
            <UsersThree size={16} /> Community
          </Link>
          {session?.user && (
            <Link to="/me" activeProps={{ className: 'active' }} onClick={() => setOpen(false)}>
              <Notebook size={16} /> My regexes
            </Link>
          )}
          <ThemeToggle />
          {!isPending && (session?.user ? (
            <button className="nav-auth-button" type="button" onClick={logOut} title={`Signed in as ${session.user.email}`}><span className="user-initial">{session.user.name.charAt(0)}</span><SignOut size={15} /> Log out</button>
          ) : (
            <Link to="/auth" search={{ returnTo: '/me' }} onClick={() => setOpen(false)}><SignIn size={16} /> Log in</Link>
          ))}
          <Link to="/playground" className="nav-cta" onClick={() => setOpen(false)}>
            <TerminalWindow size={16} /> Open playground
          </Link>
        </nav>
      </div>
    </header>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><HeadContent /><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>
        <SiteHeader />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
