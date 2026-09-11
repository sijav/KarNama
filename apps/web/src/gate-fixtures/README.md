# Gate fixtures

Files that are supposed to fail, kept so the gate can be shown to fail rather
than only observed to pass.

`AGENTS.md` puts it this way: a tool that finds nothing has not proved anything.
When a check comes back clean, confirm it can find a case you plant by hand. The
problem with planting by hand is that nobody does it twice, so the proof expires
the day after it is written. These are that plant, committed.

- `failing.gate.ts` asserts something untrue. Vitest must report it as a failure
  rather than skip it.
- `unlocalized.tsx` renders a bare English sentence. `eslint-plugin-lingui` must
  reject it.

The rest are one hole each in the lingui rule, and they exist because each hole
was real and shipped:

- `unlocalized-aria.tsx` — a bare `aria-label`. The rule exempted every `aria-*`
  prop by NAME, so the one string a screen reader actually speaks went
  untranslated and no sighted reviewer would ever have seen it.
- `unlocalized-title.tsx` — a bare `title`. Exempted by NAME as well, to let a
  Storybook story path through.
- `unlocalized-pathlike.tsx` — `New/Applied`. The name-based exemption was
  replaced by a SHAPE, capitalised segments separated by slashes, and
  status-transition copy has that shape.
- `unlocalized-tokenlike.tsx` — `delete/application`. The same mistake in lower
  case, added so a token name rendered as a label, `bg/page`, would pass.
- `unlocalized-setattribute.tsx` — an `aria-label` assigned through
  `setAttribute`, which reached the same untranslated accessible name through a
  method call instead of a prop.
- `unlocalized-story-title.stories.tsx` — a JSX `title` inside a STORY, beside a
  meta title that must still pass. The stories block exempted the name `title`
  so a meta could carry its sidebar path, and ESLint matches a name wherever it
  appears. A meta title is exempt by TYPE now, through `StoryMeta`. Named
  `.stories.tsx` so any stories-only block added later applies to it, and
  excluded from Storybook in `.storybook/main.ts` so it is linted, never
  indexed.

- `unlocalized-word-delete.tsx`, `-save`, `-interview` and `-delete-status` —
  'Delete', 'Save', «مصاحبه» and «حذف وضعیت», each as an `aria-label`, a
  `title` and text. The rule compiles every ignore entry with `new
RegExp(entry)` and no flags, so the no-letter entry `^[^\p{L}]*$` meant "no
  p, {, L or }": every string without one of those four passed, all the Persian
  and most of the English, and every fixture above passed only because it had
  a p, KN-214. The entry is written with `\s` and `\uXXXX` now, which mean the
  same with no flags. The fixtures above have no letter child any more, so each
  fails on the string under test alone.

Five of those six are one exemption written for one legitimate case that
quietly covered every case. That is the pattern to watch: an exemption is a
hole, and the fix is always to narrow WHERE it applies rather than to make the
pattern cleverer.

They are excluded from the ordinary run in three places, and all three matter:
`eslint.config.js` ignores the directory so `npm run lint` stays clean,
`vitest.config.ts` excludes it from the unit project so `npm test` stays green,
and coverage excludes it so it cannot inflate the total.

`agent/scripts/verify/KN-003.mjs` runs the real tools against these files and
requires each to fail for the right reason. It both DISCOVERS every
`unlocalized-*.tsx` and requires the known ones BY NAME: discovery alone let one
be deleted and replaced by another, which kept the count up while the hole
reopened. If any of them ever passes, the gate has stopped working and every
green run since then meant nothing.
