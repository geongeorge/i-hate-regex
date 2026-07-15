import { useEffect, useRef, useState } from 'react'
import { CircleNotch, Graph } from '@phosphor-icons/react'

type Props = {
  pattern: string
  flags: string
  error: string | null
}

export function RegexDiagram({ pattern, flags, error }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || error) return

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setRendering(true)
        setRenderError(null)
        svg.replaceChildren()
        const { renderRegexDiagram } = await import('@ihateregex/embed')
        if (cancelled) return
        await renderRegexDiagram(svg, { pattern, flags })
      } catch (cause) {
        if (!cancelled) {
          setRenderError(
            cause instanceof Error ? cause.message : 'Could not draw this expression',
          )
        }
      } finally {
        if (!cancelled) setRendering(false)
      }
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [pattern, flags, error])

  const message = error ?? renderError

  return (
    <section className="panel diagram-panel" aria-labelledby="diagram-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Structure</span>
          <h2 id="diagram-title">Railroad diagram</h2>
        </div>
        <span className="panel-status">
          {rendering ? <CircleNotch className="spin" size={15} /> : <Graph size={15} />}
          {rendering ? 'Drawing' : 'Live'}
        </span>
      </div>

      <div className="diagram-scroll">
        {message ? (
          <div className="diagram-empty">
            <Graph size={28} />
            <p>{message}</p>
            <span>Fix the expression to restore the diagram.</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="regex-diagram"
            role="img"
            aria-label="Railroad diagram of the regular expression"
          />
        )}
      </div>
    </section>
  )
}
