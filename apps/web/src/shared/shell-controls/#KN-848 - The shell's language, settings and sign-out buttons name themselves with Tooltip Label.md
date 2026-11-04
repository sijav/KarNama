# KN-848 · The shell's language, settings and sign-out buttons name themselves with Tooltip / Label

**Why**, from the board: the redesign names every icon-only button the same
way, and these three are the only ones in the shell that do not; taking their
tips off without keeping the descriptions would leave a screen reader user with
less than they hear today.

**Exit**, from the board: ShellControls' stories show each of the three buttons
naming itself with Tooltip / Label on hover and on keyboard focus, in fa-IR and
en-US, light and dark, and each still has its description, the current
language's own name, «Language, theme and sample data» and «Signs you out of
your account on this device»; DESIGN.md section 5 and the label tooltip's
section say so; lint, tsc and its tests pass.

## What is there now

The language switch, settings and sign out are each an Icon Button inside the
old describe Tooltip, `shared/tooltip`. That Tooltip shows its text as a tip
and also gives it to the button as its accessible description, through a
hidden copy the button points at, KN-231. Inside it, the Icon Button's own
Tooltip / Label, KN-777, steps aside so two tips never show. So these three
show a description where the redesign's spec, `1123:57071`, wants the name.

## The approach

1. The Icon Button takes an optional `description`. It is a hidden span the
   button points at with `aria-describedby`, joined to any description a caller
   or a Tooltip already gives, so it is heard and never drawn. The old
   Tooltip's own description works the same way, so what a screen reader hears
   does not change.
2. The language switch, settings and sign out drop the old Tooltip and pass
   their text as `description`: the current language's own name, «Language,
   theme and sample data» and «Signs you out of your account on this device».
   Their Tooltip / Label then shows their names on hover and keyboard focus.
3. The network page's add contact keeps the old Tooltip until its own card
   rebuilds the page, and the comments that count the old Tooltip's users say
   one.
4. Stories: the Icon Button's `Described`, its description heard and its name
   shown; the shell controls' `NameThemselves`, by hover and by Tab, in each
   language and scheme.

## How it is checked

The Icon Button's, the shell controls', the language switch's and the settings
control's stories; a planted description that is also drawn must fail them.
Also the docs guard, lint, tsc, and a look.
