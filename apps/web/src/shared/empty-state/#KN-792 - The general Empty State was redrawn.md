# KN-792 · The general Empty State was redrawn, from 297 to 319 high

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and an empty state is the first thing a new
reader sees.

**Exit**, from the board: the plan lists every difference between 159:80 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

The drawing is the same in both: 284 wide, a column on `color/bg/surface` with
`spacing/xl` round it and `spacing/sm` between its parts, the round mark of 64 in
`color/bg/surface-secondary`, the title at SemiBold 16 on its automatic line in
`color/text/primary`, the body at Regular 14 in `color/text/secondary`, 220
wide, an 8 high spacer, and Button / M, Primary, «افزودن فرصت شغلی». What
differs:

1. **The title's text**: «هنوز آگهی‌ای اضافه نکردی» in the copy, «هنوز فرصت
   شغلی‌ای اضافه نکردید» in the original, which honours the terminology rule
   itself and speaks in the plural.
2. **The body's text**: «اولین آگهی‌ات را با لینک یا متن آگهی اضافه کن تا از
   همین‌جا پیگیری‌اش کنی.» in the copy, «اولین فرصت شغلی رو با لینک یا متن آگهی
   اضافه کنید تا از همین‌جا پیگیریش کنید.» in the original.
3. **The height**, 297 in the copy and 319 in the original: the new body wraps to
   three lines, 66, where the old one took two, 44.

Nothing else: no variant, size, gap, colour or token changed. The original has
no instance of it at all. The board and the network page take their own,
Empty State / Jobs `894:79222` and Empty State / Network `1083:55307`, which
KN-769 builds, and the first says the same two sentences.

## The approach

The component takes its title and body from its caller, so nothing in it
changes. The Persian catalog takes the original's two sentences for the empty
job list, which the board and this component's stories draw, and the sign-in
e2e spec that reads them follows. DESIGN.md's section is rewritten for the
original, its old paragraph about the file calling the record «آگهی» kept as one
line of history. The stories, measured part by part, already hold the three line
body.

## How it is checked

The Empty State and Jobs screen stories in the storybook project, lint, tsc, the
catalog test, and a look at the job list's empty state in both languages.
