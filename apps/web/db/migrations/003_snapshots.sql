CREATE TABLE IF NOT EXISTS regex_snapshots (
  id text PRIMARY KEY,
  title text NOT NULL,
  pattern text NOT NULL,
  flags text NOT NULL DEFAULT '',
  test_text text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
