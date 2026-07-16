import { useEffect, useRef, useState } from 'react'
import { CircleNotch, DownloadSimple, Graph } from '@phosphor-icons/react'

type Props = {
  pattern: string
  flags: string
  error: string | null
}

function serializeDiagram(svg: SVGSVGElement) {
  const rect = svg.getBoundingClientRect()
  const width = Math.max(1, Math.ceil(rect.width))
  const height = Math.max(1, Math.ceil(rect.height))

  const clone = svg.cloneNode(true) as SVGSVGElement
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

export function RegexDiagram({ pattern, flags, error }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [renderError, setRenderError] = useState<string | null>(null)
  const [rendering, setRendering] = useState(false)
  const [exportNote, setExportNote] = useState<string | null>(null)

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

  useEffect(() => {
    if (!exportNote) return
    const timer = window.setTimeout(() => setExportNote(null), 2400)
    return () => window.clearTimeout(timer)
  }, [exportNote])

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

  const message = error ?? renderError
  const exportDisabled = Boolean(message) || rendering

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
          <span className="panel-status" aria-live="polite">
            {rendering ? <CircleNotch className="spin" size={15} /> : <Graph size={15} />}
            {exportNote ?? (rendering ? 'Drawing' : 'Live')}
          </span>
        </div>
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
