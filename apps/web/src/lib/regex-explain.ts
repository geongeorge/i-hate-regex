export type RegexTokenType =
  | 'anchor'
  | 'group'
  | 'alternation'
  | 'class'
  | 'quantifier'
  | 'meta'
  | 'literal'

export type RegexToken = {
  start: number
  end: number
  text: string
  type: RegexTokenType
  title: string
  detail: string
}

const metaEscapes: Record<string, { title: string; detail: string }> = {
  d: { title: 'Digit', detail: 'Any digit from 0 to 9.' },
  D: { title: 'Non-digit', detail: 'Any character that is not a digit.' },
  w: { title: 'Word character', detail: 'A letter, digit, or underscore.' },
  W: { title: 'Non-word character', detail: 'Anything that is not a letter, digit, or underscore.' },
  s: { title: 'Whitespace', detail: 'A space, tab, or line break.' },
  S: { title: 'Non-whitespace', detail: 'Any character that is not a space, tab, or line break.' },
  n: { title: 'Newline', detail: 'A line break character.' },
  t: { title: 'Tab', detail: 'A tab character.' },
  r: { title: 'Carriage return', detail: 'A carriage return character.' },
  f: { title: 'Form feed', detail: 'A form feed character.' },
  v: { title: 'Vertical tab', detail: 'A vertical tab character.' },
  '0': { title: 'Null', detail: 'The null character.' },
}

const classEscapeNames: Record<string, string> = {
  d: 'any digit',
  D: 'any non-digit',
  w: 'any word character',
  W: 'any non-word character',
  s: 'whitespace',
  S: 'non-whitespace',
  n: 'newline',
  t: 'tab',
  r: 'carriage return',
}

function describeClassBody(body: string, negated: boolean): string {
  const items: Array<string> = []
  let index = 0

  while (index < body.length && items.length <= 8) {
    const char = body[index]

    if (char === '\\' && index + 1 < body.length) {
      const escaped = body[index + 1]
      items.push(classEscapeNames[escaped] ?? `“${escaped}”`)
      index += 2
      continue
    }

    if (body[index + 1] === '-' && index + 2 < body.length) {
      items.push(`${char}–${body[index + 2]}`)
      index += 3
      continue
    }

    items.push(`“${char}”`)
    index += 1
  }

  if (!items.length) return negated ? 'Any character at all.' : 'Matches nothing — the set is empty.'

  const list = items.length > 8 ? `${items.slice(0, 8).join(', ')}, …` : items.join(', ')
  return negated ? `One character that is not: ${list}.` : `One character from: ${list}.`
}

function describeCount(text: string): string {
  const match = /^\{(\d+)(?:,(\d*))?\}/.exec(text)
  if (!match) return 'Repeats the previous element.'
  const [, min, max] = match
  if (max === undefined) return `Repeats the previous element exactly ${min} ${min === '1' ? 'time' : 'times'}.`
  if (max === '') return `Repeats the previous element ${min} or more times.`
  return `Repeats the previous element between ${min} and ${max} times.`
}

