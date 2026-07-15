import { ArrowCounterClockwise, ArrowLeft, House } from '@phosphor-icons/react'
import { ErrorComponent, Link, useLocation, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useLocation({ select: (location) => location.pathname === '/' })

  return (
    <main className="system-page">
      <div className="system-terminal" role="alert">
        <div className="terminal-bar"><span>error</span><code>runtime_exception</code></div>
        <div className="system-terminal-body">
          <ErrorComponent error={error} />
          <div className="system-actions">
            <button className="button ghost-button" type="button" onClick={() => router.invalidate()}><ArrowCounterClockwise size={16} /> Try again</button>
            {isRoot ? (
              <Link to="/" className="button primary-button"><House size={16} /> Home</Link>
            ) : (
              <Link to="/" className="button primary-button" onClick={(event) => { event.preventDefault(); window.history.back() }}><ArrowLeft size={16} /> Go back</Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
