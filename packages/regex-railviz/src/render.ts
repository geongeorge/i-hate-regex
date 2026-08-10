import type { AstNode } from './parse'

const SVG_NS = 'http://www.w3.org/2000/svg'
const CHAR_W = 7.25
const BOX_H = 26
const PAD_X = 9
const GAP_X = 16
const V_GAP = 10
const MEMBER_H = 20
const MEMBER_GAP = 5
const LABEL_H = 14

type Laid = {
  el: SVGGElement
  width: number
  height: number
  ay: number
}

export type RenderOptions = {
  collapsed?: ReadonlySet<number>
}

let currentCollapsed: ReadonlySet<number> = new Set()

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value))
  return el
}

function textWidth(label: string) {
  return Math.max(label.length * CHAR_W, 10)
}

function makeText(label: string, x: number, y: number, className = '') {
  const text = svgEl('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central' })
  if (className) text.setAttribute('class', className)
  text.textContent = label
  return text
}

function group(node: AstNode, className: string) {
  const g = svgEl('g', { class: `rrv ${className}`, 'data-start': node.start, 'data-end': node.end }) as SVGGElement
  return g
}

/** Smooth cubic connector between two rail points. */
function curve(x0: number, y0: number, x1: number, y1: number) {
  if (y0 === y1) return `M${x0},${y0}L${x1},${y1}`
  const dx = Math.max((x1 - x0) / 2, 6)
  return `M${x0},${y0}C${x0 + dx},${y0} ${x1 - dx},${y1} ${x1},${y1}`
}

function rails(paths: Array<string>) {
  return svgEl('path', { class: 'rrv-rail', d: paths.join('') })
}

function terminalBox(node: AstNode, label: string, className: string): Laid {
  const g = group(node, className)
  const width = textWidth(label) + PAD_X * 2
  g.appendChild(svgEl('rect', { class: 'rrv-shape', x: 0, y: 0, width, height: BOX_H, rx: 5 }))
  g.appendChild(makeText(label, width / 2, BOX_H / 2))
  return { el: g, width, height: BOX_H, ay: BOX_H / 2 }
}

function layoutNode(node: AstNode): Laid {
  switch (node.type) {
    case 'literal':
      return terminalBox(node, `“${node.value}”`, 'rrv-literal')
    case 'meta':
      return terminalBox(node, node.label, 'rrv-meta')
    case 'anchor':
      return terminalBox(node, node.label, 'rrv-anchor')
    case 'empty': {
      const g = group(node, 'rrv-empty')
      return { el: g, width: 10, height: 2, ay: 1 }
    }
    case 'class':
      return layoutClass(node)
    case 'seq':
      return layoutSequence(node)
    case 'alt':
      return layoutAlternation(node)
    case 'repeat':
      return layoutRepeat(node)
    case 'group':
      return layoutGroup(node)
  }
}

function layoutClass(node: Extract<AstNode, { type: 'class' }>): Laid {
  const g = group(node, 'rrv-class')
  const label = node.negated ? 'None of:' : 'One of:'
  const memberWidths = node.members.map((member) => textWidth(member.label) + PAD_X * 2)
  const innerWidth = Math.max(textWidth(label), ...memberWidths, 30)
  const width = innerWidth + PAD_X * 2
  const membersHeight = node.members.length * MEMBER_H + Math.max(0, node.members.length - 1) * MEMBER_GAP
  const height = LABEL_H + membersHeight + PAD_X * 2

  g.appendChild(svgEl('rect', { class: 'rrv-shape rrv-container', x: 0, y: 0, width, height, rx: 6 }))
  const heading = makeText(label, width / 2, LABEL_H / 2 + PAD_X - 2, 'rrv-class-label')
  g.appendChild(heading)

  let y = LABEL_H + PAD_X
  for (const member of node.members) {
    const memberWidth = textWidth(member.label) + PAD_X * 2
    const x = (width - memberWidth) / 2
    const memberGroup = svgEl('g', {
      class: `rrv rrv-member rrv-member-${member.kind}`,
      'data-start': member.start,
      'data-end': member.end,
    })
    memberGroup.appendChild(svgEl('rect', { class: 'rrv-shape', x, y, width: memberWidth, height: MEMBER_H, rx: 4 }))
    memberGroup.appendChild(makeText(member.label, width / 2, y + MEMBER_H / 2))
    g.appendChild(memberGroup)
    y += MEMBER_H + MEMBER_GAP
  }

  return { el: g, width, height, ay: height / 2 }
}

