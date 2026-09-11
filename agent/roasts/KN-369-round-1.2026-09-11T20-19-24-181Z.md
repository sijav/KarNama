1. Yes. The addon’s `configureVitest` receives the global Vitest instance, not the project being iterated, so its `context.vitest.config.browser.enabled` test is root-scoped. With browser enabled only in the Storybook project, it does not inject its browser setup. The repository-owned reset is necessary.

Manually adding `@storybook/addon-vitest/internal/setup-file.browser.4` would work today, but is not better: it imports a version-specific internal entry point and couples the config to both Storybook’s internal filename and Vitest-major selection. The local three-line command is explicit and properly documented by TECH-DEBT 19.

2. Moving Playwright’s mouse to `(-1000, -1000)` clears hover in the current browser page, including the iframe hosting that test. It is not a magic global reset across parallel browser pages, but parallel workers have separate page pointer state; another worker cannot remain hovered because this worker moved its mouse. The reset runs before every story in every worker, so the relevant guarantee holds.

Correcting the existing card rather than filing a new one is right, because the same task uncovered a false premise. But the card itself was not actually corrected.

Findings:

- **major** — KN-369’s durable board record still states the false premise it discovered: its title says the park “repeats Storybook’s own reset,” its description says that reset was “confirmed,” and its rationale calls it a “second reset.” The completed work establishes the opposite, namely that the addon setup file is absent and the local reset is the only one. A later reader can reasonably delete `parkPointer` based on this false card, despite TECH-DEBT 19 being accurate. Rewrite the title, `desc`, and `why` to describe the real issue: `(0,0)` was unsafe and the repository needs its own off-page reset because the addon reset is not injected. [agent/board.json:9646](D:/Kar/Gandom/KarNama/agent/board.json:9646) [agent/board.json:9647](D:/Kar/Gandom/KarNama/agent/board.json:9647) [agent/board.json:9648](D:/Kar/Gandom/KarNama/agent/board.json:9648)

- **minor** — The new config comment is documentation prose duplicated from TECH-DEBT 19, not a short code comment. It violates the repository rule that documentation belongs in Markdown. Keep a short implementation comment, such as “Reset the current browser-page pointer before each story,” and leave the rationale and retirement condition in TECH-DEBT. [vitest.config.ts:9](D:/Kar/Gandom/KarNama/apps/web/vitest.config.ts:9) [vitest.setup.ts:27](D:/Kar/Gandom/KarNama/apps/web/.storybook/vitest.setup.ts:27)

`node agent/scripts/todo.mjs validate` passes.

VERDICT
score: 7.5
criticals: 0
one-line: Correct KN-369’s title, description, and rationale, which still falsely claim Storybook’s reset runs here.