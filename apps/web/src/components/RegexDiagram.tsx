import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowsInSimple, CircleNotch, Code, CopySimple, DownloadSimple, Graph, Lightning, Minus, Plus } from '@phosphor-icons/react'
import { tokenizeRegex, type RegexToken } from '~/lib/regex-explain'

export type SourceRange = { start: number; end: number }

type Props = {
  pattern: string
  flags: string
  error: string | null
  embedPath?: string
  hoverRange?: SourceRange | null
  onNodeHover?: (range: SourceRange | null) => void
  onNodeSelect?: (range: SourceRange) => void
}

type Engine = 'classic' | 'interactive'
const engineStorageKey = 'ihateregex:diagram-engine'

/** Picks the most descriptive token for a diagram node's source range. */
function explainRange(tokens: Array<RegexToken>, range: SourceRange, nodeClass: string): RegexToken | null {
  const inside = tokens.filter((token) => token.start >= range.start && token.end <= range.end)
  if (!inside.length) return null
  const exact = inside.find((token) => token.start === range.start && token.end === range.end)
  if (exact) return exact
  if (nodeClass.includes('rrv-repeat')) {
    return inside.find((token) => token.end === range.end && token.type === 'quantifier') ?? inside[0]
  }
  return inside.find((token) => token.start === range.start) ?? inside[0]
}

const minZoom = 0.25
const maxZoom = 3
const zoomStep = 1.25

const themeVarNames = [
  '--rrd-canvas', '--rrd-ink', '--rrd-rail', '--rrd-endpoint', '--rrd-anchor-box', '--rrd-anchor-ink',
  '--rrd-escape-box', '--rrd-literal-box', '--rrd-charset-box', '--rrd-subexp-line', '--rrd-quote', '--rrd-hot',
]

function serializeDiagram(svg: SVGSVGElement, transparent = false) {
  const width = Math.max(1, Math.ceil(Number.parseFloat(svg.getAttribute('width') ?? '') || svg.getBoundingClientRect().width))
  const height = Math.max(1, Math.ceil(Number.parseFloat(svg.getAttribute('height') ?? '') || svg.getBoundingClientRect().height))

  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.removeAttribute('style')
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  // Bake the current theme into the export: the embedded stylesheet reads
  // var(--rrd-*), so inlining the resolved values on the root carries the
  // on-screen colors into the standalone file.
  const computed = getComputedStyle(svg)
  let canvas = ''
  for (const name of themeVarNames) {
    const value = computed.getPropertyValue(name).trim()
    if (value) {
      clone.style.setProperty(name, value)
      if (name === '--rrd-canvas') canvas = value
    }
  }

  if (!transparent) {
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    background.setAttribute('width', '100%')
    background.setAttribute('height', '100%')
    background.setAttribute('fill', canvas || '#ffffff')
    clone.insertBefore(background, clone.firstChild)
  } else {
    clone.style.setProperty('background', 'transparent')
  }

  const markup = new XMLSerializer().serializeToString(clone)
  return { markup, width, height }
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
}

