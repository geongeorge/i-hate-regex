import fs from 'node:fs/promises'
import path from 'node:path'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

const client = new pg.Client({ connectionString })
await client.connect()

const migrationsDir = path.resolve('db/migrations')
const files = (await fs.readdir(migrationsDir))
  .filter((file) => file.endsWith('.sql'))
  .sort()

await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`)

for (const file of files) {
  const exists = await client.query(
    'SELECT 1 FROM schema_migrations WHERE name = $1',
    [file],
  )

  if (exists.rowCount) continue

  const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8')
  await client.query('BEGIN')
  try {
    await client.query(sql)
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
    await client.query('COMMIT')
    console.log(`applied ${file}`)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}

await client.end()
