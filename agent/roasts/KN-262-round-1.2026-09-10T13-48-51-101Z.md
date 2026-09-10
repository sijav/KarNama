1. No. A zero-test Vitest exit is rejected by the `ran` check. The control mutation proves the spread story inherits and runs `FromArgs.play`; otherwise it would pass. The widened rule intentionally clears Input’s error, and the old-copy control then requires `x7` while Input exposes the helper, so it must fail.

2. A normal exception is restored by `finally`. A hard interruption can leave the probe export behind. The story-docs guard catches it as undocumented; KN-247’s static controls check misses inherited `play`, though its runtime sweep sees the inherited play and controls.

Findings:

- minor: A non-catchable interruption can leave modified product files, including the undocumented probe story, in the worktree. Cleanup exists only in `finally`; a kill, crash, or forced termination bypasses it. A later docs-guard run notices, but Git can still stage/commit it before that. [KN-262.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-262.mjs:66)

I ran the verifier, but this read-only sandbox blocks its intentional writes and Vite temp-file creation (`EPERM`), so I could not independently execute its mutation phases.

VERDICT
score: 9.0
criticals: 0
one-line: make the temporary-story mutation recoverable after hard interruption, or add an explicit stale-probe preflight check