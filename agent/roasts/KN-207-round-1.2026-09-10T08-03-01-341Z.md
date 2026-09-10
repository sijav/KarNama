1. Meta-only is insufficient. Every current Checkbox story inherits the meta `fn()`, but a story can override `onChange` in its own `args` or `render` with an ordinary handler; the guard still passes and that story’s Actions panel records nothing. Conversely, a legitimate suite that puts `fn()` per story but not meta fails. It also accepts any local function named `fn`, not necessarily Storybook’s action spy.

2. Tooltip’s actual Controls table omits `children`. The configured Storybook parser uses its default, while the guard alone sets `skipChildrenPropWithoutDoc: false`. I confirmed default docgen returns `title, icon`; with the guard option it returns `title, icon, children`. This is a visible Docs regression.

3. Removing per-prop JSDoc is correct under AGENTS.md. It explicitly prohibits component-user documentation prose in `.tsx`, not merely duplicated prose. Editor readers must use the story-docs markdown; only brief implementation comments belong beside code.

Findings:

- major — [guard.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\guard.test.ts:126) only inspects meta-level `args`, so it does not enforce the stated outcome for individual stories. For example, a later story can use `args: { onChange: () => {} }` or a custom `render` that replaces `args.onChange`; the meta spy satisfies this guard, but interaction in that story is absent from Actions. The test also rejects a valid per-story-spy pattern when meta has no spy. Inspect resolved args/render per exported story, or explicitly scope the rule to “the shared meta must provide a default spy” and add a separate guard for overrides.

- major — [main.ts](D:\Kar\Gandom\KarNama\apps\web\.storybook\main.ts:15) does not configure `skipChildrenPropWithoutDoc: false`, unlike the guard at [guard.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\guard.test.ts:153). After removing Tooltip’s JSDoc, Storybook Controls hides `children`, while the localized markdown still documents it. Configure Storybook’s actual docgen options identically and add a rendered Docs/argTypes regression test.

VERDICT
score: 5.0
criticals: 0
one-line: Make Storybook’s docgen configuration match the guard, then validate callback spies against each story’s resolved args/render rather than meta alone