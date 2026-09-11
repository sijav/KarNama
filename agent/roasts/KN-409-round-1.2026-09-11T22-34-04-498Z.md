1. Regex walk: it currently takes 47 rows, from these five tables:

- Colour semantic, lines 51–72
- “Not on the Foundations board”, lines 82–90
- Status, lines 103–111
- Elevation, lines 144–145
- Type, lines 191–195

It rejects headers and separator rows because they are not exactly one code span. A leading space prevents a match entirely. An escaped pipe inside a code span terminates the first-cell match early, so it is rejected. There is currently no table in the remainder of section 1 whose first column is not a token/style name, and no component-notes table there.

But any future table-shaped line beginning exactly ``| `name` |`` anywhere in section 1, including a component-note table or fenced example, becomes an allowed key. The regex does not identify a token table.

2. A legitimate new quoted key is accepted once its design documentation is added first: statuses and type roles need an exact code span in their table; spacing/radius/icon names need to be words in the fenced block. If code comes first, the test reports `key <name>` and the developer must update the appropriate token documentation.

Unquoted identifier keys are not checked at all. Thus `status.pending`, `type.caption`, or `spacing.xxl` can be added without documentation; quoted keys such as `'custom-5'` or `'body/small'` are guarded.

Findings:

- **critical** — [tokens.test.ts:135-138](D:\Kar\Gandom\KarNama\apps\web\src\theme\tokens.test.ts:135) still builds the allowlist from every first Markdown-table cell in all of section 1, not from identified token tables. Add a component note such as:

  ```md
  | `delete/application` | Avoid this identifier |
  ```

  anywhere before `## 2.` and the guard accepts `'delete/application'` as a token key. That repeats the task’s central failure through tables rather than inline prose. The existing negative test only proves four current prose spans are excluded; it does not plant or reject a non-token table row.

`node agent/scripts/todo.mjs validate` succeeds. The focused Vitest command could not start because the read-only sandbox prevents Vite from creating its temporary config file.

VERDICT
score: 5.0
criticals: 1
one-line: Restrict extraction to explicitly identified token tables and add a mutation test proving a component-note table row cannot authorize a key