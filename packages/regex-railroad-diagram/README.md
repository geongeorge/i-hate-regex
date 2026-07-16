# @ihateregex/regex-railroad-diagram

A browser-only TypeScript package that draws regular expressions as railroad diagrams. It is framework-independent and does not require a server.

## Direct renderer

```ts
import { renderRegexDiagram } from '@ihateregex/regex-railroad-diagram'

const svg = document.querySelector('svg')!

await renderRegexDiagram(svg, {
  pattern: '^(hello|hi)$',
  flags: 'i',
})
```

## Web component

Importing the package in a browser also registers `<regex-diagram>`:

```ts
import '@ihateregex/regex-railroad-diagram'
```

```html
<regex-diagram
  pattern="^(hello|hi)\\s+world$"
  flags="i"
></regex-diagram>
```

Use `pnpm build` to emit the ESM bundle and TypeScript declarations, or `pnpm dev` to run the standalone package demo.