function layoutSequence(node: Extract<AstNode, { type: 'seq' }>): Laid {
  const children = node.items.map(layoutNode)
  const ay = Math.max(...children.map((child) => child.ay))
  const height = Math.max(...children.map((child) => ay - child.ay + child.height))
  const g = group(node, 'rrv-seq')
  const paths: Array<string> = []

  let x = 0
  children.forEach((child, index) => {
    if (index > 0) {
      paths.push(curve(x, ay, x + GAP_X, ay))
      x += GAP_X
    }
    child.el.setAttribute('transform', `translate(${x}, ${ay - child.ay})`)
    g.appendChild(child.el)
    x += child.width
  })

  if (paths.length) g.insertBefore(rails(paths), g.firstChild)
  return { el: g, width: x, height, ay }
}

function layoutAlternation(node: Extract<AstNode, { type: 'alt' }>): Laid {
  const children = node.options.map(layoutNode)
  const inset = 24
  const innerWidth = Math.max(...children.map((child) => child.width))
  const width = innerWidth + inset * 2
  const g = group(node, 'rrv-alt')
  const paths: Array<string> = []

  let y = 0
  const rows = children.map((child) => {
    const rowY = y
    y += child.height + V_GAP
    return { child, y: rowY }
  })
  const height = y - V_GAP
  const ay = rows[0].y + rows[0].child.ay

  for (const { child, y: rowY } of rows) {
    const childX = inset + (innerWidth - child.width) / 2
    const childAy = rowY + child.ay
    child.el.setAttribute('transform', `translate(${childX}, ${rowY})`)
    g.appendChild(child.el)
    paths.push(curve(0, ay, childX, childAy))
    paths.push(curve(childX + child.width, childAy, width, ay))
  }

  g.insertBefore(rails(paths), g.firstChild)
  return { el: g, width, height, ay }
}

function repeatLabel(min: number, max: number | null, lazy: boolean) {
  let label = ''
  if (max === null) {
    if (min > 1) label = `${min}+ times`
  } else if (min === max) {
    if (min > 1) label = `${min} times`
  } else if (!(min === 0 && max === 1)) {
    label = `${min}…${max} times`
  }
  if (lazy && label) label += ' · lazy'
  else if (lazy) label = 'lazy'
  return label
}

function layoutRepeat(node: Extract<AstNode, { type: 'repeat' }>): Laid {
  const child = layoutNode(node.body)
  const hasBypass = node.min === 0
  const hasLoop = node.max === null || node.max > 1
  const label = repeatLabel(node.min, node.max, node.lazy)

  const inset = 14
  const topExtra = hasBypass ? 16 : 0
  const loopDepth = hasLoop ? 14 : 0
  const labelExtra = label ? LABEL_H : 0
  const width = child.width + inset * 2
  const height = topExtra + child.height + loopDepth + labelExtra
  const ay = topExtra + child.ay

  const g = group(node, 'rrv-repeat')
  const paths: Array<string> = []

  child.el.setAttribute('transform', `translate(${inset}, ${topExtra})`)
  g.appendChild(child.el)

  paths.push(curve(0, ay, inset, ay))
  paths.push(curve(inset + child.width, ay, width, ay))

  if (hasBypass) {
    const topY = 2
    paths.push(`M0,${ay}q8,0 8,-8V${topY + 8}q0,-8 8,-8H${width - 16}q8,0 8,8V${ay - 8}q0,8 8,8`)
  }

  if (hasLoop) {
    const bottom = topExtra + child.height + loopDepth
    paths.push(
      `M${inset},${ay}q-8,0 -8,8V${bottom - 8}q0,8 8,8H${inset + child.width}q8,0 8,-8V${ay + 8}q0,-8 -8,-8`,
    )
    const arrow = svgEl('path', {
      class: 'rrv-arrow',
      d: `M${width / 2 + 4},${bottom - 4}l-6,4l6,4z`,
    })
    g.appendChild(arrow)
  }

  if (label) {
    const text = makeText(label, width / 2, height - LABEL_H / 2 + 2, 'rrv-repeat-label')
    g.appendChild(text)
  }

  g.insertBefore(rails(paths), g.firstChild)
  return { el: g, width, height, ay }
}

