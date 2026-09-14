CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  attendance TEXT NOT NULL CHECK (attendance IN ('yes', 'no')),
  guests INTEGER NOT NULL DEFAULT 1,
  meal TEXT,
  message TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_attendance ON rsvps(attendance);
