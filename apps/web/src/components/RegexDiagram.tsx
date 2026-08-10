import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowsInSimple, CircleNotch, Code, DownloadSimple, Graph, Minus, Plus } from '@phosphor-icons/react'

type Props = {
  pattern: string
  flags: string
  error: string | null
  embedPath?: string
}

const minZoom = 0.25
const maxZoom = 3
const zoomStep = 1.25

function serializeDiagram(svg: SVGSVGElement) {
  const width = Math.max(1, Math.ceil(Number.parseFloat(svg.getAttribute('width') ?? '') || svg.getBoundingClientRect().width))
  const height = Math.max(1, Math.ceil(Number.parseFloat(svg.getAttribute('height') ?? '') || svg.getBoundingClientRect().height))

  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.removeAttribute('style')
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  background.setAttribute('width', '100%')
  background.setAttribute('height', '100%')
  background.setAttribute('fill', '#ffffff')
  clone.insertBefore(background, clone.firstChild)

  const markup = new XMLSerializer().serializeToString(clone)
  return { markup, width, height }
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
}

export function RegexDiagram({ pattern, flags, error, embedPath }: Props) {
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

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || error) return

    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        setRendering(true)
        setRenderError(null)
        svg.replaceChildren()
        const { renderRegexDiagram } = await import(
          '@ihateregex/regex-railroad-diagram'
        )
        if (cancelled) return
        await renderRegexDiagram(svg, { pattern, flags })
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
  }, [pattern, flags, error])

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

  function downloadSvg() {
    const svg = svgRef.current
    if (!svg) return
    const { markup } = serializeDiagram(svg)
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
    triggerDownload(url, 'railroad-diagram.svg')
    URL.revokeObjectURL(url)
    setExportNote('Saved SVG')
  }

  async function downloadPng() {
    const svg = svgRef.current
    if (!svg) return
    const { markup, width, height } = serializeDiagram(svg)
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
      setExportNote('Saved PNG')
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
          <button className="panel-action" type="button" onClick={downloadSvg} disabled={exportDisabled} title="Download the diagram as an SVG file">
            <DownloadSimple size={13} /> SVG
          </button>
          <button className="panel-action" type="button" onClick={downloadPng} disabled={exportDisabled} title="Download the diagram as a PNG image">
            <DownloadSimple size={13} /> PNG
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
            />
          )}
        </div>

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
