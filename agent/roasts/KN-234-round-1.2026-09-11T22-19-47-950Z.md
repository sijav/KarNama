1. `documentedNames` is not a token-name list. It accepts every backticked, shape-compatible fragment in all of Tokens, including component-design prose through line 840. A future backticked word such as `currentColor` becomes an allowed key as `currentcolor`, despite not being a token. Persian labels and hex values are filtered out by the ASCII key shape. The set is not used for values, so it cannot admit copy as a value. Legitimate quoted keys are refused if their documentation moves outside section 1, stops being a standalone code span, or uses a character outside the imposed shape.

2. Yes, the walker ignores identifier and numeric keys entirely. `semantic = { deleteApplication: '#2563eb' }` and `semantic = { 1: '#2563eb' }` bypass this guard; computed string keys are treated as values and rejected unless they happen to be design values. It also never inspects `darkMode.ts` or `theme.ts`. Today, adding such a key to an existing rendered export is caught by other contract tests, for example semantic entries must have a DESIGN table row. A new export is unprotected, and it becomes visible if a future Foundations renderer enumerates it.

Findings:

- critical — KN-234 is marked done while its third explicit exit-condition clause remains unimplemented. `KN-227.mjs` still treats every nonzero `npm run lint` result as proof that TECH-DEBT 13 stands, without first requiring a clean baseline or attributing diagnostics to `tokens.ts`, `STORAGE_KEY`, and `TOOLTIP_SURFACE`. An unrelated lint error therefore makes the verifier falsely preserve the debt. Splitting it into backlog KN-406 does not satisfy KN-234’s stated completion condition. [KN-227.mjs:82-97](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-227.mjs:82) [board.json:6527](D:/Kar/Gandom/KarNama/agent/board.json:6527)

- major — The purported DESIGN-derived allowlist is still a shape-based exemption in disguise. It harvests every inline code span in the entire section, not a defined token-name grammar or the token tables. `Elevation/Card` is accepted as `elevation/card`; code-marked component details later in the same section likewise become keys. A prose edit can therefore authorize an unrelated token-shaped key, exactly the category this task was meant to eliminate. [tokens.test.ts:130-135](D:/Kar/Gandom/KarNama/apps/web/src/theme/tokens.test.ts:130) [DESIGN.md:144](D:/Kar/Gandom/KarNama/DESIGN.md:144) [DESIGN.md:841](D:/Kar/Gandom/KarNama/DESIGN.md:841)

`node agent/scripts/todo.mjs validate` passed. I could not run the mutation verifier in this read-only sandbox because it writes to `tokens.ts` and ESLint config.

VERDICT
score: 3.0
criticals: 1
one-line: Implement KN-406’s baseline-and-attributed-diagnostics retirement check before claiming KN-234 is done.