export function tokenizeRegex(pattern: string, flags = ''): Array<RegexToken> {
  const tokens: Array<RegexToken> = []
  const groupStack: Array<string> = []
  const multiline = flags.includes('m')
  const dotAll = flags.includes('s')
  let groupNumber = 0
  let index = 0
  let literalStart = -1

  function flushLiteral() {
    if (literalStart < 0) return
    const text = pattern.slice(literalStart, index)
    tokens.push({
      start: literalStart,
      end: index,
      text,
      type: 'literal',
      title: 'Literal',
      detail: text.length === 1 ? `Matches the character “${text}”.` : `Matches “${text}” exactly, character by character.`,
    })
    literalStart = -1
  }

  function push(end: number, type: RegexTokenType, title: string, detail: string) {
    flushLiteral()
    tokens.push({ start: index, end, text: pattern.slice(index, end), type, title, detail })
    index = end
  }

  while (index < pattern.length) {
    const char = pattern[index]

    if (char === '^') {
      push(index + 1, 'anchor', 'Anchor', multiline ? 'The start of a line.' : 'The start of the text.')
      continue
    }

    if (char === '$') {
      push(index + 1, 'anchor', 'Anchor', multiline ? 'The end of a line.' : 'The end of the text.')
      continue
    }

    if (char === '|') {
      push(index + 1, 'alternation', 'OR', 'Matches either the expression before or the expression after this bar.')
      continue
    }

    if (char === '.') {
      push(index + 1, 'meta', 'Any character', dotAll ? 'Any single character.' : 'Any single character except a line break.')
      continue
    }

    if (char === '\\') {
      const next = pattern[index + 1]

      if (next === undefined) {
        push(index + 1, 'literal', 'Literal', 'A trailing backslash.')
        continue
      }

      if (next === 'b') {
        push(index + 2, 'anchor', 'Word boundary', 'The position between a word character and a non-word character.')
        continue
      }

      if (next === 'B') {
        push(index + 2, 'anchor', 'Non-boundary', 'A position that is not at the edge of a word.')
        continue
      }

      if (/[1-9]/.test(next)) {
        let end = index + 2
        while (end < pattern.length && /\d/.test(pattern[end])) end += 1
        const ref = pattern.slice(index + 1, end)
        push(end, 'meta', 'Backreference', `Matches the exact text already captured by group #${ref}.`)
        continue
      }

      if (next === 'k' && pattern[index + 2] === '<') {
        const close = pattern.indexOf('>', index + 3)
        if (close > 0) {
          const name = pattern.slice(index + 3, close)
          push(close + 1, 'meta', 'Backreference', `Matches the exact text already captured by the group named “${name}”.`)
          continue
        }
      }

      if ((next === 'p' || next === 'P') && pattern[index + 2] === '{') {
        const close = pattern.indexOf('}', index + 3)
        if (close > 0) {
          const property = pattern.slice(index + 3, close)
          push(
            close + 1,
            'meta',
            'Unicode property',
            next === 'p' ? `Any character with the Unicode property “${property}”.` : `Any character without the Unicode property “${property}”.`,
          )
          continue
        }
      }

      if (next === 'u' && pattern[index + 2] === '{') {
        const close = pattern.indexOf('}', index + 3)
        if (close > 0) {
          push(close + 1, 'meta', 'Character code', `The character with Unicode code point ${pattern.slice(index + 3, close)}.`)
          continue
        }
      }

      if (next === 'u' && /^[0-9a-fA-F]{4}/.test(pattern.slice(index + 2))) {
        push(index + 6, 'meta', 'Character code', `The character with Unicode code ${pattern.slice(index + 2, index + 6)}.`)
        continue
      }

      if (next === 'x' && /^[0-9a-fA-F]{2}/.test(pattern.slice(index + 2))) {
        push(index + 4, 'meta', 'Character code', `The character with hex code ${pattern.slice(index + 2, index + 4)}.`)
        continue
      }

      const known = metaEscapes[next]
      if (known) {
        push(index + 2, 'meta', known.title, known.detail)
        continue
      }

      push(index + 2, 'meta', 'Escaped character', `A literal “${next}” character.`)
      continue
    }

    if (char === '(') {
      let title = ''
      let detail = ''
      let end = index + 1

      if (pattern.startsWith('(?:', index)) {
        title = 'Group'
        detail = 'Groups these parts together without capturing the match.'
        end = index + 3
      } else if (pattern.startsWith('(?=', index)) {
        title = 'Lookahead'
        detail = 'Checks that what follows matches this, without including it in the result.'
        end = index + 3
      } else if (pattern.startsWith('(?!', index)) {
        title = 'Negative lookahead'
        detail = 'Checks that what follows does not match this.'
        end = index + 3
      } else if (pattern.startsWith('(?<=', index)) {
        title = 'Lookbehind'
        detail = 'Checks that what comes before matches this, without including it in the result.'
        end = index + 4
      } else if (pattern.startsWith('(?<!', index)) {
        title = 'Negative lookbehind'
        detail = 'Checks that what comes before does not match this.'
        end = index + 4
      } else if (pattern.startsWith('(?<', index)) {
        const close = pattern.indexOf('>', index + 3)
        if (close > 0) {
          groupNumber += 1
          const name = pattern.slice(index + 3, close)
          title = `Group “${name}”`
          detail = `Captures this part of the match under the name “${name}”.`
          end = close + 1
        }
      }

      if (!title) {
        groupNumber += 1
        title = `Group #${groupNumber}`
        detail = 'Captures this part of the match so it can be reused or extracted.'
      }

      groupStack.push(title)
      push(end, 'group', title, detail)
      continue
    }

    if (char === ')') {
      const opened = groupStack.pop()
      push(index + 1, 'group', opened ? `End of ${opened.toLowerCase()}` : 'Group end', opened ? `Closes ${opened.toLowerCase()}.` : 'Closes a group.')
      continue
    }

    if (char === '[') {
      const negated = pattern[index + 1] === '^'
      let cursor = index + (negated ? 2 : 1)
      while (cursor < pattern.length && pattern[cursor] !== ']') {
        cursor += pattern[cursor] === '\\' ? 2 : 1
      }

      if (cursor >= pattern.length) {
        push(pattern.length, 'class', 'Character set', 'This character set is never closed — add a “]”.')
        continue
      }

      const body = pattern.slice(index + (negated ? 2 : 1), cursor)
      push(cursor + 1, 'class', negated ? 'Negated set' : 'Character set', describeClassBody(body, negated))
      continue
    }

    if (char === '*' || char === '+' || char === '?') {
      const lazy = pattern[index + 1] === '?'
      const end = index + (lazy ? 2 : 1)
      const base =
        char === '*'
          ? 'Repeats the previous element zero or more times.'
          : char === '+'
            ? 'Repeats the previous element one or more times.'
            : 'Makes the previous element optional — it can appear once or not at all.'
      push(end, 'quantifier', 'Quantifier', lazy ? `${base} Lazy: matches as little as possible.` : base)
      continue
    }

    if (char === '{') {
      const match = /^\{\d+(?:,\d*)?\}/.exec(pattern.slice(index))
      if (match) {
        const lazy = pattern[index + match[0].length] === '?'
        const end = index + match[0].length + (lazy ? 1 : 0)
        const base = describeCount(match[0])
        push(end, 'quantifier', 'Quantifier', lazy ? `${base} Lazy: matches as little as possible.` : base)
        continue
      }
    }

    if (literalStart < 0) literalStart = index
    index += 1
  }

  flushLiteral()
  return tokens
}
