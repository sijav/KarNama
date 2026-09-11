1. Real slices are:
   - Colour semantic: `DESIGN.md:48-95`, including the `#### Not on the Foundations board` table at lines 80-90.
   - Colour status: `97-126`.
   - Spacing, radius, icon size: `128-134`.
   - Elevation: `136-179`.
   - Type: `181-205`.

   A renamed semantic, status, spacing, or type heading fails indirectly because a positive checked name disappears. Renaming `### Elevation` does not fail: elevation’s keys are identifiers, so the quoted-key guard never consumes its extracted names. A duplicate or fenced fake heading before the real one wins because the parser uses `indexOf`; a later component-note occurrence does not affect today’s document only because the real heading occurs first.

2. The status table’s `base` and `container` are documented as second-column headings, but they are identifier keys and bypass this quoted-key guard. Likewise elevation uses identifier keys (`card`, `modal`, etc.), while its table names `Elevation/Card` and `Elevation/Modal`. The spacing/radius/icon names come from the fenced block, and the five type roles from first-column cells. There is no quoted key in `tokens.ts` whose documentation is outside the five subsections: all quoted semantic, custom-status, spacing, and type keys are covered. `black/base` is documented in the semantic subsection but is not a `tokens.ts` key.

Findings:

- major — A fake or duplicate token heading inside a fenced example before the real heading makes the guard parse the fence as a token subsection and authorize its table row. For example, prepending a fenced block containing `### Colour, semantic` and `| \`delete/application\` | note |` causes `indexOf` to select that occurrence, and the table regex admits the key. This is exactly the heading-in-fence case the implementation does not distinguish. [tokens.test.ts:138-154](D:\Kar\Gandom\KarNama\apps\web\src\theme\tokens.test.ts:138)

- minor — Renaming `### Elevation` silently removes that subsection from `namesIn` without failing the suite. The positive controls exercise semantic, status, type, and spacing only, while `elevation`’s unquoted identifier keys are outside `copyIn`’s check. The claimed five-subsection contract is therefore not enforced for Elevation. [tokens.test.ts:138-160](D:\Kar\Gandom\KarNama\apps\web\src\theme\tokens.test.ts:138) [tokens.test.ts:192-225](D:\Kar\Gandom\KarNama\apps\web\src\theme\tokens.test.ts:192)

`node agent/scripts/todo.mjs validate` passed. The targeted Vitest run could not start because this read-only sandbox denies Vitest’s temporary SSR directory creation (`EPERM`), so it provided no test result.

VERDICT
score: 6.5
criticals: 0
one-line: Parse real Markdown headings rather than using indexOf, and require each of the five headings exactly once.