const groupTitles: Record<string, (node: Extract<AstNode, { type: 'group' }>) => string> = {
  capture: (node) => (node.name ? `group “${node.name}”` : `group #${node.index}`),
  noncapture: () => 'group',
  lookahead: () => 'followed by',
  'neg-lookahead': () => 'not followed by',
  lookbehind: () => 'preceded by',
  'neg-lookbehind': () => 'not preceded by',
}

function layoutGroup(node: Extract<AstNode, { type: 'group' }>): Laid {
  if (node.kind !== 'noncapture' && currentCollapsed.has(node.start)) {
    const title = groupTitles[node.kind](node)
    const laid = terminalBox(node, `${title} ⋯`, 'rrv-group rrv-group-collapsed')
    laid.el.setAttribute('data-group', String(node.start))
    return laid
  }

  const child = layoutNode(node.body)
  if (node.kind === 'noncapture') {
    // Non-capturing groups are pure syntax; render the body directly but keep the span.
    child.el.setAttribute('data-start', String(node.start))
    child.el.setAttribute('data-end', String(node.end))
    return child
  }

  const title = groupTitles[node.kind](node)
  const pad = 12
  const width = Math.max(child.width + pad * 2, textWidth(title) + pad * 2)
  const height = LABEL_H + child.height + pad * 2
  const ay = LABEL_H + pad + child.ay
  const g = group(node, `rrv-group rrv-group-${node.kind}`)

  g.appendChild(svgEl('rect', { class: 'rrv-outline', x: 0, y: LABEL_H / 2, width, height: height - LABEL_H / 2, rx: 7 }))
  const heading = svgEl('text', { x: 10, y: LABEL_H / 2, class: 'rrv-group-label', 'dominant-baseline': 'central' })
  heading.textContent = title
  g.appendChild(heading)

  const collapser = svgEl('text', {
    x: 10 + textWidth(title) + 8,
    y: LABEL_H / 2,
    class: 'rrv-collapse',
    'dominant-baseline': 'central',
    'data-group': node.start,
    role: 'button',
    'aria-label': `Collapse ${title}`,
  })
  collapser.textContent = '▾'
  g.appendChild(collapser)

  const childX = (width - child.width) / 2
  child.el.setAttribute('transform', `translate(${childX}, ${LABEL_H + pad})`)
  g.appendChild(child.el)

  const paths = [curve(0, ay, childX, ay), curve(childX + child.width, ay, width, ay)]
  g.insertBefore(rails(paths), g.firstChild)

  return { el: g, width, height, ay }
}

const flagNames: Record<string, string> = {
  g: 'Global',
  i: 'Ignore case',
  m: 'Multiline',
  s: 'Dot all',
  u: 'Unicode',
  y: 'Sticky',
}

