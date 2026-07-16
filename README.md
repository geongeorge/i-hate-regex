<div align="center">

  <h1>
    iHateRegex 😈
  </h1>

  <p align="center">
    <a href="https://github.com/geongeorge/i-hate-regex/pull/new" target="_blank">
      <img src="https://img.shields.io/badge/PRs%20-welcome-brightgreen.svg" alt="PRs Welcome" />
    </a>
    <a title="Chat on Telegram" href="https://t.me/ihateregex"> <img src="https://img.shields.io/badge/chat-Telegram-blueviolet?logo=Telegram"/>
    </a>
  </p>
  <p>
<a href="https://opencollective.com/ihateregex" target="_blank">
<img src="https://opencollective.com/webpack/donate/button@2x.png?color=blue" width=180>
</a>
</p>
  <a href="https://ihateregex.io"><img src="https://i.imgur.com/mHuTAzy.png" width=600></a>

  <p>
    <strong>don't just use; understand.</strong>
</p>

  <p>
    <strong><a href="https://ihateregex.io">iHateRegex.io</a></strong> - a regex cheatsheet for the haters.
  </p>

  <p>
   Chat with us on <a href="https://t.me/ihateregex" target="_blank">Telegram</a>

</p>
</div>

> **v2** — iHateRegex has been rebuilt from the ground up on TypeScript, TanStack Start, and PostgreSQL. The original Nuxt version lives on the [`v1`](https://github.com/geongeorge/i-hate-regex/tree/v1) branch.

## Features 😎

- [x] Visual railroad diagrams of regular expressions — rendered in your browser, no embed server
- [x] Hover any part of an expression to see what it does, in plain English
- [x] Matched strings — the testing area with live highlighting
- [x] Export any diagram as SVG or PNG
- [x] Regex code highlighting and validation
- [x] Regex descriptions with markdown support
- [x] [Playground](https://ihateregex.io/playground) where you can create your own expressions
- [x] User accounts with private saved regexes
- [x] Publish your regexes to the community and share a stable link

## Repository layout

This is a pnpm monorepo:

```text
├── apps/
│   └── web/                         # TanStack Start app and PostgreSQL migrations
└── packages/
    └── regex-railroad-diagram/      # Browser-only TypeScript diagram renderer
```

## Setup 🚀

Requirements: [Node.js](https://nodejs.org) 22.12+, [pnpm](https://pnpm.io) 10+, and PostgreSQL.

```bash
# clone this repo, then:
pnpm install

# create the database and environment file
createdb ihateregex_next
cp apps/web/.env.example apps/web/.env.local
# set DATABASE_URL, BETTER_AUTH_URL, and a random 32+ character BETTER_AUTH_SECRET

pnpm db:migrate   # apply database migrations
pnpm dev          # serve at http://127.0.0.1:3000
```

Other commands:

```bash
pnpm build        # production build of both workspace packages
pnpm check        # type-check every workspace package
pnpm diagram:dev  # run the diagram renderer package demo
pnpm start        # run the production web server
```

## Contribute Regex 🙏

Contribute to this project and make this the largest collection of useful expressions 😍

1. Add your regex to `apps/web/src/content/regexes.json`

<details>
<summary>Show sample JSON</summary>

```json
{
    "id": "username",
    "title": "username",
    "tagline": "match a username",
    "description": "Alphanumeric string that may include _ and - having a length of 3 to 16 characters.",
    "regex": "^[a-z0-9_-]{3,15}$",
    "flag": "gm",
    "matchText": [
        "lorem",
        "ipsum",
        "gr3at",
        "john doe",
        "johnny"
    ],
    "tags": ["name", "slug"]
}
```

</details>

<details>
<summary>Show JSON properties</summary>

| Property | Definition |
|------|------------|
| id | The slug and short name of the regex. No spaces, only url-safe characters |
| title | Title of the page |
| tagline | Tagline shown under the title |
| description | First line under the tagline and also the meta description |
| regex | The actual regex string |
| flag | Regex flags associated with the expression, e.g. `gm` |
| matchText | Array (line by line) of strings shown in the testing area |
| tags | Tags related to the expression |

</details>

2. Create a markdown file in `apps/web/src/content/regex/` named `<regex-id>.md` with a longer description explaining how the expression works

That's it 🙌 Go ahead and shoot a new pull request✨✨

You can also publish expressions directly from the [playground](https://ihateregex.io/playground) — sign in, save, and hit publish to share a community page.

## Privacy and sharing

New saves belong to the signed-in user and are private. The owner can publish a regex to create a public `/community/:id` page, and unpublish it at any time. URLs contain only an opaque database ID — never your regex in a query string.

## Sponsors 💖

<p>
<a href="https://opencollective.com/ihateregex">Donate via Opencollective</a>
</p>

## Credits

- The railroad diagrams are rendered with [regexper](https://gitlab.com/javallone/regexper-static)
- The previous version of this site was built with [Nuxt.js](https://nuxtjs.org) — see the [`v1`](https://github.com/geongeorge/i-hate-regex/tree/v1) branch
