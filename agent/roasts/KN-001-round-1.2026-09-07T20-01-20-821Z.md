1. No. The done gate is bypassable.

- `npm run todo -- set KN-001 --status done` writes `status: "done"` without executing `move`’s roast checks. `set` accepts every required field, including `status`, and validation only checks that a done task’s parents are settled. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:426)
- `add --status done` also creates a completed task with no roast.
- Even the intended `roast` then `move done` route can be forged: `npm run todo -- roast KN-001 --score 9.5 --criticals -1` records a passing round with no archive, then `move KN-001 done` accepts it. Negative critical counts are not rejected, `--file` is not required or checked for existence, and the stored numbers are arbitrary claims. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:442)

2. A valid acyclic dependency graph cannot deadlock solely through parent edges if all roots remain in a pickable status. But liveness is still not guaranteed: a critical root task in `blocked` and a critical backlog child depending on it passes validation, yet `next` returns nothing while that child remains open. `blocked` is excluded from candidates and has no required cause, owner-action record, or escalation path. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:30) [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:187)  
A high-severity root left `in_progress` also outranks an unblocked critical backlog task indefinitely, because status rank is evaluated before severity. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:201)

3. The likely false completion is: the agent says it ran the task-specific exit checks and visually verified the result, self-records `9.5/0`, then marks it done. Step 1 requires reality checks in prose, but `todo.mjs` does not record or verify any task’s exit condition, test output, browser verification, roast archive, or adjudication. Worse, `set --status done` bypasses even the weak roast gate. [RALPH.md](D:/Kar/Gandom/KarNama/agent/RALPH.md:50) [RALPH.md](D:/Kar/Gandom/KarNama/agent/RALPH.md:160) [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:426)

4. Concrete silent corruption:

```powershell
npm run todo -- set KN-002 --parent --note "investigate later"
```

`parseArgs` stores `parent: true` because the next token begins `--`; `asList(true)` becomes `[]`; `set` clears KN-002’s `KN-001` dependency and saves successfully. It does not report a missing value. KN-002 can then be selected before KN-001 is settled. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:69) [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:84) [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:430)

Findings:

- **Critical:** Completion can be written through `set` or `add` without any roast gate. The claimed “unbypassable” property is false. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:426)
- **Critical:** The official roast path accepts fabricated scores, negative criticals, and nonexistent archive files. A task can pass `move done` without Codex ever running. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:446)
- **Major:** `blocked` can make all open work permanently unpickable on a valid board, with no required explanation or resolution mechanism. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:208)
- **Major:** A missing flag value can silently clear dependency parents, changing scheduling rather than failing. [todo.mjs](D:/Kar/Gandom/KarNama/agent/scripts/todo.mjs:85)

VERDICT
score: 3.5
criticals: 2
one-line: Make status transitions private to `move`, validate finite non-negative roast data and a real archive, and reject value-taking flags with no value.