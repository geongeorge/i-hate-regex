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

const minZoom = 0.15
const maxZoom = 4
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
  const stageRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef({ tx: 0, ty: 0, scale: 1 })
  const modeRef = useRef<'fit' | 'manual'>('fit')
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const dragDistanceRef = useRef(0)
  const spaceRef = useRef(false)
  const stageHoverRef = useRef(false)
  const [spaceDown, setSpaceDown] = useState(false)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [exportNote, setExportNote] = useState<string | null>(null)
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [zoomPct, setZoomPct] = useState(100)
  const [fitMode, setFitMode] = useState(true)
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
    modeRef.current = 'fit'
    setFitMode(true)
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

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      if (stageHoverRef.current) event.preventDefault()
      if (!spaceRef.current) {
        spaceRef.current = true
        setSpaceDown(true)
      }
    }
    const up = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return
      spaceRef.current = false
      setSpaceDown(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  function switchEngine(next: Engine) {
    setEngine(next)
    window.localStorage.setItem(engineStorageKey, next)
    modeRef.current = 'fit'
    setFitMode(true)
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

  // ----- Figma-style camera -----

  function applyView() {
    const svg = svgRef.current
    const stage = stageRef.current
    const { tx, ty, scale } = viewRef.current
    if (svg) svg.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`
    if (stage) {
      // The dot grid lives in world space: it translates with pan and its
      // spacing scales with zoom, doubling/halving so density stays readable.
      let spacing = 18 * scale
      while (spacing < 12) spacing *= 2
      while (spacing > 36) spacing /= 2
      stage.style.backgroundSize = `${spacing}px ${spacing}px`
      stage.style.backgroundPosition = `${tx}px ${ty}px`
    }
    setZoomPct(Math.round(scale * 100))
    setFitMode(modeRef.current === 'fit')
  }

  function fitView() {
    const stage = stageRef.current
    if (!stage || !natural) return
    const rect = stage.getBoundingClientRect()
    const scale = Math.min(1, (rect.width - 48) / natural.width, (rect.height - 40) / natural.height)
    const safeScale = Math.max(minZoom, Number.isFinite(scale) && scale > 0 ? scale : 1)
    viewRef.current = {
      scale: safeScale,
      tx: (rect.width - natural.width * safeScale) / 2,
      ty: Math.max(16, (rect.height - natural.height * safeScale) / 2),
    }
    modeRef.current = 'fit'
    applyView()
  }

  function zoomAtPoint(stageX: number, stageY: number, factor: number) {
    const { tx, ty, scale } = viewRef.current
    const next = Math.min(maxZoom, Math.max(minZoom, scale * factor))
    if (next === scale) return
    viewRef.current = {
      scale: next,
      tx: stageX - ((stageX - tx) / scale) * next,
      ty: stageY - ((stageY - ty) / scale) * next,
    }
    modeRef.current = 'manual'
    applyView()
  }

  function panBy(dx: number, dy: number) {
    viewRef.current = { ...viewRef.current, tx: viewRef.current.tx + dx, ty: viewRef.current.ty + dy }
    modeRef.current = 'manual'
    applyView()
  }

  const stageHeight = useMemo(() => {
    if (!natural || !containerWidth) return 320
    const widthScale = Math.min(1, (containerWidth - 48) / natural.width)
    return Math.round(Math.min(640, Math.max(300, natural.height * widthScale + 56)))
  }, [natural, containerWidth])

  useLayoutEffect(() => {
    if (modeRef.current === 'fit') fitView()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural, containerWidth, stageHeight])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const measure = () => setContainerWidth(stage.clientWidth)
    measure()

    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    window.addEventListener('resize', measure)

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = stage.getBoundingClientRect()
      // Scroll and pinch both zoom toward the cursor; panning is space-drag,
      // middle-mouse, or touch only.
      const coefficient = event.deltaMode === 1 ? 0.05 : event.ctrlKey || event.metaKey ? 0.008 : 0.002
      const factor = Math.exp(-event.deltaY * coefficient)
      zoomAtPoint(event.clientX - rect.left, event.clientY - rect.top, factor)
    }
    stage.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      stage.removeEventListener('wheel', onWheel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    const stage = stageRef.current
    if (!stage) return
    if ((event.target as HTMLElement).closest('.diagram-zoom, .diagram-popover')) return
    // Figma rules: touch always pans/pinches; mouse pans with space+drag or
    // the middle button. A plain left-drag leaves clicks and hovers alone.
    const isTouch = event.pointerType === 'touch'
    const middleButton = event.pointerType === 'mouse' && event.button === 1
    const spacePan = event.button === 0 && spaceRef.current
    if (!isTouch && !middleButton && !spacePan) return
    event.preventDefault()
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    dragDistanceRef.current = 0
    try {
      stage.setPointerCapture(event.pointerId)
    } catch {
      // synthetic or already-released pointers can't be captured; panning still works
    }
    if (pointersRef.current.size === 1) setPanning(true)
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const pointers = pointersRef.current
    const previous = pointers.get(event.pointerId)
    if (!previous) return

    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)
      if (other) {
        const [, otherPos] = other
        const prevDist = Math.hypot(previous.x - otherPos.x, previous.y - otherPos.y)
        const nextDist = Math.hypot(event.clientX - otherPos.x, event.clientY - otherPos.y)
        const stage = stageRef.current
        if (stage && prevDist > 0) {
          const rect = stage.getBoundingClientRect()
          const midX = (event.clientX + otherPos.x) / 2 - rect.left
          const midY = (event.clientY + otherPos.y) / 2 - rect.top
          zoomAtPoint(midX, midY, nextDist / prevDist)
        }
      }
    } else if (pointers.size === 1) {
      const dx = event.clientX - previous.x
      const dy = event.clientY - previous.y
      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy)
      panBy(dx, dy)
    }

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId)
    stageRef.current?.releasePointerCapture?.(event.pointerId)
    if (pointersRef.current.size === 0) setPanning(false)
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

  async function handleDiagramClick(event: ReactMouseEvent) {
    if (engine !== 'interactive') return
    if (dragDistanceRef.current > 5) return
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
    const shell = stageRef.current?.parentElement
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
          ref={stageRef}
          className={`diagram-scroll diagram-stage ${panning ? 'panning' : ''} ${spaceDown && !panning ? 'space-pan' : ''} ${message ? 'is-empty' : ''}`}
          style={{ height: stageHeight }}
          onPointerDown={startPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onMouseEnter={() => { stageHoverRef.current = true }}
          onMouseLeave={() => { stageHoverRef.current = false }}
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
          <div className="diagram-zoom" role="group" aria-label="Diagram zoom and pan">
            <button
              type="button"
              onClick={() => {
                const stage = stageRef.current
                if (stage) zoomAtPoint(stage.clientWidth / 2, stage.clientHeight / 2, 1 / zoomStep)
              }}
              disabled={zoomPct <= minZoom * 100}
              aria-label="Zoom out"
            >
              <Minus size={12} weight="bold" />
            </button>
            <button type="button" className="zoom-level" onClick={fitView} title="Fit diagram">
              {zoomPct}%
            </button>
            <button
              type="button"
              onClick={() => {
                const stage = stageRef.current
                if (stage) zoomAtPoint(stage.clientWidth / 2, stage.clientHeight / 2, zoomStep)
              }}
              disabled={zoomPct >= maxZoom * 100}
              aria-label="Zoom in"
            >
              <Plus size={12} weight="bold" />
            </button>
            {!fitMode && (
              <button type="button" onClick={fitView} title="Fit diagram" aria-label="Fit diagram">
                <ArrowsInSimple size={12} weight="bold" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
