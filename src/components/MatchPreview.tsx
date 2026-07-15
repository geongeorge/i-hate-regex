import { Braces } from 'lucide-react'

type Match = {
  index: number
  text: string
}

function findMatches(pattern: string, flags: string, text: string): Array<Match> {
  if (!pattern || !text) return []

  try {
    const scanFlags = flags.includes('g') ? flags : `${flags}g`
    const regex = new RegExp(pattern, scanFlags)
    return Array.from(text.matchAll(regex))
      .filter((match) => match[0].length > 0 && match.index !== undefined)
      .map((match) => ({ index: match.index, text: match[0] }))
  } catch {
    return []
  }
}

function HighlightedText({ text, matches }: { text: string; matches: Array<Match> }) {
  if (!matches.length) return <>{text}</>

  const parts: Array<React.ReactNode> = []
  let cursor = 0

  matches.forEach((match, index) => {
    if (match.index < cursor) return
    parts.push(text.slice(cursor, match.index))
    parts.push(
      <mark key={`${match.index}-${index}`} className="match-mark">
        {match.text}
      </mark>,
    )
    cursor = match.index + match.text.length
  })
  parts.push(text.slice(cursor))
  return <>{parts}</>
}

type Props = {
  pattern: string
  flags: string
  text: string
  onChange: (value: string) => void
  error: string | null
  readOnly?: boolean
}

export function MatchPreview({ pattern, flags, text, onChange, error, readOnly = false }: Props) {
  const matches = error ? [] : findMatches(pattern, flags, text)

  return (
    <section className="panel match-panel" aria-labelledby="test-title">
      <div className="panel-heading compact-heading">
        <div>
          <span className="eyebrow">Test bench</span>
          <h2 id="test-title">Sample text</h2>
        </div>
        <span className="match-count">
          <Braces size={14} /> {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <div className="match-editor">
        <div className="match-highlights" aria-hidden="true">
          <HighlightedText text={text} matches={matches} />
        </div>
        <textarea
          aria-label="Text to test against the regular expression"
          value={text}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste text here to see matches…"
          spellCheck={false}
          readOnly={readOnly}
        />
      </div>
    </section>
  )
}
