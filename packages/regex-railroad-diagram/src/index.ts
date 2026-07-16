import { render } from '@regexper/render'

const defaultTagName = 'regex-diagram'
const rendererScopeClass = 'regex-diagram-renderer'

export type RegexDiagramOptions = {
  pattern: string
  flags?: string
}

function scopeRendererStyles(target: SVGSVGElement) {
  target.classList.add(rendererScopeClass)
  const rootSelector = `svg.${rendererScopeClass}`

  for (const styleElement of target.querySelectorAll('style')) {
    const sheet = styleElement.sheet as CSSStyleSheet | null
    if (!sheet) continue

    styleElement.textContent = Array.from(sheet.cssRules)
      .map((rule) => {
        if (!(rule instanceof CSSStyleRule)) return rule.cssText

        const selectors = rule.selectorText.split(',').map((selector) => {
          const trimmed = selector.trim()
          return trimmed === 'svg' ? rootSelector : `${rootSelector} ${trimmed}`
        })

        return `${selectors.join(', ')} { ${rule.style.cssText} }`
      })
      .join('\n')
  }
}

export async function renderRegexDiagram(
  target: SVGSVGElement,
  { pattern, flags = '' }: RegexDiagramOptions,
) {
  target.replaceChildren()
  await render(new RegExp(pattern, flags), target)
  scopeRendererStyles(target)
}

export class RegexDiagramElement extends HTMLElement {
  static observedAttributes = ['pattern', 'flags', 'label']

  readonly #shadow = this.attachShadow({ mode: 'open' })
  #renderVersion = 0

  connectedCallback() {
    this.#draw()
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#draw()
  }

  async #draw() {
    const version = ++this.#renderVersion
    const pattern = this.getAttribute('pattern') ?? ''
    const flags = this.getAttribute('flags') ?? ''
    const label = this.getAttribute('label') ?? 'Regular expression diagram'

    this.#shadow.innerHTML = `
      <style>
        :host { display: block; color: #242018; font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; }
        .frame { min-height: 210px; display: grid; place-items: center; overflow: auto; border-radius: 18px; background: var(--regex-diagram-bg, #fbfaf6); }
        svg { display: block; min-width: max-content; padding: 28px; }
        .status { display: grid; justify-items: center; gap: 7px; padding: 32px; color: #777064; text-align: center; }
        .pulse { width: 26px; height: 26px; border: 2px solid #d8d2c6; border-top-color: var(--regex-diagram-accent, #ef5d37); border-radius: 999px; animation: spin .75s linear infinite; }
        .error { color: #a43a24; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }
      </style>
      <div class="frame"><div class="status"><span class="pulse"></span><span>Drawing expression…</span></div></div>
    `

    const frame = this.#shadow.querySelector<HTMLDivElement>('.frame')!
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('role', 'img')
    svg.setAttribute('aria-label', label)

    try {
      await renderRegexDiagram(svg, { pattern, flags })
      if (version !== this.#renderVersion) return
      frame.replaceChildren(svg)
      this.dispatchEvent(new CustomEvent('regex-render', { bubbles: true, composed: true }))
    } catch (cause) {
      if (version !== this.#renderVersion) return
      const message = cause instanceof Error ? cause.message : 'Could not render this expression'
      const status = document.createElement('div')
      status.className = 'status error'
      status.textContent = message
      frame.replaceChildren(status)
      this.dispatchEvent(new CustomEvent('regex-error', {
        bubbles: true,
        composed: true,
        detail: { message },
      }))
    }
  }
}

export function defineRegexDiagram(tagName = defaultTagName) {
  if (!customElements.get(tagName)) customElements.define(tagName, RegexDiagramElement)
}

if (typeof window !== 'undefined' && 'customElements' in window) {
  defineRegexDiagram()
}
