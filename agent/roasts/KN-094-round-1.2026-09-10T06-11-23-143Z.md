1. Yes. `^(props|stories)$` is still a global value exemption. `aria-label="stories"` and `title="props"` pass the rule just as the removed shape exemptions did. It is intended for parser comparisons, but `ignore` has no location scope. [apps/web/eslint.config.js:49](D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:49)

2. Yes, clean workspace lint proves only that no inspected bare literal required the removed regex. It cannot prove token names never reach visible labels: the Foundations story already renders token keys obtained through `Object.entries`, which the rule cannot trace. With `useTsTypes`, literals contextually typed as string-literal unions are also deliberately skipped by the plugin. [Tokens.stories.tsx:26](D:/Kar/Gandom/KarNama/apps/web/src/theme/Tokens.stories.tsx:26) [no-unlocalized-strings.js:526](D:/Kar/Gandom/KarNama/node_modules/eslint-plugin-lingui/lib/rules/no-unlocalized-strings.js:526)

3. A forced termination can leave either mutation behind. Kill the process after the config write and before `finally`, and the global exemption remains restored; ordinary lint still passes because fixtures are ignored. Kill it after the rename and the committed fixture remains `.hidden`. A later KN-094 run detects either condition, and a clean-worktree check would detect it before closure, but neither restores the repository automatically.

Findings:

- major — The remaining `^(props|stories)$` global exemption repeats the exact scope bug KN-094 was meant to eliminate. A user-facing accessible name such as `<button aria-label="stories" />` or a tooltip title of `"props"` is silently exempted because the rule matches values globally, despite the comment claiming the parser use is “named rather than shape-matched.” Scope this exception to the parser call/property that needs it, or remove it. [apps/web/eslint.config.js:49](D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:49)

- major — KN-094’s verifier mutates tracked source and renames a tracked fixture without crash-safe recovery. `try/finally` does not execute after process termination. The failure state can reopen the lint hole while ordinary lint remains green, since `src/gate-fixtures/**` is excluded from it. Use a non-mutating verification strategy, or add durable recovery/lock handling and a preflight detector. [KN-094.mjs:84](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-094.mjs:84) [KN-094.mjs:129](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-094.mjs:129) [eslint.config.js:123](D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:123)

VERDICT
score: 5.0
criticals: 0
one-line: Remove or properly scope the remaining global `^(props|stories)$` value exemption.