# KN-743 · The company logo on a card, Company Logo 620:3684 and the named logos

**Why**, from the board: components before screens; the redesigned job card
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 620:3684 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
620:3684; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass. The named logos follow the owner's answer, recorded on this card.

## What the file draws, read 2026-11-03 with use_figma

Company Logo / placeholder, `620:3684`, in the Board section: a square of 36,
its radius 8 bound to no variable, filled with `color/bg/surface-secondary`,
centring the Icon set's `building` at 18, which is none of the icon sizes, its
stroke of 2 in `color/text/disabled`. Beside it six named logos,
Company Logo / digikala, bazaar, snapp, alibaba, torob and tapsi, `620:3637` to
`620:3679`, each the same square holding a company's own drawing, torob's with
one of `color/border/default` inside since its drawing is white. The redesigned
card, Card / Kanban, takes one at the head of every variant, nine instances.

## The owner's answer

Asked on 2026-11-03: a company's logo is fetched from its own website, else from
its LinkedIn page, and where neither is found a default organisation icon is
shown, as LinkedIn does. Fetching is KN-830's. So the named logos are what a
fetched logo looks like in the slot; the product does not draw them itself, and
the placeholder is the default organisation icon.

## The approach

1. `CompanyLogo` in `shared/company-logo`: given a logo's address it draws the
   image in the square, covering it; given none, or one that fails to load, it
   draws the placeholder. It is decorative: the company's name is written
   beside it on the card, so the image has no name of its own and the
   placeholder is hidden from assistive technology.
2. The radius is `radius/md`, the 8 the file leaves unbound; the building at 18
   is drawn from the icon set's geometry at that size, as the Color Picker
   draws its 14 check, with the set's two pixel stroke.
3. Stories: the placeholder, a logo, one that fails to load, English and dark;
   the logo a neutral drawing of the story's own rather than a company's.

## How it is checked

Its stories, lint, tsc, and a look in both schemes.
