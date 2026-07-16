CREATE TABLE IF NOT EXISTS "user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session (
  id text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS user_email_uidx ON "user" (email);
CREATE UNIQUE INDEX IF NOT EXISTS session_token_uidx ON session (token);
CREATE INDEX IF NOT EXISTS session_user_id_idx ON session ("userId");
CREATE INDEX IF NOT EXISTS account_user_id_idx ON account ("userId");

ALTER TABLE regex_documents
  ADD COLUMN IF NOT EXISTS user_id text REFERENCES "user" (id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

CREATE INDEX IF NOT EXISTS regex_documents_user_id_idx
  ON regex_documents (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS regex_documents_public_idx
  ON regex_documents (published_at DESC)
  WHERE is_public = true;
