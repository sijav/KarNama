CREATE TABLE auth_challenges (
  phone TEXT PRIMARY KEY,
  hash TEXT NOT NULL,
  sent TIMESTAMPTZ(3) NOT NULL,
  expires TIMESTAMPTZ(3) NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE auth_sessions (
  hash TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  expires TIMESTAMPTZ(3) NOT NULL
);
CREATE INDEX "auth_sessions_userId_idx" ON auth_sessions("userId");
CREATE INDEX auth_sessions_expires_idx ON auth_sessions(expires);
CREATE TABLE auth_limits (
  key TEXT PRIMARY KEY,
  started TIMESTAMPTZ(3) NOT NULL,
  count INTEGER NOT NULL
);
