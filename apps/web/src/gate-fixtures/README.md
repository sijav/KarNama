# Gate fixtures

Two files that are supposed to fail, kept so the gate can be shown to fail
rather than only observed to pass.

`AGENTS.md` puts it this way: a tool that finds nothing has not proved anything.
When a check comes back clean, confirm it can find a case you plant by hand. The
problem with planting by hand is that nobody does it twice, so the proof expires
the day after it is written. These are that plant, committed.

- `unlocalized.tsx` renders a bare English sentence. `eslint-plugin-lingui` must
  reject it.
- `failing.test.ts` asserts something untrue. Vitest must report it as a failure
  rather than skip it.

They are excluded from the ordinary run in three places, and all three matter:
`eslint.config.js` ignores the directory so `npm run lint` stays clean,
`vitest.config.ts` excludes it from the unit project so `npm test` stays green,
and coverage excludes it so it cannot inflate the total.

`agent/scripts/verify/KN-003.mjs` runs the real tools against these two files and
requires each to fail for the right reason. If either of them ever passes, the
gate has stopped working and every green run since then meant nothing.
