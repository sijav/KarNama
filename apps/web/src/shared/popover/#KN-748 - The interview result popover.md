# KN-748 · The interview result popover, Popover / نتیجهٔ مصاحبه 844:85811

**Why**, from the board: components before screens; the redesigned interview
flow composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 844:85811 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 844:85811; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-03

`get_design_context` and use_figma on 844:85811, one component with no
variants, in the Board section:

- A panel 369 wide that hugs its height, 104 with four choices:
  `color/bg/surface` with one pixel of `color/border/default` inside, counted
  in the layout, so the content starts 17 in; 16 of padding and 12 between
  its parts, neither bound; a radius of 10 bound to no variable and none of the
  radius scale; one drop shadow bound to no effect style, 4 below, blurred 12,
  spread 0, in #121726 at 8 percent.
- The title «نتیجه چی بود؟», 14 at Medium on Figma's automatic 22, no
  letter spacing, `color/text/primary`, at the inline start, bound to no text
  style.
- The Choices frame: a row that wraps, 8 both ways, its items at the inline
  start, filling the width: four Status Choice instances at Default, each
  hovering into Hover, 427:562, with the medium chip of پیشنهاد کار on the
  offer pair, پذیرفته‌شده on custom-1, رد شده on rejected and انصراف on new,
  in that order from the inline start.
- Its description: it opens under the card after «نتیجه گرفتم» on an
  interview card, and a click outside closes it. It offers only what can
  follow an interview, the four above and any stage the reader made after
  interview. One click applies the choice: a closing outcome sends the card
  to its strip with the undo message, and an offer to the offer column.

The two date popovers, 755:22108 and 774:16705, draw the same panel at 276:
the same fill, edge, padding, gap, radius and shadow. No screen places an
instance, and no prototype opens it.

## The approach

1. `elevation.popover`, the shadow, beside the other eight shadows bound to
   no style; and `unstyledText.interviewResult`, the title's 14 on 22.
2. `popoverPaper` in a new `shared/popover` folder, the panel the three
   popovers share, under an sx key as `modalPaper` is: the caller gives the
   width. The edge is a real border, since the file counts it in the layout.
3. `InterviewResultPopover` beside it, on MUI's Popover, which traps focus,
   closes on Escape and on a press outside, and gives focus back to what
   opened it. It opens under the element it is given, the card, at its
   inline start, 4 below it, at once. A named dialog: the title labels it.
   Its choices are buttons, since one press applies, each the Status Choice
   with its hover ring and the keyboard's three pixel ring. Focus starts on
   the panel: a choice focused as it opens wears the keyboard's ring even
   when a pointer opened it, measured in Chromium, which reads as chosen. A
   press closes it and hands the choice over. Which choices the board offers
   is the board's, from the record model, KN-731.
4. Stories: the four choices, a press, a press outside, Escape, hover,
   keyboard, a custom stage that wraps the row, English and dark.

## How it is checked

Its stories, the theme's tests, lint, tsc, and a look in both schemes.

## What the build found

A browser does not space the letters of a joined script, so the chips'
Persian, which Figma tracks 0.2 a letter, draws narrower than the file's:
پیشنهاد کار 86.5 against 89, رد شده 63.8 against 65. The four still share one
line, and DESIGN.md's Type section records it.
