# KN-369 · KN-260's pointer park repeats Storybook's own reset, and parks at (0,0), inside an open modal

Beside the Vitest setup. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, as the board had it.** parkPointer and its command are gone,
the suite relies on Storybook's resetMousePosition, DESIGN or TECH-DEBT says so
where the next person would look, and the Input's pair of stories is kept only
if it asserts something the reset decides.

**As corrected, once the premise was checked.** The suite's pointer park moves
the pointer off the page, not to its corner, and says why it exists; whether
Storybook's own resetMousePosition runs in this repository is established from
the resolved Vitest config, and TECH-DEBT says what retires the park; a whole
storybook run passes but for KN-365's flakes.

## What happened

- Done as written first: parkPointer removed. The Input stories passed alone,
  and a do-nothing `resetMousePosition` in `vitest.config.ts` changed nothing,
  which proved nothing: the plugin's config hook merges its own command over
  ours. The whole storybook project then failed the Contact Card's Full Hover
  and Full Tab Order, each finding the card hovered as it began.
- The plugin's source said why. `configureVitest` adds the setup file that
  calls the reset only when `context.vitest.config.browser.enabled`, the root
  config; this repository enables the browser in the storybook project alone.
  `createVitest` resolved that project with `.storybook/vitest.setup.ts` as its
  only setup file. The reset the KN-260 roast pointed to never ran here, so the
  card's premise, and the correction it led me to write on KN-365, were wrong.
- So the park stays, moved to (-1000, -1000), off the page like the plugin's,
  since the corner lay on the backdrop of a story that opens a modal at once.
  Its comments say why it exists, TECH-DEBT 19 says what retires it, and a whole
  run passes 263 of 264, the one failure JobCard Pressed, KN-365's flake.
- The Input's pair stays: it is the alarm for the park, and the removal showed
  the park matters. KN-365's note is corrected.
