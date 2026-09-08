-- A user may rename any status, including the five the design ships with, so the
-- NAME is not stable enough to identify "the first stage". The `key` is, and
-- nothing stopped a user ending up with two statuses keyed `new`, which would
-- make "where does a new record go" ambiguous.
--
-- A PARTIAL unique index rather than a plain one: `key` is null for every status
-- the user created, and a plain unique index would allow only one of those per
-- user, which is the opposite of the rule.
CREATE UNIQUE INDEX "statuses_userId_key_unique_when_present"
  ON "statuses" ("userId", "key")
  WHERE "key" IS NOT NULL;
