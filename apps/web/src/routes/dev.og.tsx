import { createFileRoute, notFound } from '@tanstack/react-router'
import { useEffect } from 'react'
import { catalog } from '~/data/catalog'

export const Route = createFileRoute('/dev/og')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: OgGenerator,
})

async function renderDiagramSvg(pattern: string, flags: string) {
  const { renderRegexDiagram } = await import('@ihateregex/regex-railroad-diagram')
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  const host = document.getElementById('og-work')!
  host.appendChild(svg)
  await renderRegexDiagram(svg, { pattern, flags })
  const rect = svg.getBoundingClientRect()
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', String(Math.ceil(rect.width)))
  clone.setAttribute('height', String(Math.ceil(rect.height)))
  host.removeChild(svg)
  return { markup: new XMLSerializer().serializeToString(clone), width: rect.width, height: rect.height }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('svg rasterize failed'))
    image.src = url
  })
}

async function composeCard(title: string, pattern: string, flags: string) {
  const width = 1200
  const height = 630
  const canvas = document.createElement('canvas')
  canvas.width = width * 2
  canvas.height = height * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  ctx.fillStyle = '#10161d'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#e6edf3'
  ctx.font = '800 54px Inter, -apple-system, sans-serif'
  ctx.fillText(title.length > 30 ? `${title.slice(0, 29)}…` : title, 64, 108)

  ctx.font = '500 26px ui-monospace, Menlo, monospace'
  ctx.fillStyle = '#7da7ff'
  const patternLine = `/${pattern}/${flags}`
  ctx.fillText(patternLine.length > 68 ? `${patternLine.slice(0, 67)}…` : patternLine, 64, 164)

  const strip = { x: 64, y: 210, w: width - 128, h: 330 }
  ctx.fillStyle = '#fbfaf6'
  ctx.beginPath()
  ctx.roundRect(strip.x, strip.y, strip.w, strip.h, 10)
  ctx.fill()

  try {
    const { markup, width: dw, height: dh } = await renderDiagramSvg(pattern, flags)
    const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }))
    const image = await loadImage(url)
    const scale = Math.min((strip.w - 60) / dw, (strip.h - 48) / dh, 1.6)
    const w = dw * scale
    const h = dh * scale
    ctx.drawImage(image, strip.x + (strip.w - w) / 2, strip.y + (strip.h - h) / 2, w, h)
    URL.revokeObjectURL(url)
  } catch {
    ctx.fillStyle = '#65717e'
    ctx.font = '500 22px ui-monospace, monospace'
    ctx.fillText('diagram unavailable', strip.x + 30, strip.y + 60)
  }

  ctx.font = '700 28px Inter, -apple-system, sans-serif'
  ctx.fillStyle = '#e6edf3'
  ctx.fillText('i', 64, 596)
  const iw = ctx.measureText('i').width
  ctx.fillStyle = '#e53e3e'
  ctx.fillText('Hate', 64 + iw, 596)
  const hw = ctx.measureText('Hate').width
  ctx.fillStyle = '#e6edf3'
  ctx.fillText('Regex', 64 + iw + hw, 596)
  ctx.font = '400 20px ui-monospace, monospace'
  ctx.fillStyle = '#8997a7'
  ctx.fillText('ihateregex.io — don’t just use it. understand it.', 64 + iw + hw + ctx.measureText('Regex').width + 24, 596)

  return canvas.toDataURL('image/png')
}

declare global {
  interface Window {
    generateOgCards: (ids: Array<string>) => Promise<Array<{ id: string; dataUrl: string }>>
  }
}

function OgGenerator() {
  useEffect(() => {
    window.generateOgCards = async (ids: Array<string>) => {
      const results: Array<{ id: string; dataUrl: string }> = []
      for (const id of ids) {
        if (id === 'default') {
          results.push({ id, dataUrl: await composeCard('regex without the guesswork', '[^@\\s]+@[^@\\s]+\\.[^@\\s]+', 'gm') })
          continue
        }
        const entry = catalog.find((item) => item.id === id)
        if (!entry) continue
        results.push({ id, dataUrl: await composeCard(entry.title, entry.regex, entry.flag) })
      }
      return results
    }
  }, [])

  return (
    <main style={{ padding: 40 }}>
      <h1>OG card generator (dev only)</h1>
      <p>Call <code>window.generateOgCards([ids])</code> from the console. Catalog ids: {catalog.length}</p>
      <div id="og-work" style={{ position: 'absolute', left: -10000, top: 0 }} />
    </main>
  )
}
