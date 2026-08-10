import { useEffect, useMemo, useRef, useState, type MouseEvent, type UIEvent } from 'react'
import { tokenizeRegex, type RegexToken } from '~/lib/regex-explain'

type HoverState = {
  tokenIndex: number
  left: number
  top: number
}

type Props = {
  id?: string
  value: string
  flags: string
  invalid: boolean
  readOnly?: boolean
  onChange: (pattern: string) => void
  externalRange?: { start: number; end: number } | null
  onTokenHover?: (range: { start: number; end: number } | null) => void
  selectionRequest?: { start: number; end: number; at: number } | null
}

export function ExpressionEditor({ id, value, flags, invalid, readOnly = false, onChange, externalRange, onTokenHover, selectionRequest }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hover, setHover] = useState<HoverState | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || !selectionRequest) return
    textarea.focus({ preventScroll: true })
    textarea.setSelectionRange(selectionRequest.start, selectionRequest.end)
  }, [selectionRequest])

  const tokens = useMemo(() => {
    try {
      return tokenizeRegex(value, flags)
    } catch {
      return null
    }
  }, [value, flags])

  function syncScroll(event: UIEvent<HTMLTextAreaElement>) {
    const overlay = overlayRef.current
    if (!overlay) return
    overlay.scrollTop = event.currentTarget.scrollTop
    overlay.scrollLeft = event.currentTarget.scrollLeft
  }

  function handleMouseLeave() {
    setHover(null)
    onTokenHover?.(null)
  }

  function handleMouseMove(event: MouseEvent<HTMLTextAreaElement>) {
    const overlay = overlayRef.current
    const container = containerRef.current
    if (!overlay || !container || !tokens?.length) return

    const spans = overlay.querySelectorAll<HTMLSpanElement>('span[data-token]')
    for (const span of spans) {
      for (const rect of span.getClientRects()) {
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          const tokenIndex = Number(span.dataset.token)
          const containerRect = container.getBoundingClientRect()
          const left = Math.max(0, Math.min(rect.left - containerRect.left, containerRect.width - 270))
          const top = rect.bottom - containerRect.top + 7
          setHover((current) =>
            current?.tokenIndex === tokenIndex && current.left === left && current.top === top
              ? current
              : { tokenIndex, left, top },
          )
          const token = tokens[tokenIndex]
          if (token) onTokenHover?.({ start: token.start, end: token.end })
          return
        }
      }
    }
    setHover(null)
    onTokenHover?.(null)
  }

  const hoveredToken: RegexToken | null = hover && tokens ? (tokens[hover.tokenIndex] ?? null) : null

  return (
    <div ref={containerRef} className="expression-editor">
      <div ref={overlayRef} className="expression-highlights" aria-hidden="true">
        {tokens?.map((token, tokenIndex) => (
          <span
            key={`${token.start}-${tokenIndex}`}
            data-token={tokenIndex}
            className={`tok-${token.type} ${
              hover?.tokenIndex === tokenIndex ||
              (externalRange && token.start < externalRange.end && token.end > externalRange.start)
                ? 'tok-hover'
                : ''
            }`}
          >
            {token.text}
          </span>
        )) ?? value}
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => {
          setHover(null)
          onChange(event.target.value)
        }}
        onScroll={syncScroll}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-invalid={invalid}
        spellCheck={false}
        rows={2}
        readOnly={readOnly}
      />

      {hoveredToken && hover && (
        <div className="token-popover" style={{ left: hover.left, top: hover.top }} role="tooltip">
          <div className="token-popover-head">
            <span className={`token-popover-type tok-${hoveredToken.type}`}>{hoveredToken.title}</span>
            <code>{hoveredToken.text}</code>
          </div>
          <p>{hoveredToken.detail}</p>
        </div>
      )}
    </div>
  )
}
