# iHateRegex Next

A TypeScript rebuild of [iHateRegex](https://ihateregex.io) on TanStack Start, backed by PostgreSQL and a separate browser-only regex visualization package.

## What is included

- The original 29-pattern library with strict read-only detail pages
- A live regex playground with match highlighting, flags, test text, and Markdown notes
- Compact terminal-inspired light and dark themes with Phosphor icons
- Client-side railroad diagrams from the sibling `RegViz-embed-server` package—no render server or iframe
- Email/password accounts and PostgreSQL-backed sessions with Better Auth
- Private-by-default saved regexes under `/me`
- Explicit publish and unpublish controls for community sharing
- Public, read-only community pages with stable database IDs instead of encoded URL state
- Remixing any library or community regex into a fresh private playground draft

## Repository layout

Keep both repositories beside each other:

```text
~/work/
├── i-hate-regex-next/       # TanStack Start web app
└── RegViz-embed-server/     # framework-free TypeScript embed package
```

The web app links `@ihateregex/embed` from `../RegViz-embed-server`. Its `predev` and `prebuild` scripts rebuild that package automatically.

## Local setup

Requirements:

- Node.js 22.12 or newer
- PostgreSQL

Create the database and environment file:

```bash
createdb ihateregex_next
cp .env.example .env.local
```

Set `DATABASE_URL`, `BETTER_AUTH_URL`, and a random `BETTER_AUTH_SECRET` of at least 32 characters in `.env.local`. Then install, migrate, and start:

```bash
npm --prefix ../RegViz-embed-server install
npm install
npm run db:migrate
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Privacy and sharing model

New saves belong to the signed-in user and are private. The owner can publish a document to create a public `/community/:id` page, then unpublish it at any time. Owner editing stays at `/r/:id`; other users cannot read or mutate that route. Original library entries and community pages never expose editing controls.

Regex documents store the expression, flags, test text, Markdown notes, ownership, visibility, and timestamps in PostgreSQL. URLs contain only an opaque database ID.

## Key routes

- `/` — searchable regex library
- `/playground` — new workspace
- `/expr/:id` — canonical read-only library entry, matching the original production URL structure
- `/library/:id` — permanent compatibility redirect to `/expr/:id`
- `/auth` — sign up or log in
- `/me` — signed-in user's private and public regexes
- `/r/:id` — owner-only editor
- `/community` — public community gallery
- `/community/:id` — read-only public regex page
- `/cheatsheet` — regex syntax reference

## Commands

```bash
npm run dev          # rebuild embed package and start development
npm run build        # rebuild embed package, production-build, and type-check
npm run embed:build  # build only the standalone visualization package
npm run db:migrate   # apply pending PostgreSQL migrations
npm start            # run the production server
```

Database migrations live in `db/migrations` and are tracked in `schema_migrations`.
