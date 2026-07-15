import { ArrowLeft, House } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <main className="system-page">
      <div className="system-terminal" role="alert">
        <div className="terminal-bar"><span>404</span><code>route_not_found</code></div>
        <div className="system-terminal-body">
          <span className="terminal-command">$ resolve current/path</span>
          <h1>Page not found.</h1>
          <div className="system-message">{children || <p>The page you are looking for does not exist.</p>}</div>
          <div className="system-actions">
            <button className="button ghost-button" type="button" onClick={() => window.history.back()}><ArrowLeft size={16} /> Go back</button>
            <Link to="/" className="button primary-button"><House size={16} /> Home</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
