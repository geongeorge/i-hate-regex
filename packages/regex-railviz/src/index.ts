import { parseRegex } from './parse'
import { renderRailroad } from './render'

export type { AstNode, ClassMember, Span } from './parse'

export type RailvizOptions = {
  pattern: string
  flags?: string
  /** Source offsets of group openings to render collapsed. */
  collapsed?: Iterable<number>
}

/**
 * Renders an interactive railroad diagram into the given SVG element.
 * Every node carries data-start / data-end attributes mapping it back to
 * the source pattern, enabling two-way highlighting. Group nodes include a
 * collapse affordance (.rrv-collapse / .rrv-group-collapsed with a
 * data-group attribute) — re-render with the toggled `collapsed` set.
 */
export function renderRailviz(target: SVGSVGElement, { pattern, flags = '', collapsed }: RailvizOptions) {
  const ast = parseRegex(pattern, flags)
  renderRailroad(target, pattern, flags, ast, { collapsed: new Set(collapsed ?? []) })
}

/**
 * Highlights the smallest diagram node that fully contains the given source
 * range. Pass null to clear. Returns the highlighted element, if any.
 */
export function highlightRange(
  target: SVGSVGElement,
  range: { start: number; end: number } | null,
): SVGGElement | null {
  for (const hot of target.querySelectorAll('.rrv-hot')) hot.classList.remove('rrv-hot')
  if (!range) return null

  let best: SVGGElement | null = null
  let bestSize = Number.POSITIVE_INFINITY

  for (const el of target.querySelectorAll<SVGGElement>('[data-start]')) {
    const start = Number(el.dataset.start)
    const end = Number(el.dataset.end)
    if (Number.isNaN(start) || Number.isNaN(end)) continue
    if (start <= range.start && end >= range.end) {
      const size = end - start
      if (size < bestSize) {
        best = el
        bestSize = size
      }
    }
  }

  best?.classList.add('rrv-hot')
  return best
}

/**
 * Resolves the source range for a hovered element inside the diagram, if it
 * (or an ancestor) is a mapped node.
 */
export function rangeFromElement(element: Element | null): { start: number; end: number } | null {
  const node = element?.closest<SVGGElement>('[data-start]')
  if (!node?.dataset.start || !node.dataset.end) return null
  return { start: Number(node.dataset.start), end: Number(node.dataset.end) }
}
