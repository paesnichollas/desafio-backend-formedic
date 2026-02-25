CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id text NOT NULL,
  patient_id text NOT NULL,
  start_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT appointments_professional_start_at_unique UNIQUE (professional_id, start_at)
);

CREATE INDEX IF NOT EXISTS appointments_start_at_idx ON appointments (start_at);
