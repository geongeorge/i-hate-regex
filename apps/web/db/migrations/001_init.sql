CREATE TABLE IF NOT EXISTS regex_documents (
  id varchar(16) PRIMARY KEY,
  title varchar(120) NOT NULL,
  pattern text NOT NULL,
  flags varchar(12) NOT NULL DEFAULT 'gm',
  test_text text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS regex_documents_updated_at_idx
  ON regex_documents (updated_at DESC);
