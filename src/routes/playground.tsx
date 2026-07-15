import { createFileRoute } from '@tanstack/react-router'
import { RegexWorkbench } from '~/components/RegexWorkbench'

export const Route = createFileRoute('/playground')({ component: Playground })

const starter = {
  title: 'Untitled regex',
  pattern: '^(?<name>[a-z0-9_-]{3,16})$',
  flags: 'gmi',
  testText: ['dev_user', 'regex-fan', 'no spaces', 'ab'].join('\n'),
  notes: '## What it matches\n\nA username containing letters, numbers, underscores, or hyphens.\n\n### Constraints\n\n- Between **3 and 16** characters\n- Anchored to the start and end of each line\n- Case-insensitive',
}

function Playground() {
  return <RegexWorkbench initialDraft={starter} />
}
