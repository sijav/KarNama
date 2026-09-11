# KN-311 · An Icon Button's required name is proved on a helper, not on the rendered button, and a blank one throws during render

Beside the Icon Button. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** Rendering an Icon Button with an empty or
blank aria-label fails in a way a test observes at the component, and the
failure is contained to the button rather than the screen, or the type and a
lint rule refuse it before it renders; a story or test renders the case.

## What was done

- The contained path, since a type cannot refuse a blank string that arrives at
  run time. `nameOf` returns null for a blank name instead of throwing, and the
  Icon Button then renders nothing and reports the mistake with
  `console.error` from an effect, as the Tooltip reports its own misuse. A
  throw during render had reached the nearest error boundary, which today is
  none, so one blank name would have blanked the screen.
- BlankName renders a blank-named button beside a named one, with the console
  watched from a story `beforeEach`, since the report comes as the button
  mounts: one button renders, the named one, and the console carries the
  report. It failed on the throwing code.
- In development the report shows twice, since StrictMode runs effects twice.
