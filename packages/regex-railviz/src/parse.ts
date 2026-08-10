export type Span = { start: number; end: number }

export type ClassMember = Span & {
  kind: 'char' | 'range' | 'meta'
  label: string
}

export type AstNode =
  | (Span & { type: 'alt'; options: Array<AstNode> })
  | (Span & { type: 'seq'; items: Array<AstNode> })
  | (Span & {
      type: 'group'
      kind: 'capture' | 'noncapture' | 'lookahead' | 'neg-lookahead' | 'lookbehind' | 'neg-lookbehind'
      name?: string
      index?: number
      body: AstNode
    })
  | (Span & { type: 'repeat'; min: number; max: number | null; lazy: boolean; body: AstNode })
  | (Span & { type: 'literal'; value: string })
  | (Span & { type: 'meta'; label: string })
  | (Span & { type: 'anchor'; label: string })
  | (Span & { type: 'class'; negated: boolean; members: Array<ClassMember> })
  | (Span & { type: 'empty' })

const metaLabels: Record<string, string> = {
  d: 'digit',
  D: 'non-digit',
  w: 'word char',
  W: 'non-word char',
  s: 'white space',
  S: 'non-white space',
  n: 'new line',
  t: 'tab',
  r: 'carriage return',
  f: 'form feed',
  v: 'vertical tab',
  '0': 'null',
}

