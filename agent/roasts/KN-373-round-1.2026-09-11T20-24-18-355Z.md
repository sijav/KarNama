1. At a row boundary, it does not move to the choice on that physical side. It advances by DOM order and wraps. In LTR, `ArrowRight` on the last chip of a line can land on the left edge of the next line; `ArrowLeft` on the first can jump to a later chip on a different line. A long custom status alone on a line behaves the same way. It cannot land to the wrong side within one unwrapped line, but wrapping makes its claimed screen-relative behavior false.

2. The handler does not interfere with the Dialog, form fields, or the add button: it acts only when `event.target` is one of the radios, and modified arrows are left native. A screen reader’s browse/virtual cursor is not a DOM radio keydown, so it is unaffected. The existing semantic problem remains: the add button is nested inside the radiogroup, which was already identified in the KN-020 roast.

Findings:

- critical — The implementation claims left and right always move toward the corresponding physical side, but `arrowsAcross` has no layout information. It chooses the preceding/following enabled radio in DOM order and modulo-wraps the entire list. A narrow add-form or modal layout with variable-width status names makes this visibly wrong at line boundaries; a left/right key can cross lines and land horizontally opposite its direction. This is exactly the wrapped, unequal-pill case the task needed to solve. [sides.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\sides.ts:25) [sides.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\sides.ts:39)

- major — The new stories prove only the second status has left and right neighbours with identical `top` coordinates. They never force wrapping, exercise a line edge, or include a long custom status, so the false screen-relative claim above remains green. The asserted completion condition is therefore inadequately tested. [StatusPicker.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.stories.tsx:141) [StatusPicker.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-picker\StatusPicker.stories.tsx:188)

I also attempted the focused browser-story run directly through Node. It could not start because the read-only sandbox prevents Vite from creating `apps/web/node_modules/.vite-temp`; that is an environment limitation, not a finding.

VERDICT
score: 4.0
criticals: 1
one-line: Make left and right account for wrapped visual rows, then test row edges and an isolated long custom status.