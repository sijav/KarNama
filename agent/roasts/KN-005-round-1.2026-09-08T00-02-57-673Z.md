1. Magic numbers: the derivation produces several bad semantic results. On dark surface `#2e2e2e`, normal text contrast is:

- `text/secondary`: 3.71:1
- `text/brand`: 2.62:1
- `text/error`: 3.38:1
- `text/disabled`: 1.87:1

`text/on-accent` becomes black; against derived brand default it is only 4.34:1. No new accidental exact duplicates occur among the 20 semantic values, aside from intentional source duplicates (`border/default`/`gray/200`, `text/brand`/brand hover). The `.2` cutoff also classifies `bg/page` exactly on its boundary, contrary to the claim that no real token is near it.

2. Status chips fail badly. Only `new` retains adequate contrast, 7.35:1. The other eight are effectively unreadable:

| Status | Dark contrast |
|---|---:|
| applied | 1.24:1 |
| interview | 1.51:1 |
| rejected | 1.01:1 |
| offer | 1.09:1 |
| custom-1 | 1.11:1 |
| custom-2 | 1.07:1 |
| custom-3 | 1.04:1 |
| custom-4 | 1.11:1 |

They are generally light/saturated text on similarly light/saturated fills, not dark text on dark fill. Plain flipping plus the 0.55 chromatic floor destroys the designed base/container distinction.

3. The literal walk catches only literal hexes and `px`/`rem`/`em` strings in `.ts` and `.tsx` under `src`, excluding `theme` and fixtures. It misses constructed hexes, `rgb()`/`hsl()`/named colors, CSS files, MDX, `index.html` inline styles, and non-TS fixture formats or fixtures outside `src`. A `.ts`/`.tsx` story fixture beneath `src` is scanned, except under the excluded directories. It also excludes the current `Swatches` component entirely, despite it containing raw size/radius values.

4. `resolveScheme(colorScheme, useSystemScheme())` is hook-safe: the hook is unconditional and has stable ordering. With preference `system`, a real `matchMedia` change invokes the external-store subscription, changes the snapshot, re-renders `AppProviders`, and rebuilds the theme. However, no test dispatches that change or verifies the resulting theme switch.

Findings:

- **critical** — Dark status chips are unusable. `pair()` derives both chip text and fill through the same chromatic-floor rule, producing 1.01–1.51:1 contrast for eight statuses. The assertion that “the base stays the readable end” is false. [darkMode.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.ts:145)

- **critical** — The product has no color-scheme setting or persistence. Production always mounts `AppProviders` without `colorScheme`, so it always selects the default `light`; `dark` and `system` exist only through Storybook globals. This contradicts the task’s provider/persistence intent and the board note that persistence was outstanding. [main.tsx](D:\Kar\Gandom\KarNama\apps\web\src\main.tsx:16) [AppProviders.tsx](D:\Kar\Gandom\KarNama\apps\web\src\app\AppProviders.tsx:30)

- **major** — The claimed no-literals enforcement does not cover the current Foundations component because it excludes all of `src/theme`. `Swatches` currently hardcodes `40`, `16`, and radius `999`; those become CSS lengths/radius values and violate the no-raw-spacing/radius rule, yet this test can never see them. [noLiterals.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\noLiterals.test.ts:19) [Tokens.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\theme\Tokens.stories.tsx:28) [Tokens.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\theme\Tokens.stories.tsx:70)

- **major** — The dark semantic palette also fails ordinary text contrast on its own dark surface: secondary, brand, and error text are below 4.5:1, while `text/on-accent` is below 4.5:1 on the derived primary background. The tests only check HSL floors and page darkness, so they approve these visibly wrong results. [darkMode.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.ts:79) [darkMode.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.test.ts:92)

- **major** — The new visible Storybook theme controls are bare English strings, not Lingui messages, and therefore remain English in Persian Storybook. [preview.tsx](D:\Kar\Gandom\KarNama\apps\web\.storybook\preview.tsx:39)

- **minor** — The system-scheme tests never invoke the registered media-query listener and never render a client component through a change. They prove listener registration and pure resolution, not that a system transition changes the applied theme. [useColorScheme.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\useColorScheme.test.ts:83)

`node agent/scripts/todo.mjs validate` passed. The KN-005 verifier reached its final Vitest subprocess but this read-only sandbox prevents Vite from writing its temporary config; that is an environment limitation, not a finding.

VERDICT
score: 2.5
criticals: 2
one-line: Replace the status-pair derivation, because eight of nine dark status chips have unreadable text.