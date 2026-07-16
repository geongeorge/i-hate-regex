# iHateRegex

A TypeScript rebuild of [iHateRegex](https://ihateregex.io) on TanStack Start. The repository is a pnpm monorepo containing the web application and its browser-only railroad diagram renderer.

## Workspace layout

```text
i-hate-regex-next/
├── apps/
│   └── web/                         # TanStack Start app and PostgreSQL migrations
├── packages/
│   └── regex-railroad-diagram/      # Browser-only TypeScript renderer
├── package.json                     # Workspace commands
└── pnpm-workspace.yaml
```

The web app imports `@ihateregex/regex-railroad-diagram` through pnpm's `workspace:*` protocol. The renderer has no server, iframe, Express application, or external repository dependency.

## What is included

- The original 29-pattern library with read-only detail pages
- A live regex playground with match highlighting, flags, test text, and Markdown notes
- Client-side railroad diagrams rendered by the local workspace package
- Email/password accounts and PostgreSQL-backed sessions with Better Auth
- Private-by-default saved regexes under `/me`
- Explicit publish and unpublish controls for community sharing
- Public, read-only community pages with stable database IDs
- Terminal-inspired light and dark themes

## Local setup

Requirements:

- Node.js 22.12 or newer
- pnpm 10.13 or newer
- PostgreSQL

Create the database and environment file:

```bash
createdb ihateregex_next
cp apps/web/.env.example apps/web/.env.local
```

Set `DATABASE_URL`, `BETTER_AUTH_URL`, and a random `BETTER_AUTH_SECRET` of at least 32 characters in `apps/web/.env.local`. Then install, migrate, and start from the repository root:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Commands

```bash
pnpm dev          # build the renderer and start TanStack Start
pnpm build        # build both workspace packages
pnpm check        # type-check every workspace package
pnpm db:migrate   # apply PostgreSQL migrations
pnpm diagram:dev  # run the renderer package demo
pnpm start        # run the production web server
```

## Privacy and sharing

New saves belong to the signed-in user and are private. The owner can publish a document to create a public `/community/:id` page, then unpublish it at any time. Owner editing stays at `/r/:id`; other users cannot read or mutate that route. Original library entries and community pages never expose editing controls.

Regex documents store the expression, flags, test text, Markdown notes, ownership, visibility, and timestamps in PostgreSQL. URLs contain only an opaque database ID.

Database migrations live in `apps/web/db/migrations` and are tracked in `schema_migrations`.