export function RegexDiagram({ pattern, flags, error, embedPath, hoverRange, onNodeHover, onNodeSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const panState = useRef<{ pointerId: number; startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [exportNote, setExportNote] = useState<string | null>(null)
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [zoom, setZoom] = useState<number | 'fit'>('fit')
  const [containerWidth, setContainerWidth] = useState(0)
  const [panning, setPanning] = useState(false)
  const [engine, setEngine] = useState<Engine>('interactive')
  const [collapsed, setCollapsed] = useState<ReadonlySet<number>>(new Set())
  const [nodePop, setNodePop] = useState<{ left: number; top: number; token: RegexToken } | null>(null)

  const tokens = useMemo(() => {
    try {
      return tokenizeRegex(pattern, flags)
    } catch {
      return []
    }
  }, [pattern, flags])

  useEffect(() => {
    setCollapsed(new Set())
    setNodePop(null)
  }, [pattern])

  useEffect(() => {
    if (!nodePop) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNodePop(null)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [nodePop])

  useEffect(() => {
    if (window.localStorage.getItem(engineStorageKey) === 'classic') setEngine('classic')
  }, [])

  function switchEngine(next: Engine) {
    setEngine(next)
    window.localStorage.setItem(engineStorageKey, next)
  }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || error) return

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setRendering(true)
        setRenderError(null)
        svg.classList.remove('rrv-root', 'regex-diagram-renderer')
        svg.replaceChildren()
        if (engine === 'interactive') {
          const { renderRailviz } = await import('@ihateregex/railviz')
          if (cancelled) return
          renderRailviz(svg, { pattern, flags, collapsed })
        } else {
          const { renderRegexDiagram } = await import(
            '@ihateregex/regex-railroad-diagram'
          )
          if (cancelled) return
          await renderRegexDiagram(svg, { pattern, flags })
        }
        if (cancelled) return
        const width = Number.parseFloat(svg.getAttribute('width') ?? '')
        const height = Number.parseFloat(svg.getAttribute('height') ?? '')
        setNatural(Number.isFinite(width) && Number.isFinite(height) ? { width, height } : null)
      } catch (cause) {
        if (!cancelled) {
          setRenderError(
            cause instanceof Error ? cause.message : 'Could not draw this expression',
          )
          setNatural(null)
        }
      } finally {
        if (!cancelled) setRendering(false)
      }
    }, 180)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [pattern, flags, error, engine, collapsed])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || engine !== 'interactive' || rendering) return
    let cancelled = false
    import('@ihateregex/railviz').then(({ highlightRange }) => {
      if (!cancelled && svgRef.current) highlightRange(svgRef.current, hoverRange ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [hoverRange, engine, rendering])

  async function handleDiagramHover(event: ReactMouseEvent) {
    if (engine !== 'interactive') return
    const { rangeFromElement, highlightRange } = await import('@ihateregex/railviz')
    const range = rangeFromElement(event.target as Element)
    if (svgRef.current) highlightRange(svgRef.current, range)
    onNodeHover?.(range)
  }

  function handleDiagramLeave() {
    if (engine !== 'interactive') return
    import('@ihateregex/railviz').then(({ highlightRange }) => {
      if (svgRef.current) highlightRange(svgRef.current, null)
    })
    onNodeHover?.(null)
  }

  function toggleCollapsed(groupStart: number) {
    setNodePop(null)
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(groupStart)) next.delete(groupStart)
      else next.add(groupStart)
      return next
    })
  }

  async function handleDiagramClick(event: ReactMouseEvent) {
    if (engine !== 'interactive') return
    const target = event.target as Element

    const collapser = target.closest<SVGElement>('.rrv-collapse')
    if (collapser?.dataset.group) {
      toggleCollapsed(Number(collapser.dataset.group))
      return
    }
    const collapsedPill = target.closest<SVGElement>('.rrv-group-collapsed')
    if (collapsedPill?.dataset.group) {
      toggleCollapsed(Number(collapsedPill.dataset.group))
      return
    }

    const { rangeFromElement } = await import('@ihateregex/railviz')
    const range = rangeFromElement(target)
    if (!range) {
      setNodePop(null)
      return
    }

    onNodeSelect?.(range)

    const node = target.closest<SVGGElement>('[data-start]')
    const shell = scrollRef.current?.parentElement
    const token = node && explainRange(tokens, range, node.getAttribute('class') ?? '')
    if (!node || !shell || !token) {
      setNodePop(null)
      return
    }
    const nodeRect = node.getBoundingClientRect()
    const shellRect = shell.getBoundingClientRect()
    const left = Math.max(8, Math.min(nodeRect.left - shellRect.left, shellRect.width - 280))
    const top = Math.min(nodeRect.bottom - shellRect.top + 8, shellRect.height - 20)
    setNodePop({ left, top, token })
  }

  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0]?.contentRect.width ?? 0)
    })
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [])

  const fitScale = natural && containerWidth
    ? Math.min(1, (containerWidth - 36) / natural.width)
    : 1
  const effectiveZoom = zoom === 'fit' ? fitScale : zoom

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg || !natural) return
    svg.style.width = `${natural.width * effectiveZoom}px`
    svg.style.height = `${natural.height * effectiveZoom}px`
  }, [natural, effectiveZoom])

  function zoomBy(factor: number) {
    setZoom((current) => {
      const base = current === 'fit' ? fitScale : current
      return Math.min(maxZoom, Math.max(minZoom, base * factor))
    })
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollRef.current
    if (!scroller || event.button !== 0) return
    if ((event.target as HTMLElement).closest('.diagram-zoom')) return
    const canPan = scroller.scrollWidth > scroller.clientWidth || scroller.scrollHeight > scroller.clientHeight
    if (!canPan) return
    panState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    }
    try {
      scroller.setPointerCapture(event.pointerId)
    } catch {
      // synthetic or already-released pointers can't be captured; panning still works
    }
    setPanning(true)
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollRef.current
    const state = panState.current
    if (!scroller || !state || state.pointerId !== event.pointerId) return
    scroller.scrollLeft = state.scrollLeft - (event.clientX - state.startX)
    scroller.scrollTop = state.scrollTop - (event.clientY - state.startY)
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    const scroller = scrollRef.current
    if (panState.current?.pointerId === event.pointerId) {
      panState.current = null
      scroller?.releasePointerCapture(event.pointerId)
      setPanning(false)
    }
  }

  function downloadSvg(event?: ReactMouseEvent) {
    const svg = svgRef.current
    if (!svg) return
    const transparent = Boolean(event?.altKey)
    const { markup } = serializeDiagram(svg, transparent)
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
    triggerDownload(url, 'railroad-diagram.svg')
    URL.revokeObjectURL(url)
    setExportNote(transparent ? 'Saved SVG (transparent)' : 'Saved SVG')
  }

  async function copySvg() {
    const svg = svgRef.current
    if (!svg) return
    const { markup } = serializeDiagram(svg)
    try {
      await navigator.clipboard.writeText(markup)
      setExportNote('SVG copied')
    } catch {
      setExportNote('Copy blocked — try again')
    }
  }

  async function downloadPng(event?: ReactMouseEvent) {
    const svg = svgRef.current
    if (!svg) return
    const transparent = Boolean(event?.altKey)
    const { markup, width, height } = serializeDiagram(svg, transparent)
    const svgUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
    try {
      const image = new Image()
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = () => reject(new Error('Could not rasterize the diagram'))
        image.src = svgUrl
      })
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable')
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('Could not encode the image')
      const pngUrl = URL.createObjectURL(blob)
      triggerDownload(pngUrl, 'railroad-diagram.png')
      URL.revokeObjectURL(pngUrl)
      setExportNote(transparent ? 'Saved PNG (transparent)' : 'Saved PNG')
    } catch {
      setExportNote('Export failed')
    } finally {
      URL.revokeObjectURL(svgUrl)
    }
  }

  async function copyEmbedCode() {
    if (!embedPath) return
    const src = `${window.location.origin}${embedPath}`
    const snippet = `<iframe src="${src}" width="100%" height="380" style="border:0;border-radius:6px;overflow:hidden" title="Regex railroad diagram — iHateRegex" loading="lazy"></iframe>`
    try {
      await navigator.clipboard.writeText(snippet)
      setExportNote('Embed code copied')
    } catch {
      setExportNote('Copy blocked — try again')
    }
  }

  useEffect(() => {
    if (!exportNote) return
    const timer = window.setTimeout(() => setExportNote(null), 2400)
    return () => window.clearTimeout(timer)
  }, [exportNote])

  const message = error ?? renderError
  const exportDisabled = Boolean(message) || rendering
  const showZoom = !message && natural !== null

  return (
    <section className="panel diagram-panel" aria-labelledby="diagram-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Structure</span>
          <h2 id="diagram-title">Railroad diagram</h2>
        </div>
        <div className="panel-tools">
          <button
            className={`panel-action ${engine === 'interactive' ? 'panel-action-active' : ''}`}
            type="button"
            onClick={() => switchEngine(engine === 'interactive' ? 'classic' : 'interactive')}
            title={engine === 'interactive' ? 'Interactive diagram — hover the diagram or the expression to cross-highlight. Click for the classic renderer.' : 'Classic renderer on — click to return to the interactive diagram'}
          >
            <Lightning size={13} weight={engine === 'interactive' ? 'fill' : 'regular'} /> {engine === 'interactive' ? 'Interactive' : 'Classic'}
          </button>
          <button className="panel-action" type="button" onClick={downloadSvg} disabled={exportDisabled} title="Download the diagram as an SVG file in the current theme (⌥-click for a transparent background)">
            <DownloadSimple size={13} /> SVG
          </button>
          <button className="panel-action" type="button" onClick={downloadPng} disabled={exportDisabled} title="Download the diagram as a PNG image in the current theme (⌥-click for a transparent background)">
            <DownloadSimple size={13} /> PNG
          </button>
          <button className="panel-action" type="button" onClick={copySvg} disabled={exportDisabled} title="Copy the diagram SVG markup to the clipboard">
            <CopySimple size={13} /> Copy
          </button>
          {embedPath && (
            <button className="panel-action" type="button" onClick={copyEmbedCode} disabled={exportDisabled} title="Copy an iframe snippet that embeds this diagram on any site">
              <Code size={13} /> Embed
            </button>
          )}
          <span className="panel-status" aria-live="polite">
            {rendering ? <CircleNotch className="spin" size={15} /> : <Graph size={15} />}
            {exportNote ?? (rendering ? 'Drawing' : 'Live')}
          </span>
        </div>
      </div>

      <div className="diagram-shell">
        <div
          ref={scrollRef}
          className={`diagram-scroll ${panning ? 'panning' : ''} ${showZoom && effectiveZoom > fitScale ? 'pannable' : ''}`}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
        >
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
              onMouseOver={handleDiagramHover}
              onMouseLeave={handleDiagramLeave}
              onClick={handleDiagramClick}
            />
          )}
        </div>

        {nodePop && (
          <div className="token-popover diagram-popover" style={{ left: nodePop.left, top: nodePop.top }} role="tooltip">
            <div className="token-popover-head">
              <span className={`token-popover-type tok-${nodePop.token.type}`}>{nodePop.token.title}</span>
              <code>{nodePop.token.text}</code>
            </div>
            <p>{nodePop.token.detail}</p>
          </div>
        )}

        {showZoom && (
          <div className="diagram-zoom" role="group" aria-label="Diagram zoom">
            <button type="button" onClick={() => zoomBy(1 / zoomStep)} disabled={effectiveZoom <= minZoom} aria-label="Zoom out">
              <Minus size={12} weight="bold" />
            </button>
            <button type="button" className="zoom-level" onClick={() => setZoom('fit')} title="Reset zoom">
              {Math.round(effectiveZoom * 100)}%
            </button>
            <button type="button" onClick={() => zoomBy(zoomStep)} disabled={effectiveZoom >= maxZoom} aria-label="Zoom in">
              <Plus size={12} weight="bold" />
            </button>
            {zoom !== 'fit' && (
              <button type="button" onClick={() => setZoom('fit')} title="Fit to width" aria-label="Fit to width">
                <ArrowsInSimple size={12} weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
