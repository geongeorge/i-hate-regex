import { useEffect, useRef, useState } from 'react'

const relayToken = 'UcMDA9H-RSm0xqHEu-9LoW3V01dGkxKh'
const relaySrc = 'https://app.superrelay.ai/embed/relay-embed.js'

type Theme = 'light' | 'dark'

/**
 * The widget's own `data-theme="auto"` follows the OS colour scheme, which
 * drifts from the site whenever someone uses our header theme toggle, so we
 * track the resolved site theme instead.
 */
function readSiteTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

type Props = {
  /** Which SuperRelay widget to mount; becomes the `relay-*` container id. */
  slot: 'feature-requests' | 'changelog'
}

/**
 * Mounts a SuperRelay widget.
 *
 * The embed script scans for its `relay-*` container when it executes, so it is
 * injected from an effect (after the container is in the DOM) rather than from
 * the document head. Removing the element on unmount lets a client-side
 * navigation back to the page re-run it.
 */
export function RelayEmbed({ slot }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<Theme>(readSiteTheme)

  useEffect(() => {
    // Hydration can settle on a different theme than the server assumed.
    setTheme(readSiteTheme())
    const observer = new MutationObserver(() => setTheme(readSiteTheme()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = relaySrc
    script.async = true
    script.dataset.token = relayToken
    script.dataset.theme = readSiteTheme()
    document.body.appendChild(script)

    const container = containerRef.current
    return () => {
      script.remove()
      // Drop anything the widget rendered so a remount cannot duplicate it.
      if (container) container.replaceChildren()
    }
  }, [slot])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // The SDK is a global singleton, so re-injecting the script will not
    // re-theme an already-initialised widget. Its shadow styles key off
    // `data-sr-mode`, so setting that re-themes it in place instead — and the
    // observer re-asserts it if the SDK finishes mounting after a toggle.
    const apply = () => {
      if (container.dataset.srMode !== theme) container.dataset.srMode = theme
    }
    apply()

    const observer = new MutationObserver(apply)
    observer.observe(container, { attributes: true, attributeFilter: ['data-sr-mode', 'data-relay-mounted'] })
    return () => observer.disconnect()
  }, [theme])

  return <div ref={containerRef} id={`relay-${slot}`} className="relay-embed" />
}