const styles = `
  svg.rrv-root { background: var(--rrd-canvas, #ffffff); font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  svg.rrv-root text { fill: var(--rrd-ink, #111111); }
  svg.rrv-root .rrv-rail { fill: none; stroke: var(--rrd-rail, #111111); stroke-width: 2; }
  svg.rrv-root .rrv-arrow { fill: var(--rrd-rail, #111111); }
  svg.rrv-root .rrv-endpoint { fill: var(--rrd-endpoint, #6b6659); stroke: var(--rrd-rail, #111111); stroke-width: 2; }
  svg.rrv-root .rrv-literal > .rrv-shape { fill: var(--rrd-literal-box, #dae9e5); }
  svg.rrv-root .rrv-meta > .rrv-shape { fill: var(--rrd-escape-box, #bada55); }
  svg.rrv-root .rrv-anchor > .rrv-shape { fill: var(--rrd-anchor-box, #6b6659); }
  svg.rrv-root .rrv-anchor > text { fill: var(--rrd-anchor-ink, #ffffff); }
  svg.rrv-root .rrv-class > .rrv-container { fill: var(--rrd-charset-box, #cbcbba); }
  svg.rrv-root .rrv-member > .rrv-shape { fill: var(--rrd-canvas, #ffffff); opacity: .82; }
  svg.rrv-root .rrv-member-meta > .rrv-shape { fill: var(--rrd-escape-box, #bada55); opacity: 1; }
  svg.rrv-root .rrv-class-label, svg.rrv-root .rrv-repeat-label, svg.rrv-root .rrv-group-label { font-size: 10px; fill: var(--rrd-ink, #111111); opacity: .75; }
  svg.rrv-root .rrv-group > .rrv-outline { fill: none; stroke: var(--rrd-subexp-line, #bfbfbf); stroke-width: 2; stroke-dasharray: 6 3; }
  svg.rrv-root .rrv-group-label { paint-order: stroke; stroke: var(--rrd-canvas, #ffffff); stroke-width: 8; }
  svg.rrv-root .rrv-collapse { cursor: pointer; font-size: 11px; fill: var(--rrd-ink, #111111); opacity: .55; }
  svg.rrv-root .rrv-collapse:hover { opacity: 1; }
  svg.rrv-root .rrv-group-collapsed > .rrv-shape { fill: none; stroke: var(--rrd-subexp-line, #bfbfbf); stroke-width: 2; stroke-dasharray: 6 3; }
  svg.rrv-root .rrv-group-collapsed > text { opacity: .8; }
  svg.rrv-root .rrv-hot > .rrv-shape,
  svg.rrv-root .rrv-hot > .rrv-container,
  svg.rrv-root .rrv-hot > .rrv-outline { stroke: var(--rrd-hot, #e53e3e); stroke-width: 2.5; stroke-dasharray: none; }
  svg.rrv-root .rrv-hot > text { font-weight: 700; }
  svg.rrv-root [data-start] { cursor: pointer; }
`

export function renderRailroad(
  target: SVGSVGElement,
  pattern: string,
  flags: string,
  ast: AstNode,
  options: RenderOptions = {},
) {
  currentCollapsed = options.collapsed ?? new Set()
  target.replaceChildren()
  target.setAttribute('class', `${target.getAttribute('class') ?? ''} rrv-root`.trim())

  const style = svgEl('style')
  style.textContent = styles
  target.appendChild(style)

  const content = layoutNode(ast)
  const flagLine = flags
    ? `Flags: ${flags.split('').map((flag) => flagNames[flag] ?? flag).filter(Boolean).join(', ')}`
    : ''

  const margin = 16
  const railLead = 22
  const flagsExtra = flagLine ? 22 : 0

  const totalWidth = content.width + railLead * 2 + margin * 2
  const totalHeight = content.height + margin * 2 + flagsExtra
  const contentY = margin + flagsExtra
  const ay = contentY + content.ay

  if (flagLine) {
    const flagText = svgEl('text', { x: margin, y: margin + 4, class: 'rrv-flags', 'dominant-baseline': 'hanging' })
    flagText.textContent = flagLine
    target.appendChild(flagText)
  }

  const startX = margin
  const endX = totalWidth - margin
  target.appendChild(rails([
    curve(startX, ay, margin + railLead, ay),
    curve(totalWidth - margin - railLead, ay, endX, ay),
  ]))
  target.appendChild(svgEl('circle', { class: 'rrv-endpoint', cx: startX, cy: ay, r: 5 }))
  target.appendChild(svgEl('circle', { class: 'rrv-endpoint', cx: endX, cy: ay, r: 5 }))

  content.el.setAttribute('transform', `translate(${margin + railLead}, ${contentY})`)
  target.appendChild(content.el)

  target.setAttribute('width', String(Math.ceil(totalWidth)))
  target.setAttribute('height', String(Math.ceil(totalHeight)))
  target.setAttribute('viewBox', `0 0 ${Math.ceil(totalWidth)} ${Math.ceil(totalHeight)}`)
}