export function parseRegex(pattern: string, flags = ''): AstNode {
  const multiline = flags.includes('m')
  let pos = 0
  let groupIndex = 0

  function peek(offset = 0) {
    return pattern[pos + offset]
  }

  function fail(message: string): never {
    throw new Error(`${message} at position ${pos}`)
  }

  function parseAlternation(): AstNode {
    const start = pos
    const options: Array<AstNode> = [parseSequence()]
    while (peek() === '|') {
      pos += 1
      options.push(parseSequence())
    }
    if (options.length === 1) return options[0]
    return { type: 'alt', options, start, end: pos }
  }

  function parseSequence(): AstNode {
    const start = pos
    const items: Array<AstNode> = []

    while (pos < pattern.length && peek() !== '|' && peek() !== ')') {
      const atom = parseQuantified()
      const previous = items[items.length - 1]
      if (
        atom.type === 'literal' &&
        previous?.type === 'literal'
      ) {
        items[items.length - 1] = {
          type: 'literal',
          value: previous.value + atom.value,
          start: previous.start,
          end: atom.end,
        }
      } else {
        items.push(atom)
      }
    }

    if (items.length === 0) return { type: 'empty', start, end: pos }
    if (items.length === 1) return items[0]
    return { type: 'seq', items, start, end: pos }
  }

  function parseQuantified(): AstNode {
    const atom = parseAtom()
    const start = atom.start
    const char = peek()

    let min = -1
    let max: number | null = -1

    if (char === '*') {
      min = 0
      max = null
      pos += 1
    } else if (char === '+') {
      min = 1
      max = null
      pos += 1
    } else if (char === '?') {
      min = 0
      max = 1
      pos += 1
    } else if (char === '{') {
      const match = /^\{(\d+)(?:,(\d*))?\}/.exec(pattern.slice(pos))
      if (match) {
        min = Number(match[1])
        max = match[2] === undefined ? min : match[2] === '' ? null : Number(match[2])
        pos += match[0].length
      }
    }

    if (min === -1) return atom

    let lazy = false
    if (peek() === '?') {
      lazy = true
      pos += 1
    }

    return { type: 'repeat', min, max, lazy, body: atom, start, end: pos }
  }

  function parseAtom(): AstNode {
    const start = pos
    const char = peek()

    if (char === undefined) fail('Unexpected end of pattern')

    if (char === '^') {
      pos += 1
      return { type: 'anchor', label: multiline ? 'Start of line' : 'Start', start, end: pos }
    }
    if (char === '$') {
      pos += 1
      return { type: 'anchor', label: multiline ? 'End of line' : 'End', start, end: pos }
    }
    if (char === '.') {
      pos += 1
      return { type: 'meta', label: 'any char', start, end: pos }
    }
    if (char === '(') return parseGroup()
    if (char === '[') return parseClass()
    if (char === '\\') return parseEscape()
    if (char === ')' || char === '|') fail(`Unexpected "${char}"`)

    pos += 1
    return { type: 'literal', value: char, start, end: pos }
  }

  function parseGroup(): AstNode {
    const start = pos
    pos += 1 // consume (

    let kind: 'capture' | 'noncapture' | 'lookahead' | 'neg-lookahead' | 'lookbehind' | 'neg-lookbehind' = 'capture'
    let name: string | undefined
    let index: number | undefined

    if (peek() === '?') {
      if (peek(1) === ':') {
        kind = 'noncapture'
        pos += 2
      } else if (peek(1) === '=') {
        kind = 'lookahead'
        pos += 2
      } else if (peek(1) === '!') {
        kind = 'neg-lookahead'
        pos += 2
      } else if (peek(1) === '<' && peek(2) === '=') {
        kind = 'lookbehind'
        pos += 3
      } else if (peek(1) === '<' && peek(2) === '!') {
        kind = 'neg-lookbehind'
        pos += 3
      } else if (peek(1) === '<') {
        const close = pattern.indexOf('>', pos + 2)
        if (close < 0) fail('Unterminated group name')
        name = pattern.slice(pos + 2, close)
        pos = close + 1
        groupIndex += 1
        index = groupIndex
      } else {
        fail('Unsupported group syntax')
      }
    } else {
      groupIndex += 1
      index = groupIndex
    }

    const body = parseAlternation()
    if (peek() !== ')') fail('Expected ")"')
    pos += 1

    return { type: 'group', kind, name, index, body, start, end: pos }
  }

  function parseClass(): AstNode {
    const start = pos
    pos += 1 // consume [
    let negated = false
    if (peek() === '^') {
      negated = true
      pos += 1
    }

    const members: Array<ClassMember> = []

    function readClassAtom(): { label: string; meta: boolean } {
      if (peek() !== '\\') {
        const label = `“${peek()}”`
        pos += 1
        return { label, meta: false }
      }

      const escaped = peek(1)
      if (escaped === undefined) fail('Trailing backslash in class')

      if (escaped === 'u' && peek(2) === '{') {
        const close = pattern.indexOf('}', pos + 3)
        if (close < 0) fail('Unterminated \\u{…} in class')
        const code = pattern.slice(pos + 3, close)
        pos = close + 1
        return { label: `U+${code.toUpperCase()}`, meta: false }
      }
      if (escaped === 'u' && /^[0-9a-fA-F]{4}/.test(pattern.slice(pos + 2))) {
        const code = pattern.slice(pos + 2, pos + 6)
        pos += 6
        return { label: `U+${code.toUpperCase()}`, meta: false }
      }
      if (escaped === 'x' && /^[0-9a-fA-F]{2}/.test(pattern.slice(pos + 2))) {
        const code = pattern.slice(pos + 2, pos + 4)
        pos += 4
        return { label: `0x${code.toUpperCase()}`, meta: false }
      }
      if ((escaped === 'p' || escaped === 'P') && peek(2) === '{') {
        const close = pattern.indexOf('}', pos + 3)
        if (close < 0) fail('Unterminated \\p{…} in class')
        const property = pattern.slice(pos + 3, close)
        pos = close + 1
        return { label: `${escaped === 'P' ? 'not ' : ''}${property}`, meta: true }
      }
      if (escaped in metaLabels) {
        pos += 2
        return { label: metaLabels[escaped], meta: true }
      }

      pos += 2
      return { label: `“${escaped}”`, meta: false }
    }

    while (pos < pattern.length && peek() !== ']') {
      const memberStart = pos
      const atom = readClassAtom()
      let label = atom.label
      let kind: ClassMember['kind'] = atom.meta ? 'meta' : 'char'

      // Range: a-z (but not when - is the last char before ])
      if (!atom.meta && peek() === '-' && peek(1) !== ']' && peek(1) !== undefined) {
        pos += 1
        const endAtom = readClassAtom()
        label = `${label} – ${endAtom.label}`
        kind = 'range'
      }

      members.push({ kind, label, start: memberStart, end: pos })
    }

    if (peek() !== ']') fail('Unterminated character class')
    pos += 1

    return { type: 'class', negated, members, start, end: pos }
  }

  function parseEscape(): AstNode {
    const start = pos
    const next = peek(1)
    if (next === undefined) fail('Trailing backslash')

    if (next === 'b') {
      pos += 2
      return { type: 'anchor', label: 'word boundary', start, end: pos }
    }
    if (next === 'B') {
      pos += 2
      return { type: 'anchor', label: 'non-boundary', start, end: pos }
    }
    if (/[1-9]/.test(next)) {
      pos += 2
      while (/\d/.test(peek() ?? '')) pos += 1
      return { type: 'meta', label: `group ${pattern.slice(start + 1, pos)}`, start, end: pos }
    }
    if (next === 'k' && peek(2) === '<') {
      const close = pattern.indexOf('>', pos + 3)
      if (close < 0) fail('Unterminated \\k reference')
      const name = pattern.slice(pos + 3, close)
      pos = close + 1
      return { type: 'meta', label: `group “${name}”`, start, end: pos }
    }
    if ((next === 'p' || next === 'P') && peek(2) === '{') {
      const close = pattern.indexOf('}', pos + 3)
      if (close < 0) fail('Unterminated \\p{…}')
      const property = pattern.slice(pos + 3, close)
      pos = close + 1
      return { type: 'meta', label: `${next === 'P' ? 'not ' : ''}${property}`, start, end: pos }
    }
    if (next === 'u' && peek(2) === '{') {
      const close = pattern.indexOf('}', pos + 3)
      if (close < 0) fail('Unterminated \\u{…}')
      const code = pattern.slice(pos + 3, close)
      pos = close + 1
      return { type: 'meta', label: `U+${code.toUpperCase()}`, start, end: pos }
    }
    if (next === 'u' && /^[0-9a-fA-F]{4}/.test(pattern.slice(pos + 2))) {
      const code = pattern.slice(pos + 2, pos + 6)
      pos += 6
      return { type: 'meta', label: `U+${code.toUpperCase()}`, start, end: pos }
    }
    if (next === 'x' && /^[0-9a-fA-F]{2}/.test(pattern.slice(pos + 2))) {
      const code = pattern.slice(pos + 2, pos + 4)
      pos += 4
      return { type: 'meta', label: `0x${code.toUpperCase()}`, start, end: pos }
    }
    if (next in metaLabels) {
      pos += 2
      return { type: 'meta', label: metaLabels[next], start, end: pos }
    }

    pos += 2
    return { type: 'literal', value: next, start, end: pos }
  }

  const ast = parseAlternation()
  if (pos < pattern.length) fail(`Unexpected "${peek()}"`)
  return ast
}
