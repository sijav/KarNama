1. Yes. Disabling Controls hides the panel but does not prevent URL-supplied args from reaching `SeededName` or `AllStatuses`; their `render` functions still discard them. That is acceptable under the repository’s fixed-matrix convention because no Controls UI claims they work. The Docs page’s `<Primary />` resolves to the first, `Default`, story, whose args are rendered directly, so its Controls block is not showing a fixed story’s controls. [StatusChip.stories.tsx:62](D:/Kar/Gandom/KarNama/apps/web/src/shared/status-chip/StatusChip.stories.tsx:62) [DocsPage.tsx:35](D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/DocsPage.tsx:35)

2. `FromArgs` covers all three available component controls: label via `getByText(args.label)`, size via height 28, and status via the custom-2 container colour. It does not test arbitrary live Control interactions, but combined with `Default: {}` it adequately proves Storybook’s standard args-to-component rendering path.

Findings:

- major — The new verifier violates the repository’s explicit no-shell rule and adds undocumented shell execution debt. `spawnSync` is given a command string with `shell: true`; use Node to invoke Vitest’s entrypoint with an argument array instead. [KN-239.mjs:33](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-239.mjs:33)

I could not obtain a green live verifier run in this read-only environment: its mutation intentionally edits the story file, and both Vite’s temporary-config write and that mutation are denied. That is a sandbox limitation, not a finding against the work.

VERDICT
score: 8.4
criticals: 0
one-line: Remove the newly introduced shell-based verifier invocation.