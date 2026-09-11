1. No regression. `DESIGN.md` defines Page Header as the page title, and its docs explicitly make it the `h1`. The mobile chrome intentionally lacks the desktop brand/sidebar; the browser tab remains `کارنما` in `index.html`.

2. No 900px gap or overlap: navigation uses `up('md')` and the header uses `{ xs: ..., md: 'none' }`, so 900 is sidebar-only and 899 is header-switch-only. However, the story does leave the mounted preferences state and Lingui singleton in English after its `finally`; it restores only storage and viewport.

Findings:

- major — The newly exposed phone control does not match the product’s language-control styling. Header placement receives only `{ justifyContent: 'center', width: 'auto' }`, leaving MUI Button defaults, including uppercase English typography, default sizing, spacing, and colour. At 390px, the critical `English` action visibly renders as foreign default UI rather than the product text control. This violates the exact-design requirement and is already accurately described by KN-387. [LanguageSwitch.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\language-switch\LanguageSwitch.tsx:101)

- minor — `LanguageOnAPhone` restores `localStorage` and viewport but not the preference provider’s live state, document direction, or Lingui singleton. After selecting English, including if a later assertion fails, the mounted story remains English despite its Persian globals and restored persisted value. This can contaminate a subsequent story sharing the preview tree and makes cleanup internally inconsistent. [App.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\app\App.stories.tsx:93)

VERDICT
score: 7.0
criticals: 0
one-line: Style the header-placement LanguageSwitch to the design’s product text-control treatment instead of exposing MUI’s default button.