# KN-398 · The dark tooltip is white on light grey

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-005, from the
KN-108 roast.

## The card

**Why.** A tooltip nobody can read is a tooltip that is not there, and in dark
it is every tooltip in the product.

**Exit condition.** In dark the tooltip's text clears 4.5 to one on its fill, by
a role the tooltip's fill takes that stays dark in dark, or a text that follows
it, and the theme's pair test reads the Tooltip's pair from the component rather
than from a list; the Tooltip's dark story measures it.

## What is actually wrong

The light design draws the tip as an INVERSE surface: `text/primary`, a
near-black, under `text/on-accent`, white. The dark palette is derived by
turning text roles light, so `text/primary` becomes a light grey near `#d8dfee`
while `text/on-accent` stays white: about 1.34 to one, which is invisible.

The pair test enumerates the palette's own pairs and the Button's looks. The
Tooltip's pair is written inside the component, so nothing was looking at it.

## The approach

The exit allows either half; the smaller and truer one is **a text that follows
its fill**. The tip's fill is deliberately the opposite of the page, and what
should follow is the text on it.

- The component exports its pair as a function of the theme,
  `tooltipPair(theme) => { fill, text }`, where the fill stays what the design
  says, the inverse surface, and the text is whichever of the two text roles
  reads on it: `ensureContrast` already exists in `theme/darkMode.ts` and is
  what the palette itself uses.
- The component draws from that function, so there is one place the pair is
  decided.
- The theme's pair test imports `tooltipPair` and checks it in BOTH schemes,
  which is what the card means by reading it from the component rather than
  from a list.
- The Tooltip's dark story measures the rendered surface and its text.

## What I am unsure about

- Whether `ensureContrast` returns something that still looks like the design
  in light: in light the fill is near-black and white already clears 4.5, so it
  should return white unchanged. Worth asserting rather than assuming.
- Whether other components paint an inverse surface the same way and have the
  same bug. The card is about the Tooltip; anything else found becomes its own
  card.

## How I will know it worked

The dark story reads the drawn surface's computed background and colour and
clears 4.5 to one; the light story is unchanged; the theme's pair test fails if
the pair stops clearing in either scheme.
