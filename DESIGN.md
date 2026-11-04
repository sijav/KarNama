# Design contract

Everything here was read from the Figma file, not invented. When this file and
Figma disagree, **Figma wins** and this file gets corrected in the same change.

**The redesign, 2026-11-03.** The file named below is the original, which holds
the redesign. Every section after this one was transcribed from a copy made
before it, so a section is only as current as its latest dated reading: until it
names a reading of the original on 2026-11-03 or later, read its node in the
file before building on it. The redesign's cards rewrite each section as they
land, the status colours with KN-730 and the rest with their own cards, and
KN-829 reads whatever is left. The designer's written spec beside the file is
[DESIGN-HANDOFF.md](./DESIGN-HANDOFF.md): the file's Screens page is the final
reference, the handoff explains it, and where the two disagree the designer is
asked.

The owner's instruction, verbatim: _match it exactly like design, every
component should be exactly like the design_. Exactly means every size, every
state, every variant, and every token. A component that looks right but is
missing its `Focus` state does not match.

## The file

**File key** `K1EP8GCOmelU8o4vPR7a9f`, the original. Until 2026-11-03 every MCP
call against it failed with "you don't have edit access", so this document was
transcribed from a copy, `EITM6CbJY33dMY8IsMFR4R`, which holds none of the
redesign and is not to be read for it.

| Page          | Node id    | What it holds                                                  |
| ------------- | ---------- | -------------------------------------------------------------- |
| Cover         | `0:1`      | the file's own description                                     |
| Foundations   | `5:3`      | the variables the tokens come from                             |
| Components    | `5:5`      | every component, the redesign's among them                     |
| Screens       | `5:7`      | the final screens, the build spec, in the seven sections below |
| Redesign test | `587:7632` | the designer's exploration of directions, not the build spec   |
| Archive       | `714:7632` | the screens as they were before the redesign                   |
| Documentation | `5:8`      | old, by the handoff's own word; section 7 below is its history |

| Screens section      | Node id      |
| -------------------- | ------------ |
| 1, the board         | `1062:54408` |
| 2, the job modal     | `1062:54409` |
| 3, adding a job      | `1062:54410` |
| 4, the network       | `1062:54411` |
| 5, the stats         | `1062:54412` |
| 6, signing in and up | `1062:54413` |
| 7, mobile            | `1062:54414` |

Three quirks that cost time if you rediscover them:

- `get_metadata` **with no `nodeId` lists the pages** with their ids, and nothing
  under them; an earlier reading here said it listed only the Cover.
- `get_metadata` **on a whole page can be too large to come back.** Screens is
  about 1.19 million characters and lands in a saved file instead of answering,
  and even a section can be: Stats, `1062:54412`, is about 126 thousand. Call it
  on a frame id, or read the saved file with a script.
- `get_variable_defs` **refuses a canvas id** with "you currently have nothing
  selected". It needs a frame or a symbol. `7:2`, the Foundations Overview
  frame, is the one that yields the whole token set.

What the cover says about the file itself: responsive web, mobile and desktop,
RTL Persian, built on Material 3 but customised, version 0.2, brand colour and
grey scale final, **font still a placeholder** (Vazirmatn), phase 2.

---

## 1. Tokens

Read from `7:2`. These are the whole set; a component may not introduce a
literal outside it. When a component needs a colour that is not here, the role
gets added to the palette with a name, it does not get inlined.

### Colour, semantic

| Token                       | Light     |
| --------------------------- | --------- |
| `bg/page`                   | `#f6f7f9` |
| `bg/surface`                | `#ffffff` |
| `bg/surface-secondary`      | `#f3f4f6` |
| `bg/brand/default`          | `#2563eb` |
| `bg/brand/hover`            | `#1d4ed8` |
| `bg/brand/container`        | `#dbeafe` |
| `bg/danger/default`         | `#ef4444` |
| `bg/danger/hover`           | `#d43030` |
| `text/primary`              | `#111827` |
| `text/secondary`            | `#6b7280` |
| `text/secondary-strong` | `#4b5563`   |
| `text/disabled`             | `#9ca3af` |
| `text/on-accent`            | `#ffffff` |
| `text/brand`                | `#1d4ed8` |
| `text/error`                | `#b91c1c` |
| `border/default`            | `#e5e7eb` |
| `border/focus`              | `#2563eb` |
| `border/error`              | `#ef4444` |
| `accent/200`                | `#bfdbfe` |
| `accent/700`                | `#1e40af` |
| `gray/200`                  | `#e5e7eb` |
| `red/100`               | `#fee2e2`   |
| `red/700`                   | `#b91c1c` |
| `overlay/scrim`             | `#00000080` |
| `data/bar`              | `#60a5fa`   |

#### Not on the Foundations board, and where each was actually read

The Foundations overview at `7:2` does not carry everything. These are real
variables that only surface on the frames that use them, so each row names the
frame it was read from with `get_variable_defs`. Do not delete them as strays.

| Token                | Read from | Value     | Note                                          |
| -------------------- | --------- | --------- | --------------------------------------------- |
| `bg/danger/default`  | `31:4`    | `#ef4444` | the destructive button                        |
| `bg/danger/hover`    | `31:4`    | `#d43030` | the destructive button                        |
| `accent/200`         | `31:4`    | `#bfdbfe` | a primitive, not a role                       |
| `accent/700`         | `31:4`    | `#1e40af` | a primitive, not a role                       |
| `gray/200`           | `31:4`    | `#e5e7eb` | a primitive, the same value as `border/default` |
| `red/700`            | `31:4`    | `#b91c1c` | a primitive, the value `text/error` resolves to |
| `red/100`           | `961:2491` | `#fee2e2`   | a primitive, the Menu Item's Destructive Hover         |
| `text/error`         | `95:39`   | `#b91c1c` | the Input error state                         |
| `black/base`         | `31:4`    | `#000000` | the base the two elevation shadows take alpha from |
| `overlay/scrim`      | `377:6244` | `#00000080` | black at half behind a modal, the variable's own alpha |

`black/base` is why the shadow colours are written `#0000000F` and `#00000014`
rather than as greys: they are black at an alpha, and the alpha is the whole
token. It is not a colour any component may paint with.

#### The owner's additions, which the file does not have

A role the owner decided on that no Figma variable carries. Each row names the
decision that made it, so it is never mistaken for a value read from the file.

| Token            | Decided  | Value     | Note                                                                 |
| ---------------- | -------- | --------- | -------------------------------------------------------------------- |
| `border/control` | `KN-273` | `#7f8694` | a control's resting edge, the Input's, the unchecked Checkbox's and the Select's: text/secondary's hue made lighter to the last value at 3.3 to one on `bg/page`, `bg/surface` and `bg/surface-secondary`, and walked to 3 to one in dark, KN-275 |
| `border/selected` | `KN-276` | `#2563eb` | a selected Filter Chip's one pixel edge: the blue of `border/focus` today, at 3 to one or more on every surface and on the selected fill in both schemes, told from the pressed edge by its width, one pixel against 1.5, KN-279 |
| `text/brand-inverse` | `KN-764` | `#93c5fd` | the toast's action on its `text/primary` pill, the handoff's colour, which no variable carries; in dark the pill turns light and the action takes the light scheme's `text/brand`, walked to 4.5 to one against it                                |

### Colour, status

Five defaults and four reserved for user-defined statuses. Each has a `base`,
which is the text and the stripe, and a `container`, which is the chip fill.

Read in the original on 2026-11-03, three pairs changed, KN-730: `interview`
is now `petrol/700` over `petrol/100`, teal where the copy drew amber;
`custom-1` is `orange/700` over `orange/100`, which the redesign also paints
the accepted outcome with; and `custom-4` is `fuchsia/700` over
`fuchsia/100`. The other six are the copy's.

| Status     | base      | container | Persian      |
| ---------- | --------- | --------- | ------------ |
| `new`      | `#4b5563` | `#e5e7eb` | ذخیره‌شده     |
| `applied`  | `#4f46e5` | `#e0e7ff` | درخواست‌شده   |
| `interview`| `#0f6876` | `#d7f0f4` | مصاحبه       |
| `rejected` | `#b91c1c` | `#fee2e2` | رد شده       |
| `offer`    | `#166534` | `#dcfce7` | پیشنهاد کار  |
| `custom-1` | `#c2410c` | `#ffedd5` | سفارشی ۱     |
| `custom-2` | `#7e22ce` | `#f3e8ff` | سفارشی ۲     |
| `custom-3` | `#be185d` | `#fce7f3` | سفارشی ۳     |
| `custom-4` | `#a21caf` | `#fae8ff` | سفارشی ۴     |

The Persian names come from the legend at `410:470`. They are the **default**
labels for the five built-ins; a user can rename any status, so the label is
data, not a constant. The nine colours are a closed set, and the Color Picker
at `257:17` offers all nine for any status, the current one marked, as the
Column Colour screen `259:184` draws it: a status's colour is chosen
automatically and the user can change it, `376:30`, so a custom status may take
a default's colour. An earlier reading here said a custom status picks one of
the four reserved slots; the file draws nine, read with use_figma on
2026-09-11, KN-019. The swatches run from the inline start as the file places
them: offer and the four custom slots, then new, applied, interview and
rejected. They are one radio group, and in either direction the left and right
arrows move to the swatch that sits that way on screen, which WebKit's own radio
group does not do right to left, KN-301.

Read again in the original on 2026-11-04, KN-803: the panel and the swatches are
the copy's; its helper says «رنگ خودکار انتخاب شده؛ اگه خواستید عوضش کنید.», the
redesign's plural you; and its example marks custom-1 with a ring and tick in
an unbound `#0f766e`, the teal custom-1 was before KN-730, where the copy bound
them to the chosen status's base, which the code keeps. The Documentation frame
`376:30` still names interview amber, custom-1 teal and custom-4 cyan, so the
swatches the screen reader names take the colours they now are: teal, orange
and fuchsia, «سبزآبی», «نارنجی» and «سرخابی».

### Spacing, radius, icon size

```
spacing  2xs 4   xs 8   sm 12   md 16   lg 24   xl 32   2xl 48   3xl 64
radius   none 0  sm 4   md 8    lg 16   full 999
icon     sm 16   md 20  lg 24
touch    min 44
```

### Elevation

**There are exactly two effect styles**, and they are for different surfaces: a
card sits on the page, a modal sits above everything. Each is two stacked drop
shadows, and each value below was read from the named node with
`get_variable_defs`.

| Style             | Read from | Shadow 1                        | Shadow 2                        |
| ----------------- | --------- | ------------------------------- | ------------------------------- |
| `Elevation/Card`  | `137:44`  | `#0000000F` `0 1` blur 3 spread 0  | `#0000000A` `0 1` blur 2 spread 0  |
| `Elevation/Modal` | `210:276` | `#0000001F` `0 8` blur 24 spread -4 | `#00000014` `0 2` blur 6 spread -2 |
| no style, tooltip | `410:469` | `#0000003D` `0 6` blur 18 spread -2 | none                            |
| no style, bulk bar | `401:436` | `#00000029` `0 8` blur 24 spread -4 | none                           |
| no style, options menu | `408:487` | `#0000001F` `0 8` blur 24 spread -4 | none                       |
| no style, contact hover | `463:698` | `#0000000F` `0 2` blur 8 spread 0 | none                        |
| no style, card focus | `137:44` | `#2563EB2E` `0 0` blur 0 spread 3 | none                            |
| no style, sign-in card  | `407:6952`  | `#0000000F` `0 4` blur 16 spread 0  | none                               |
| no style, popovers      | `844:85811` | `#12172614` `0 4` blur 12 spread 0  | none                               |
| no style, toast         | `717:12416` | `#11182733` `0 8` blur 24 spread 0  | none                               |

The third row is **not an effect style**. The tooltip at `410:469` draws its own
shadow, 24 percent black, read from the frame's `get_design_context` because
`get_variable_defs` binds no style to it, so the two-style rule above still
holds. It is in the token set as `elevation.tooltip`,
named for the one surface that uses it, because a component may not state a
shadow of its own. The fourth row is not one either: the Bulk Action Bar
at `401:436` draws one shadow of 16 percent black, the Modal style's first
layer at a heavier alpha, bound to no style, read with use_figma on 2026-09-11.
It is `elevation.bulkBar`. KN-025. The fifth is the Options Menu at `408:487`, the list a Select opens: the
Modal style's first layer alone, at its own 12 percent, bound to no style,
`elevation.optionsMenu`. KN-012. The sixth is the compact Contact Card's hover,
`463:698`, 6 percent black, `elevation.contactCardHover`. KN-026. The seventh is the job card's Focus at `137:44`, a
halo of `border/focus` at 18 percent spread 3, `elevation.cardFocus`. KN-015. The eighth is the sign-in card at `407:6952`, 6 percent black 4 below and
blurred 16, `elevation.authCard`. KN-518. The ninth is the redesign's popovers,
`844:85811` and the two date popovers, `755:22108` and `774:16705`, #121726 at 8
percent 4 below and blurred 12, `elevation.popover`. KN-748. The tenth is the
toast, `717:12416`, `text/primary`'s #111827 at 20 percent 8 below and blurred
24, `elevation.toast`. KN-764. The thirteen-frame sweep below did not include `410:469`,
which is how it was missed until KN-218 read the frame itself.

An earlier version of this document said Card was the only elevation in the
file. That was false, not merely incomplete, and it survived because the
Foundations overview frame `7:2` exposes the colour, spacing and radius sets but
**not the effect styles or the type styles**: those appear only on the frames
that use them. A sweep that reads `7:2` alone will miss exactly this class of
token every time, which is why the sweep for this task sampled thirteen
component frames instead: `7:2`, `7:105`, `33:58`, `84:22`, `95:38`, `137:44`,
`159:80`, `185:11`, `210:276`, `248:116`, `401:436`, `416:21` and `512:8350`.
The Menu at `512:8350` uses `Elevation/Card` rather than a third style, and the
Contact Card and Empty State introduce no token outside the set recorded here.
An earlier version said the same of the Bulk Action Bar, whose shadow is the
fourth row above; the sweep read its colours and missed its effect.

### Type

Family **Vazirmatn**, flagged in the file as a placeholder. The stack in code is
`'Vazirmatn Variable', 'Vazirmatn', system-ui, sans-serif`, matched against this
line whole by the token guard, KN-234: the variable webfont the app loads,
KN-322, then a static Vazirmatn where the reader's system has one, then the
system's own face. Five roles, and **only five**, read from the type-scale
documentation frame `416:21`:

| Role        | Size / line height | Weight   |
| ----------- | ------------------ | -------- |
| `Heading/L` | 24 / 32            | SemiBold |
| `Heading/M` | 20 / 28            | SemiBold |
| `Title`     | 16 / 24            | Medium   |
| `Body`      | 14 / 22            | Regular  |
| `Label`     | 12 / 16            | Medium   |

`Body` carries letter spacing 0 and `Label` carries 0.2, read from the component
frames. Figma tracks Persian too, but a browser does not space the letters of a
joined script, so the 0.2 reaches only Latin text, and a Persian chip or label
draws about 0.2 a letter narrower than the file's: measured in Chromium on
2026-11-03, «انصراف» at 14 and Medium is as wide with 0.2 as without, while
Rejected grows by 1.6. KN-748.

**One text is bound to no style**, and it is not a sixth role: the add modal's paste
label, `166:68`, is the Label's 12 on 19, Figma's automatic line for it, with no
letter spacing. The code names it for that surface, `unstyledText.pasteLabel`, as
it names the shadows bound to no effect style, KN-359.

**No size outside these five is permitted.** The file says so directly, and it
records the cleanup: 11 and 18 were corrected to 12 and 20, and **`Body/Small`
at 13 was deleted entirely**, with the column counters moving to 12 and
everything else to 14. An earlier version of this document listed `Body/Small`
as a sixth role, which was wrong: it does not exist.

### The Status Chip has two sizes, and the large one is not general

- `Size=S`, 12px, height 24, is the default and is what almost everything uses.
- `Size=M`, 14px, height 28, is for the kanban column header and the Status
  Choice, `427:567`, which the file builds on it in all three of its states;
  nowhere else. An earlier reading here said the column header only, which the
  file contradicts, read with use_figma on 2026-09-11 over the KN-060 roast.
- Both hug their label with `spacing/xs` at each side and a full radius. S's
  text is the `label` role exactly. M's is `body`'s size and line height, 14
  and 22, with `label`'s weight and tracking, 500 and 0.2: node `398:6181` binds
  no text style, so it is composed from the two roles rather than named as a
  sixth.

Reaching for the large size anywhere else is a departure from the design.

### A long status name is cut, not wrapped

A user can rename any status, and node `82:2` only ever draws short names, so
this is a decision. **The chip never grows past where it sits**: a name longer
than its container is cut with an ellipsis on one line, never wrapped onto a
second, so a column header or a card keeps its height and its width. The whole
name stays the chip's text, so a screen reader reads all of it. The chip takes
its direction from the name, not the page, as the label in `84:4` does: the
first strong code point decides, one of Unicode bidi class L, R or AL. Letters
and the left and right marks are the common ones, and the Persian digits these
stories use are not strong. So a name led by a Latin word runs left to right in
the Persian interface, a Persian name led by digits runs right to left in the
English one, a name led by a left to right mark before digits runs left to right
in the Persian one, and a name with no strong code point follows the page's. The
ellipsis sits at the end of the line as it is drawn, the right of a left to right
chip and the left of a right to left one: in a chip running left to right that
holds a Persian run, that run is drawn right to left, so what the ellipsis hides
of it is its start. KN-264, KN-370.

### The Input focused while invalid

Node `95:38` drew six standalone states and no composite; the original adds a
seventh, Filled Hover, Hover's `text/secondary` edge round Filled's
`text/primary` value, the one composite it draws, which the code's hover rule
already drew on a field with a value, KN-787. It draws no focused invalid
field, so this one is a decision rather than a reading. **A focused invalid field keeps the error
colour and takes the focus width**: two pixels of `border/error`, because
turning it blue would hide the error exactly while the user is fixing it. **And
the product's focus ring is drawn inside it**: two pixels of `border/focus`,
four pixels in from the field's edge, the edge's two and a gap of two, its
curve concentric with the edge's. It is the ring the Checkbox and the Filter
Chip draw, KN-244, drawn inside the field's own box, KN-274.

The red border alone changed one pixel on focus, the inner one, white to red at
3.76 to one, with the outer pixel red before and after: half the perimeter WCAG
2.4.13 asks a focus indicator to change, and no sign at all to someone who
cannot resolve one pixel. The ring changes a two pixel band from the field's
own surface to `border/focus`, at 5.17 to one in light and 3.04 on the derived
dark surface, KN-271. With the pixel the edge gains, the change is 6W + 172
square pixels in a field W wide and 44 tall, less what the corners cut: each
band is a rounded contour, not a rectangle, and the four corners of the two
bands take (4 − π)(7² − 6²) and (4 − π)(4² − 2²), 21.5 square pixels together,
so the change is **6W + 150.5** against WCAG's two pixel perimeter of 4W + 4H,
which is 4W + 176. It clears from **13 pixels of width** upward, and the
design's narrowest field is far wider; the story measures an 80 wide field as
well as a full width one, KN-295. The ring alone, being inset, is a little
less, and the two bands count together, each a change of 3 to one or more. A red ring would clear 3 to one too; blue is chosen so the product has
one focus sign rather than two.

**Inside the field, not round it, KN-274.** The ring was an outline four pixels
outside the field, and the Input fills its container, so a host that clips its
overflow at the field's edge, a modal or a scroll area, took the ring, and
focus fell back to one red pixel. Keeping four pixels of room instead would
inset the field from its own label and from every other field in a form. Drawn
on a pseudo-element inside the field's own box, nothing of it lies outside the
field, it is measured against the field's own surface wherever the field is
put, and the text and the icons, 16 from the edge, have ten pixels to spare.
The gap keeps red and blue, 1.37 to one against each other, from meeting and
reading as one band. It shows on any focus, as the field's own focus border
does, and nothing moves. Under forced colours a pseudo-element's border is
kept, so the ring still shows there, as a second line inside the edge. The
Checkbox keeps the room for its ring instead, KN-293, and the Filter Chip draws
its ring inside itself, KN-294, both below. Revisit if the file ever draws the
state.

### The Checkbox keeps the room for its focus ring

**Read in the original on 2026-11-03**, `204:11` has a sixth state, Checked
Hover: the checked square and its edge in `color/bg/brand/hover` under the same
tick, which the code draws under the pointer, KN-798. The other five are the
copy's, and neither file draws a hover for the indeterminate square, so it keeps
its own fill.

The file draws no Focus state for the Checkbox, `204:11`, and every instance of
it, ten on the Components canvas and eight on the Screens, sits at the inline
start of a card's or a contact card's Title Group, flush with its edge, 2.5
from its top and bottom and 8 from the title, in a frame Figma clips, read with
use_figma on 2026-09-11. The drawn geometry leaves no room round the frame.

The product's ring, two pixels of `border/focus` at an offset of two, KN-244,
cannot move inside the frame as the Input's did: a checked frame is the ring's
own blue, and a band inside 20 by 20 falls short of the frame's two pixel
perimeter at two pixels, about 134 square pixels against 146, while at three it
leaves the tick two and a half pixels and needs a second focus colour on a
checked frame. **So the room is the Checkbox's own**: its root carries
`spacing/2xs` on every side, 28 by 28 round the drawn 20 by 20 frame, and the
ring lies inside it, so a host that clips flush at the Checkbox keeps the whole
ring, KN-293. The frame is the component WCAG 2.4.13 measures, its visual
presentation, since the room round it draws nothing: the ring's band, its
corners concentric with the frame's, is about 184 square pixels, clearing the
rectangle's 4W + 4H, 160, and the rounded frame's own two pixel perimeter,
4W + 4H - (16 - 4π)r, about 146. In the derived dark palette the ring clears 3
to one by only 0.04, so the pixels anti-aliasing blends at its corners fall
under it; WCAG lets a measure ignore those, and counted by what each pixel
covers the band is the same in both schemes. The 28 is also the Checkbox's
target, which KN-206 asks to be 24 or more.

**What a host owes it.** The four pixels of room are the Checkbox's to keep
unclipped. A screen that puts the frame where the file draws it, flush at the
Title Group's edge, gives the four back with a negative margin of the same
token on a wrapper, since the Checkbox takes no `sx`, and the room then lies
outside the group: that group, and anything within four pixels of the frame,
must not clip, the title truncating on its own element. KN-015 and KN-026
prove it on the groups they build.

### The Filter Chip draws its focus ring inside

The file draws no Focus state for the Filter Chip, `159:71`, and all 65 of its
instances on the Screens canvas sit in a `Chips` row with a gap of 8 and no
padding, flush with its top and bottom, in a frame Figma clips, read with
use_figma on 2026-09-11: the mobile boards' status row, the row that scrolls.
Room of its own above and below would make the chip, and that row, taller than
the file's 32, and a negative margin would put the room back outside a row
that, scrolling sideways, clips on both axes. **So the ring is drawn inside the
chip**, KN-294: on its `::after` while it matches `:focus-visible`, three
pixels of `border/focus` just inside its one pixel edge, from 1 to 4, its ends
concentric with the chip's, and the outline off.

**Three pixels, where the Input and the Checkbox draw two**, because a band
inside a pill is shorter than the pill's own two pixel perimeter, which WCAG
2.4.13 gives for a rounded rectangle as 4W + 4H - (16 - 4π)r, 4W + 73 for the
32 tall chip: a two pixel band covers 4W + 48 at best, just inside the edge,
and three covers 6W + 62, clearing it for any chip at all, its padding alone
being 24. WCAG's understanding of 2.4.13 says as much of any indicator inset
from the edge: it needs to be thicker than two pixels, and in its own example
a two pixel inset indicator fails where three passes. A second band would have done it for two, the edge turning blue on
focus, but a selected chip's edge is that blue already, KN-279, and there the
ring alone would fall short. The ring's colour clears 3 to one on
every fill the chip has: 5.17 on `bg/surface` in light and 3.04 in the derived
dark, 4.70 and 3.57 on the hover fill, and 4.24 and 3.33 on the selected one.
Its inner edge is 1 from the line's box, and the label's ink, Persian dots and
marks included, stays between 8.25 and 24.75 of the chip's 32, measured, so
the ring never touches it. Pressed, the chip's inset 1.5 is already blue under
the ring's outer half pixel, which paints over it, so on a pressed chip focus
changes 2.5 wide, about 5W + 48, still clearing the perimeter for any chip 25
or more wide; and the one pixel selected edge, KN-279, sits outside the ring,
so focus is told from pressed and from selected by its width.

### An Input's error needs a message

Node `95:38` draws the Error state with its message and never without one, so
this is a decision too. **A blank error is no error**, and blank means nothing to
read: a message that is empty, or made only of whitespace, format characters
such as the zero-width non-joiner of Persian text or a direction mark, marks
with no letter under them, default-ignorable characters such as the variation
selectors and the Hangul fillers, or the braille blank, leaves the field in its
default state, not marked invalid, with its helper under it. One letter, digit,
punctuation mark or symbol makes it a real message, and a real message that
contains any of those characters is still an error. A form that clears an
error to the empty string rather than to nothing would otherwise leave a valid
field red, and a screen reader would announce it invalid with nothing to say why.
A blank helper is no helper by the same rule: it draws no line and describes
nothing, KN-287.

**And an error is announced as it appears**, to someone still typing in the
field: a changed description is not read while focus stays, so the error goes
into a live region, `role="alert"` inside the message line, in the page from
the first render and empty until there is an error, WCAG 4.1.3, KN-286. The
helper sits beside it while there is no error, so the line, and the field's
description, reads one text or the other. A line drawn only when there is
something to say, KN-287, keeps the empty region mounted and exposed.

### The Input's icon slots, and its label

Node `95:38` carries four booleans: Label, Helper Text, Leading Icon and
Trailing Icon, the icons off by default. Its icon slots are 20 by 20
placeholders of radius sm in `text/secondary`, spacing/2xs from the text inside
the field's 16 of padding, the leading one at the inline start. The Input
takes `leadingIcon` and `trailingIcon` for them, coloured through the icon's
`currentColor`, for decorative icons only: an icon hides itself from assistive
technology, and a slot is not a button, which would need its own name and a
target of 24. KN-267.

**The Label boolean is not honoured.** All 91 Input instances on the screens
keep the label on, and the label is the field's accessible name, so the Input
requires one; a field without a visible label would need an aria-label
contract first, and nothing on the screens asks for it. The Helper Text boolean
is the owner's decision of KN-285.

### The Empty State, and the line height its title does not have

Node `159:80` is a round mark of 64 in `bg/surface-secondary`, a title, a body
and a Primary M button, 12 apart, with an 8 pixel spacer frame and a second 12
above the button, so the button sits 32 below the body. It exposes the title
and the body as text properties, «تیتر» and «متن». The body is fixed at 220 and
wraps; the title hugs one line and may be the wider. The component has no
boolean to hide the button, so the code's action is required. KN-022.

**Read in the original on 2026-11-03**, it draws the same, and only its words
and height changed, KN-792: the title is «هنوز فرصت شغلی‌ای اضافه نکردید», the
body «اولین فرصت شغلی رو با لینک یا متن آگهی اضافه کنید تا از همین‌جا پیگیریش
کنید.», which wraps to three lines, so the frame is 319 high where the copy's
was 297. The copy called the record «آگهی» there, against the terminology rule,
which the code did not follow, KN-329 and KN-565; the original no longer does.
**No screen in the redesign uses it**: the board and the network page take
Empty State / Jobs `894:79222` and Empty State / Network `1083:55307`, KN-769,
and the first carries the same two sentences, which the Persian catalog now
holds. The code still draws this one for the empty job list, the network and a
search that finds nothing until those screens are rebuilt.

**The title binds no text style.** It is 16 at SemiBold on the file's automatic
line height, 25 in Vazirmatn. It is composed from the roles, as the Status
Chip's M is: Title's size and line height, 16 and 24, with SemiBold. So the
state is 318 tall where the frame is 319.

**The mark is all but invisible where it is used.** Every screen puts the Empty
State on `bg/page`, `#f6f7f9`, and the mark is `#f3f4f6`, about 1.02 to one.
It is decorative, so no contrast rule applies, and it is drawn as the file
draws it; whether it should be `bg/surface` or carry an illustration is the
owner's call.

### The extraction loading

**Loading / Extract**, `1031:3818`, Step 1, 2 and 3, read on 2026-11-03: three
dots and no text, the owner's decision of 1 Aban, which the node's description
records and DESIGN-HANDOFF.md repeats. It replaces the Loading State, `159:92`,
which the redesign took off the Components page, and with it KN-616's turning
arc, the owner's earlier choice for that node. The frame has 32 of padding on
every side, unbound at `spacing/xl`'s value, round a box of 38 by 22, and in the
box three dots of 10 in `color/border/focus`, `spacing/2xs` apart, drawn from
the left whatever the language. The lit dot is at the top of the box at full
opacity and the other two are 8 lower at 0.45; the box, the dots, the drop and
the opacity bind no variable. Step 1 lights the left dot, Step 2 the middle one
and Step 3 the right one. Each step holds 300 ms and then moves to the next in
250, ease in and out, the prototype's After delay and Smart animate, so the lit
dot steps 1, 2, 3 and back to 1 every 1650 ms. The motion starts on Step 1,
KN-324, and a reader who asks for less motion gets Step 1 standing still. The
frames' own `color/bg/surface` fill is left out, since the add flow they sit in
is that colour. `get_motion_context` exports no prototype interactions, so the
timings were read off the variants' reactions with use_figma, KN-768.

**The cold start is still explained, out of sight.** Render's free tier sleeps
and takes up to a minute to wake, DEPLOY.md, and the design draws no text for
that wait, so the lines KN-022 wrote are kept for a screen reader alone. The
state is a status region that says «داره آگهی رو می‌خونه…» and, from fifteen
seconds, «هنوز داره می‌خونه. اگه سرور خواب بوده، بیدار شدنش تا یه دقیقه
طول می‌کشه.», which says it is still working and names the likely cause without
claiming it. The region is in the page empty when the state appears and its
line is written into it 100 ms later, so the first line reaches the region as a
change, which is what a screen reader announces from, KN-326; no screen reader
has been run against it, KN-619. A start already past fifteen seconds when it
is given, or moved to, has the slow line at once, with no reading line between,
KN-325. The same line, out of sight, names the add flow's Loading panel, KN-362,
and the app still warms the server on load, AGENTS.md section 2.

### The Bulk Action Bar

Node `401:436`, Type=Jobs `205:18` and Type=Contacts `401:428`: `bg/surface`
with a one pixel `border/default` edge inside, radius lg, 12 and 16 of padding,
12 between its parts, and its own shadow, `elevation.bulkBar`. From the inline
start, the file's description says so for RTL: the count, then on the Jobs type
Ghost «انتخاب همه» and Secondary «تغییر وضعیت», Destructive «حذف», all Button
S, a divider 1 by 24 in `border/default`, and a close, a 32 frame of radius md
round Popover / Close, a 20 square of radius 6 round the x at 16 in
`text/secondary`, the shared `PopoverClose`, where the copy drew the x at 20 in
the frame; the original gives the Contacts type Select all too, before Delete,
KN-799. The count is Body's size and line height with Label's weight
at no tracking, `text/primary`. On the screens it sits 24 above the bottom,
centred, `243:595` and `252:386`. The set's Secondary Action boolean is bound to
no layer, so it does nothing and the code has no such prop. KN-025.

**The count says «فرصت شغلی».** The copy drew «۲ آگهی انتخاب شده», and the
selected items are job opportunities, which section 3's terminology rule, the
file's own and without exception, never calls «آگهی», as KN-329 asked. The
original says «۲ فرصت شغلی انتخاب شد» and, on the network, «۲ نفر انتخاب شد»,
people rather than contacts, both in the simple past, KN-799. The number is the reader's digits, and the English
noun takes its plural from the number; Persian keeps it singular.

**On a phone it wraps.** The file's mobile bar, `243:408`, is fixed at 358 and
holds 448 of content centred, so its close and its count hang 45 outside it.
The code keeps 16 from each side and wraps what does not fit onto a second row,
until KN-328 settles the narrow layout.

**What a host owes it.** The bar floats, but the page puts it before the list in
its order, so Tab reaches it without crossing the list, and while it shows the
page keeps room at its foot, 60 and 24, or the last rows can be focused under
it. The count's status region is in the page from the start, empty while
nothing is selected, so the first selection is announced.

### The Select, its options and its menu

Node `183:26` is the Input's family, its description says: the label above, a
field 44 tall of radius md with one pixel of `border/control` inside, KN-275, 16 of
padding, the value in Body and the 20 chevron-down in `text/secondary` at the
inline end, 8 from the value. Default shows «انتخاب کنید…» in `text/secondary`;
Filled the choice in `text/primary`; Focus two pixels of `border/focus`;
Disabled `bg/surface-secondary` with the text and chevron `text/disabled`; Open
one and a half of `border/focus`, an inset shadow over the one pixel border
since Chromium floors a border of 1.5, and the chevron not turned. The copy
drew **no Hover**; the original, read on 2026-11-04, adds Hover and Filled
Hover, one pixel of `text/secondary` round the placeholder or the value, the
Input's hover, and gives each option Select, `448:8051` and `448:8095`, a
Hover the same, so the field takes it where the pointer can hover, not while
focused, open or disabled, KN-794. The label is the Input's, Label role.
KN-012.

The menu, `408:487`, sits 4 below the field and as wide: `bg/surface`, one
pixel of `border/default` inside, radius md, 4 above and below its rows, and
its own shadow, `elevation.optionsMenu`. It opens instantly, the motion for
menus in section 7. Its rows, the Option Row `408:465`, are 40 tall with 12 of
padding and 8 between the name and the check: Default `text/primary`, Hover
`bg/surface-secondary`, Selected `bg/brand/container` and `text/brand` with the
16 check at the inline end, Disabled `text/disabled`. The name is Body's size
and line height at Label's weight, no tracking, as the Bulk Action Bar's count
is. The file draws no focused row, so the keyboard's row takes the Hover fill
and the three pixel ring drawn inside that the Filter Chip and the Icon Button
use.

**More than one.** The employment type holds several, the owner's decision of
2026-09-10, and the file draws only one value. A multiple select keeps its menu
open after each choice, checks each chosen row, and lists the names in the
field in the reader's own list style, `Intl.ListFormat`, cut with an ellipsis
when they do not fit. A single select handed more than one value reads only the
first, in its field and in its checks, KN-332. The two selects the file names,
«نوع همکاری» and «سطح
شغلی», are `EmploymentTypeSelect` and `JobLevelSelect`, their values English
ids and their names from the catalog. On the screens the only Select drawn is
the contact modal's «آگهی مربوطه», whose own prompt is why the prompt is a prop.

### The modals: the shell, Confirm and Change Status

Nodes `150:92` and `150:93` share a shell: `bg/surface`, radius lg,
`Elevation/Modal`, 24 of padding and 16 between its parts; a header 28 tall of
the title in Heading/M and, at the other end, Popover / Close at 20 round the x
at 16, the shared `PopoverClose`, as the original draws every redesigned modal's
close, where the copy drew the x at 20, KN-838; a divider; the body; a divider;
and the actions
at the inline end, 12 apart, the least drastic first. It sits centred over the
file's scrim, `overlay/scrim`, black at half, a variable of its own that the
Foundations board does not show, read with use_figma from `377:6244`; dark takes
it unchanged. It dissolves in and out over 150 ms, section 7. On MUI's Dialog it
traps focus, closes on Escape, the close or a press on the scrim, and gives
focus back to its trigger; the prototype wires no overlay, so the scrim's press
is a cancel, never the action. **Confirm** is 360 wide, its question as the
title and what cannot be undone in Body `text/secondary`, then Cancel and the
Destructive action; Cancel takes focus as it opens. The copy's body said «این
آگهی برای همیشه حذف می‌شود و برگشتی ندارد.», and the code said «این فرصت شغلی»,
KN-329; the original says «این فرصت شغلی برای همیشه حذف می‌شه و برگشتی نداره.»,
the rule's word in the redesign's spoken voice, two lines at 360, so it is 230
tall where the copy drew 208, and the code says it, the bulk deletion's line in
the same voice, KN-788. **Change Status** is 420 wide
round the Status Picker, then Cancel and Primary «تأیید»; the choice waits until
Confirm, and each opening starts from the job's status. The set's description
still speaks of a radio list with a name field; the component draws the chip
picker. KN-028.

**The modal forms are in the accessibility tree, and they are unnamed on
purpose. KN-468.** Each set of fields is wrapped in a `form` whose `onSubmit`
does the work, KN-463, styled `display: contents` so the modal's own layout is
unchanged. The worry that the styling would drop the form from the tree DID NOT
REPRODUCE in the Chromium the storybook project drives: reading the tree of all
four, the contact modal, change status, the add flow's review step and the
board's rename, each shows a `form` node with its fields nested under it. That
is what four readings in one engine establish and no more. The CSS Display
specification still warns that browsers get these semantics wrong, so this is
not a claim about every browser and screen reader. They are unnamed because a
form is exposed as a landmark only when it has an accessible name, and each of
these sits inside a dialog whose heading already names it, so naming the form
would announce the same group twice, a landmark inside a landmark. The forms
exist for submission, for Enter, and for autofill, which is what KN-463 was
asked for, rather than for announcement. Naming one is a single `aria-label`
away, measured to attach even with `display: contents`, if a reader ever
reports the grouping is lost.

### The Contact Modal and the panel modal

The Contact Modal, `270:152`, and the Job Modal, `210:276`, share a larger
frame than the shell: 560 wide for the contact, the header 24 above and at the
sides and 16 below, **dividers edge to edge**, the body in 24 with 16 between
fields, and the footer in 16 and 24; the code calls it the panel modal. The
Add/Edit job modal, `166:82`, uses the shell. The contact's fields, in the
file's order from the inline start: «اسم و فامیل», then «سمت» beside «شرکت», then
«ایمیل» beside «شماره تماس», each pair half the row, then «لینک شبکه اجتماعی», and
the Select of the job opportunity the contact belongs to, which the file calls
«آگهی مربوطه» and the code «فرصت شغلی مربوطه», KN-329. Add ends with Cancel and
Save at the inline end; Edit fills from the record and moves them to the inline
start, «حذف مخاطب» taking the end, as the file's Edit draws it. A contact saves
with a full name alone, KN-071, so the name is the only field that can be in
error. The form starts again on opening and on another record's id, never on
a fresh copy of the same record, KN-347. KN-031.

### The Contact Card

Node `248:116`, Full and Compact, each Default, Hover and Selected. **Full** is
360 wide: 24 of padding, 12 between rows, radius lg, one pixel of
`border/default`; a title row of 30 with the name, 16 at SemiBold composed as
the Empty State's title is, and at its other end a 24 square delete; the role
and company in `text/secondary` joined by « · »; a divider; then email, phone,
the linked job opportunity written «company — title», and LinkedIn in
`text/brand`, each row its 16 icon in a 20 box at the inline start and its
value at the other end. Hover draws one and a half of `border/focus` and brings
the delete and the Checkbox into the row, the name moving over by 28, as the
set's description says; Selected adds `bg/brand/container`. At rest the two
fold to no room and fade rather than leave the layout, so Tab meets the
checkbox, the name and the delete in the order they are drawn, as on the job
card, KN-341. **Compact**, for
the phone, is a row of 12 padding and gap, radius md: a 40 avatar in
`bg/brand/container`, the name at 14 and 500 over the role at 12 and 400 on
CSS's normal line height, and the mail and delete Icon Buttons; its Hover adds
a shadow of its own, `elevation.contactCardHover`. Email and phone are mailto
and tel links, LinkedIn opens in a new tab, a field the contact lacks draws no
row, and every value is cut with an ellipsis. The name is the card's button,
stretched over the card, so a press anywhere else opens the contact. The
Checkbox keeps its ring whole in the Title Group, which clips nothing, KN-293.
KN-026.

**Read again in the original on 2026-11-04, and retired**, KN-802. Every
variant is drawn as the copy drew it but for two things: the Full card's delete
is now an instance of Contact Delete Button, drawn the same, and the Compact
card's mail is the Icon Button at Tone=Primary round the mail icon, where the
copy put Tone=Neutral round the trash; the code's compact mail takes Primary,
whose hover is `bg/brand/container` under `text/brand`. The handoff lists the
Contact Card and the Contact Delete Button among the components no screen uses:
the network page draws Contact Row, `1056:2872`, KN-770, and the job modal's
people tab Related Person, KN-773. KN-844 removes the card once the network
page and the people tab draw those, KN-821 and KN-816.

**A phone chooses a person with a held press**, KN-533. The phone's network,
`252:411`, draws the full card, and its cards press to Mobile Selection,
`305:1842`, over a Smart Animate of 250 ms, the job card's press of KN-428. So on a
phone a press on the card's own button, held 500 ms within 10 pixels, chooses the
person; while anyone is chosen every card shows its Checkbox, unchecked on those not
chosen, as the Checkbox `204:11` says, so a second is chosen with a tap; a tap
still opens the contact, and the click a hold's release sends opens nothing. The
phone's card has no hover, which a tap would leave behind, and its Checkbox and
delete unfold while the focus inside is the keyboard's. Mobile Selection draws the
Bulk Action Bar of Type=Contacts 24 above the foot, in the tab bar's place.

### The grouped status picker

**Status Picker / Grouped**, `636:6417`, read on 2026-11-04, sets its label
«وضعیت» 12 on 19 at Medium in `text/secondary` and its two captions 12 on 19 at
Regular in `text/disabled`, `groupedPickerLabel` and `groupedPickerCaption`,
none bound to a style: a column 10 apart, «در جریان» over the stages, Status
Choices 8 apart both ways that wrap, ended by the Add Stage chip; a divider of
`border/default`; and «بسته‌شده» over the four outcomes, «پذیرفته‌شده» in the
custom-1 pair, «رد شده», and «بی‌پاسخ» and «انصراف» in the new pair's greys. Its
description: the stages can be customised and the new stage chip always makes
one; the outcomes are fixed. The code makes each row a radio group named by its
caption, the two sharing one name, so the browser keeps one choice and one Tab
stop across both, inside a group named «وضعیت»; the arrows move across both
rows the way they point, KN-301, and the add chip follows the stages' group
rather than sitting in it, KN-338. It replaces the flat Status Picker wherever
the redesign draws a status choice. KN-751.

### The add modal's status trigger

**Status Select / Footer**, `1257:3315`, Value by State, Default, Hover and
Open, read on 2026-11-04: the status of a job opportunity being added, in the
add modal's footer at the inline start, the buttons at the other end. A field 44
tall that hugs its width, `bg/surface` at radius md, 16 at the sides and 8
between: «وضعیت:» in Body `text/secondary`, the chosen status's small Status
Chip and the chevron at 20 in `text/secondary`; its edge one pixel of
`border/default`, `text/secondary` on Hover and `border/focus` while Open. Open
draws a menu of `bg/surface` at radius lg, 12 round, an edge of
`border/default` and Elevation/Modal, holding the grouped picker without its
«وضعیت» line, its inline start at the field's; the file lays it over the field's
top, and its description says it opens upward, so the code opens it 4 above, the
Select's 4 turned upward. A choice closes it and hands the status over, the add
chip closes it and asks for a stage, Escape and a press outside close it, focus
back on the field; the keyboard draws two of `border/focus` inside, as the
Select's field does, and the hover edge only where there is hover. KN-752.

### The Status Picker, its choices and the Status Control

The **Status Choice**, `427:567`, is the medium Status Chip in a shell of 4,
radius full, ringed two pixels inside: none at rest, its `bg/surface` stroke
being invisible on the surface it sits on, `border/default` on Hover and
`border/focus` when Selected. The **Status Picker**, `427:592`, puts «وضعیت», the
Label role in `text/secondary`, 8 above a row of choices that wraps, 8 both
ways, each item at the top of its line, and ends it with the dashed «+ افزودن
وضعیت», 28 tall, `text/brand`, a 16 plus in `text/secondary`, one pixel of
`border/default` dashed 4 and 3, which CSS draws with its own dash. The choices are one radio group,
which the add chip follows in the row from outside, KN-338: Tab reaches the
chosen one and the arrows move and choose, the Color Picker's way; the
keyboard's choice takes the three pixel ring, told from Selected's two
by its width. The file uses it in the add form and the Change Status modal.
Both were read again in the original on 2026-11-04, KN-786: the choice is drawn
as the copy drew it, its set narrower only because its example chip now says
«مصاحبه» on the interview colour where the copy said «پیشنهاد کار»; the picker
is too, but its add chip says «افزودن وضعیت» where the copy said «وضعیت تازه»,
as the board's add column says, and the status it makes is still named «وضعیت
تازه». The handoff lists the flat picker among the components no screen uses:
Status Picker / Grouped, `636:6417`, replaces it, KN-751, and the code's flat
one goes once the add form and the Change Status modal draw the grouped one,
KN-817 and KN-789, by KN-842; the Status Choice stays, inside the grouped
picker.

The **Status Control**, `199:21`, is the clickable wrapper the job modal puts
round a chip that stays display only, read in the original on 2026-11-03,
KN-797: its description says it left the card when the board became columns,
since the column is the status, so its one use is the job modal's header. Its
example chip now says «مصاحبه» on the interview colour, 86 wide, where the
copy put «پیشنهاد کار» on it at 102; the drawing is the copy's: a pill 32 tall, `bg/surface`
with one pixel of `border/default`, 4 round the small chip and 8 beyond a 14
chevron, which is none of the icon sizes and is drawn at 14. Hover takes
`bg/surface-secondary`; Pressed, which it shows while the picker is open, takes
it too with one and a half of `border/focus`. It opens the Change Status modal,
`150:93`, as the file draws it over the job modal at `377:6244`: a named dialog
that opens with focus on the chosen status, where a choice waits until Confirm
and Cancel or Escape change nothing, focus back on the control either way. A
panel of 372 stood in for the modal until KN-028 built it; KN-337 replaced it.
KN-020.

### The Sort Control

Node `408:512`: a control 36 tall of radius md with one pixel of
`border/default` inside and no fill, 12 of padding and 8 between its parts,
from the inline start the 16 sort icon, «مرتب‌سازی:» in Body `text/secondary`,
the order at Label's weight in `text/primary`, and the 16 chevron. Hover takes
`bg/surface-secondary`; Open takes it too with one and a half of `border/focus`.
Its menu, `447:601`, is the Options Menu at 240, **6** below the control where
the Select's is 4, hanging from the control's inline end, with the four orders
of section 3 as Option Rows. The set draws no Focus, so the keyboard's is the
Select family's two pixels. A change is read out once, by the control focus
comes back to, which then shows the order chosen, and not again by a status
region. KN-024 and KN-336.

### The Menu and its items

Node `512:8350`: fixed at 220, `bg/surface`, one pixel of `border/default`
inside, radius md, 4 above and below its items, `Elevation/Card`. Its items,
`181:22`, are 40 tall with 12 of padding, Body at Regular, where the Option
Row's names are Medium: Default `text/primary`, Hover `bg/surface-secondary`,
Disabled `text/disabled`, Destructive `text/error`, and, read in the original on
2026-11-03, Destructive Hover, `961:2491`, `red/100` under `text/error`, into
which the Destructive item now hovers, KN-793. Both menus end with their
delete after a one pixel divider, so a destructive item is told apart by its
place and its verb as well as its red. The menu opens instantly, hangs from its
trigger's inline end, closes on Escape or a press outside, and gives focus back
to the trigger. The file draws no focused item; the keyboard's takes its hover
fill, the grey or the red, and the three pixel ring drawn inside. KN-018.

**Type=Status** is the column's menu: «تغییر نام», «تغییر رنگ», «حذف وضعیت». Delete
blocked, `259:295`, is the Disabled item with the reason in a Tooltip beside the
menu at its inline start, 10 from it, KN-335; the item stays in the keyboard's
path so the reason can be read. Change colour replaces the menu with the Color
Picker in its place,
`259:184`. **Type=Card** is a job opportunity's menu on a phone: «تغییر وضعیت»,
«باز کردن لینک آگهی», and «حذف فرصت شغلی», which the original labels it, read
on 2026-11-03, KN-795; the copy said «حذف آگهی», which the code never did, under
the terminology rule, KN-329. A posting without a link has no link item. The
blocked delete's reason, Tooltip `410:469`, reads «این وضعیت ۳ فرصت شغلی داره؛
برای حذفش اول باید فرصت‌های شغلی رو ببرید یه ستون دیگه.», its verb plural in the
original where the copy's was «ببری».

### The job card

Node `137:44`, desktop, in six states, and `491:751`, the phone's, Default and
Selected. The desktop card is 400 by 148: 24 of padding, 4 between rows, radius
lg, one pixel of `border/default`; a title row of 30 with the title, 16 at
SemiBold composed as the Empty State's is, and the 16 link icon when the posting
has a link; the company in Body `text/secondary`; and 16 below it a meta row of
28 with the date at 12 and 400, which the page hands over already said, in
numbers as the file writes «۲ روز پیش», where Persian's own wording would say
«پریروز». **Hover** draws one and a half of `border/focus` with `Elevation/Card`
and brings the Checkbox before the title, which moves over by 28, and a 24
square delete at the other end, over the reaction's 200 ms. The file hides both
at rest, and a hidden layer gives up its room, so the code folds them to none
and fades them rather than removing them: they stay in the keyboard's path, and
Tab meets the Checkbox, the title, the link and the delete in the order they are
drawn. **Pressed** takes `bg/surface-secondary` at the resting edge, at once.
**Selected** takes `bg/brand/container`, the lifted edge and the card's shadow,
with the Checkbox checked and the delete in view. **Static** is the card at rest
with nothing to press but the link. **Focus** is two pixels of `border/focus`
and a halo of its own, `elevation.cardFocus`. The phone's card is 358 by 141: no
hover, a title row of 32 whose three dots, a 32 Icon Button, stay in view and
open the Card menu, the Checkbox while the board is selecting, below, and a meta
row of 19, the date's own line in the file, which the web font's normal line
height would make 16. The stripe, `358:430`, is 4 wide at the card's inline start
in the status's base colour; a status the board no longer has takes `new`'s. The
title is the card's button, stretched over the card, so a press anywhere else
opens the job opportunity; a button takes the browser's font rather than the
page's, so the title's is given back. KN-015.

**A phone starts a selection with a held press**, KN-428. The file says so in its
words and its prototype: Card / Mobile `491:751`, «انتخاب گروهی با نگه‌داشتن روی
کارت فعال می‌شود»; the Checkbox `204:11`, a long press on a phone turning
selection on and the Checkbox appearing on every card; the prototype map
`384:17`; and every phone card on `241:146` pressing to Mobile Selection
`243:325`, Smart Animate, ease in and out, 250 ms, and clicking to the job modal.
So a press on the card's own button, held 500 ms within 10 pixels, selects it,
and while any card is selected every phone card shows its Checkbox, unchecked on
those not chosen, over the press's 250 ms. A tap still opens the job
opportunity, the click a hold's release sends opens nothing, and the next press
clears that mark, so a release that sends no click cannot swallow the tap after
it. At rest the phone's Checkbox folds to no room and fades, in the keyboard's
path, unfolding while the focus inside the card is the keyboard's; a hold starts
no text selection and no callout. What is read and what is chosen: `243:325`
draws its cards at rest under a bar counting two, so it shows the bar, not the
cards; 500 ms and 10 pixels are chosen values, since the file gives the gesture
no numbers and neither platform offers the web a default; the `contextmenu` a
phone's browser may send for its own long press is taken as the hold. The
desktop's rule is unchanged: `243:433` draws only the chosen cards Selected.

### The card's footer

Card / Kanban, `793:1820`, says in its description what a card's footer says,
and the handoff's پاورقی کارت repeats it, read on 2026-11-04. The saved column
counts down to its deadline, the clock leading: more than three days left, «N
روز مهلت» in grey; three or fewer, the same in red; the last day, «امروز آخرین
روزه», red; after it, «مهلتش تموم شد», grey with no number. Without a deadline it
says «امروز ذخیره شد» or «N روز پیش ذخیره شد», grey, with no icon and no pencil.
Applied, interview and offer count «N روز از درخواست», and a closed outcome says
«بعد از N روز بسته شد», from applying, or saving when it was never applied, to
the day it closed. A large number is said more simply, «۱ ماه و نیم مهلت»: from
30 days, months and half months, rounded down so time left is never overstated.
The pencil edits the deadline or the application, never the day it was saved.
The file says nothing of applying or closing on the day, which say «امروز
درخواست شد» and «همون روز بسته شد». `cardFooter` in `shared/job-card` is this, a
function of the dates and today, proved at every boundary, KN-744.

### The kanban column

Node `241:125`, a frame on the board screen rather than a component: 300 wide
and the board's height, `bg/surface-secondary`, radius lg, 12 of padding and 8
between its parts. The header, `241:126`, is 40 tall: 4 of padding above and at
the sides and 8 below, the Size=M Status Chip, with the count 8
after it at 12 and Medium in `text/secondary`, in the reader's digits where the
file writes «3», and at its other end the 16 more icon that opens the column's
Menu, `259:2`. The code puts the 32 Icon Button there, giving back two above and
below and eight at either side, so it lays out as the file's icon and stays 8
from the count however long the name. The cards follow 8 below and scroll
between the header and the Add Card row, `241:142`, pinned at the bottom: 36
tall, `bg/surface` with one pixel of `border/default` inside, radius md, a 20
plus in `text/brand`. An empty column, `241:46`, says «هنوز فرصت شغلی‌ای تو این
مرحله نیست» at 12 and 400 in `text/secondary`, centred in a box 80 tall of radius
md dashed in `border/default`, 4 and 4 in the file and CSS's own dash here. The
phone's column, `241:176`, is its cards alone, 16 of padding and 12 between
them, the status being chosen by the filter chips above it. The Add Column tile,
`241:34`, is 220 by 120, dashed 6 and 6 in `border/default`, radius lg, a 20 plus
8 above «افزودن وضعیت» at 12 and Medium, both in `text/secondary`. The file draws
no hover for Add Card or Add Column, and none is added.

**What a column says when a search empties it, and what its count counts.** The
count is the status's OWN total and never the search's: KN-422 made it so after
a searched count of zero enabled Delete and took the hidden job opportunities
with it, and it stays so. The MESSAGE is the half that answers the search. A
status holding nothing says «هنوز فرصت شغلی‌ای تو این مرحله نیست»; a status
whose job opportunities the search is hiding says «چیزی با این جستجو تو این
مرحله نیست», in the same box `241:46`. So `241:2` drawing the count `1` at
`241:43` beside that empty frame is not a mismatch to be filed again: the
file's counts are the statuses' totals, while the cards drawn are a sample with
a `Column Spacer` standing in for the rest. The owner settled this on
2026-09-17, the file being silent on it: the Search Empty frame `305:1547` is a
structural copy of the Empty frame `305:1696`, down to which single column
carries the message, so the «۰» in both says nothing about what a count counts.
KN-389.

**Collapsed, the author's reading, not drawn in the file.** The owner's rejected
column, `رد شده ▸ 14`, is the column's frame holding its header alone, 300 by 64:
one button with the chip, the count and a chevron where the menu's icon was,
which says it is closed and opens the column. It keeps the column's width so the
board's rhythm and the drop target stay. The board decides which column starts
that way. KN-060.

**Folding it again, the author's reading too.** A column the board starts folded
keeps a way to fold once it is open: the same 16 `chevron-down` its collapsed
header shows, inside a button holding the chip and the count, 8 from what sits
either side of it as everything in that row is. It cannot have the place the
collapsed chevron has, the header's end, because the menu is there while the
column is open. **No other column has one at all.** A header that folds on a
press nobody can see coming hides a reader's work by accident, and the board
passing this to every column is what the owner met. KN-493.

### The brand mark

`576:7665`, read on 2026-11-03 from the original file: a K made of a capsule
and two leaves, 32 by 32 and no other size, one variant. Its exported asset is
three paths, the capsule and the upper leaf filled `color/bg/brand/default` and
the lower leaf `color/gray/200`, the two variables `get_variable_defs` names on
the node. The code keeps the asset's geometry exactly and takes both fills from
the theme, so the derived dark palette reaches the mark, KN-742. It is
decoration beside the product's name, and a mark has no direction, so it is
never mirrored. The Brand Row, at the sidebar's top and on the sign-in card,
`407:6953`, draws it with the name 8 after it, in place of the name's first
letter on a blue square that the old copy drew. The lower leaf is quiet by
design, 1.24 to 1 on white in the light scheme; the derived dark one keeps that,
1.33 to 1 on the dark sidebar, measured 2026-11-03, and a mark is exempt from
the contrast minimum.

### The action chip and the inline link

Read on 2026-11-03 from the original file, for the interview slot's question.
**Chip / Action**, `961:98854`, Default and Hover: 27 high, an edge of one in
`color/border/default` round `color/bg/surface` at rest, `color/text/secondary`
round `color/bg/surface-secondary` on hover, the label 12 on 19 at Medium in
`color/text/brand` on one line, Figma's automatic line, which CSS's normal makes 18, 3 above and below and 8 at the sides, corner 6;
the 3 and the 6 bind to no variable and are named in the code, KN-746.
**Link / Inline**, `961:98862`, Default and Hover: 12 on 19 at Regular in
`color/text/secondary`, underlined at the font's own position, one line, no box;
its Hover draws exactly what its Default does, so nothing changes on hover.
Neither draws a focus, so the chip takes the Icon Button's ring, three in
`border/focus` inside the edge, and the link a three pixel outline round it.

### The add stage chip

**Add Stage**, `961:101245`, Default and Hover, read on 2026-11-03, its label
13 on 22: the dashed «+ افزودن وضعیت» that ends the grouped picker's open stages.
A pill 126 by 30, an
edge of one in `color/bg/brand/default` dashed 4 and 3 in the file and CSS's own
dash here, counted in the layout; 3 above and below and 12 at the sides; the
Icon set's plus at 16 and, 4 after it, the label at Medium, both in
`color/text/brand`; Hover fills it with `color/bg/surface-secondary`. The plus
leads the label, on its right in Persian. Keyboard focus is the three pixel
ring in `border/focus` inside the edge, which the file does not draw, KN-750.

### The add-a-person row

**Add Contact**, `961:101547`, Default and Hover, read on 2026-11-03, its label
14 on 22: the dashed «+ افزودن نفر» that ends the related people. As wide as
what holds it, 672 in the file, and 46 high: an edge of one in
`color/border/default` dashed 6 and 4 in the file and CSS's own dash here,
drawn inside and out of the layout; `radius/md`; `spacing/sm` above and below;
the plus at 16 leading the label at Medium, both `color/text/brand`, centred and
`spacing/xs` apart; Hover fills it with `color/bg/surface-secondary`. Keyboard
focus is the three pixel ring inside the edge, which the file does not draw,
KN-765. It replaces the job modal's «+ افزودن مخاطب» when the related people
tab is rebuilt.

### The icon button's label tooltip

**Tooltip / Label**, `1123:56919`, read on 2026-11-03, one component with no
variants: an icon-only button's name on one line, `color/text/primary` under
`color/text/on-accent`, `spacing/2xs` above and below and `spacing/xs` at the
sides, `radius/sm`, no shadow, 23 high. Its text, `1123:56920`, is bound to no
text style, 12 on 15 at Regular: the file sets it in Inter on Inter's automatic
line, and Inter has no Persian letters, so the product's one family draws it on
that 15, which keeps the frame's height. In dark the text follows its fill, as
the Tooltip's does, KN-398. The spec beside it, `1123:57071`, gives its rules:
every button that has only an icon names itself with it on hover or keyboard
focus of the button itself, never of the whole row; above the button, centred,
4 away, and below it when there is no room; it opens after about 300 ms, the
next one too, and closes at once, with no motion either way, since the file
draws none; its text is the button's aria-label, so it names nothing new. The
Icon Button carries it, so the network row's, the related people tab's and the
person window's buttons the spec draws it over get it when they are built,
KN-777. Four icon buttons still sit in the old Tooltip, whose description wins
there so two tips never show: the shell's settings, sign out and language, and
the network page's add. The handoff draws none of their tips, so the sidebar's
and the network page's cards take them off.

### The period switch

**Stats / Period Switch**, `1236:3207`, Value=روزانه and Value=هفتگی, read on
2026-11-03: daily or weekly for the Stats page's applications card, with no
monthly, the decision of 1 Aban. A row 32 high on `color/bg/surface-secondary`,
`spacing/2xs` round it and between its options, `radius/md`; each option 24
high, `spacing/2xs` above and below and `spacing/sm` at the sides, round
`radius/sm`, its word in Label, the chosen one on `color/bg/surface` in
`color/text/primary` and the other with no fill in `color/text/secondary`;
daily at the inline start. The file draws no hover and no focus, so there is
no hover, and keyboard focus is the three pixel ring inside the pill, KN-782.
The file binds the unchosen word to `color/text/secondary`, which axe measures
at 4.39 to one on the track, under the 4.5 a 12 pixel word needs, so the word
is `color/text/secondary-strong`, the handoff's colour for text on
`color/bg/surface-secondary`, KN-730.
It is a native radio group, as the Color Picker's is, one Tab stop with the
arrows moving and choosing, KN-301. Daily for the first four weeks from the
first application and weekly after is the page's default to give it, as is
what each period draws, which DESIGN-HANDOFF.md's Stats rules set.

### The popover's close

**Popover / Close**, `848:2247`, State=Default and State=Hover, read on
2026-11-03: the Icon set's `x` at 16, its stroke of 2 in `color/text/secondary`,
centred in a square with a radius of 6 that binds no variable; no fill at rest,
and `color/bg/surface-secondary` on hover, into which Default's prototype
hovers. A press closes what it sits on without a change. The date popovers draw
it at 22, every redesigned modal's header at 20, and the Search Bar's Filled
clear at 16, the cross 16 at every size, so the code takes the size from its
caller, 22 by default. The file draws no focus, and a ring inside a square this
small would cover the cross, so keyboard focus is the product's outline, two of
`color/border/focus` at an offset of two, KN-244. It is an icon-only button, so
it names itself with Tooltip / Label, KN-837 and KN-777.

### The Search Bar

**Search Bar**, `155:92`, Default, Focus, Filled and Hover, read in the original
on 2026-11-03: 320 by 44 on `color/bg/surface`, `spacing/md` at the sides and
`spacing/xs` between its parts, `radius/md`, an edge of one inside in
`color/border/default` and two in `color/border/focus` while focused; the 20
search icon at the inline start, the text in Body, the hint in
`color/text/secondary` and what is typed in `color/text/primary`. Two things
are new to the redesign, KN-791: **Hover**, the Default with its edge in
`color/text/secondary`, which focus overrides, and **Filled's clear**, Popover /
Close at 16 in a 20 frame at the inline end, where the copy drew the x alone,
so it is the close's square of radius 6 with its grey hover and its name label,
KN-837. The board's and the network page's toolbars draw the bar 36 high,
KN-315.

### The company logo

**Company Logo / placeholder**, `620:3684`, read on 2026-11-03: a square of 36
on `color/bg/surface-secondary` at a radius of 8 that binds no variable, the
same as `radius/md`, centring the Icon set's `building` at 18, which is none of
the icon sizes, its stroke of 2 in `color/text/disabled`. Beside it the file
draws six named logos, digikala, bazaar, snapp, alibaba, torob and tapsi,
`620:3637` to `620:3679`, each a company's own drawing in the same square, and
the redesigned card takes one at its head. The owner's answer of 2026-11-03 is
that a logo is fetched from the company's own website, else from its LinkedIn
page, and where neither has one the default organisation icon is shown, as
LinkedIn shows one; the fetching is KN-830's. So the named logos are what a
fetched logo looks like in the square, its image covering it at the same
radius, and the placeholder is the default organisation icon, drawn as well
when a logo fails to load. The edge of `color/border/default` the file gives
torob's alone belongs to that white drawing, so a fetched logo is drawn as it
comes. Either way it is decorative, since the card writes the company's name
beside it, KN-743.

### The interview result popover

**Popover / نتیجهٔ مصاحبه**, `844:85811`, one component, read on 2026-11-03:
«نتیجه چی بود؟», `844:85812`, 14 on 22 at Medium in `color/text/primary`,
bound to no text style, 12 over a row of Status Choices that wraps, 8 both
ways, from the inline start: پیشنهاد کار on the offer pair, پذیرفته‌شده on
custom-1, رد شده on rejected and انصراف on new, each at Default and hovering
into Hover. It is the redesign's popover panel, which the two date popovers,
`755:22108` and `774:16705`, draw too: 369 wide here and 276 there,
`color/bg/surface` with one pixel of `color/border/default` inside that the
file counts in the layout, 16 of padding and 12 between the parts, neither
bound, a radius of 10 that is none of the scale, and `elevation.popover`; the
code's `popoverPaper`. Its description says it opens under the card after
«نتیجه گرفتم» on an interview's card and a press outside closes it; it offers
only what can follow an interview, the four and any stage the reader made
after interview, which the board works out, KN-731; one press applies, a
closing outcome sending the card to its strip with the undo message and an
offer to the offer column. No screen places it and no prototype opens it, so
it hangs from the card's inline start, 4 below it, as the column's menu hangs
from its trigger, and opens at once. A choice applies at a press, so each is a
button rather than a radio, with the Status Picker's hover ring and its three
pixel keyboard ring. MUI's Popover holds focus inside while it is open,
starting on the panel, since a choice focused as it opens wears the keyboard's
ring even when a pointer opened it, closes on Escape too, and gives focus back
to what opened it. A named dialog: its title labels it. KN-748.

### The time list

**Date Picker / Time Item**, `786:1753`, Default, Hover and Selected, read on
2026-11-03: a row 32 tall with 10 at its sides and a radius of 6, none bound,
its time at the inline start in 13 on 20, Figma's automatic line, with no
letter spacing; Default has no fill and `color/text/primary` at Regular and hovers
into Hover, the same on `color/bg/surface-secondary`; Selected is
`color/bg/brand/container` with the time in `color/text/brand` at Medium.
**Date Picker / Time List**, `774:16897`, is the redesign's popover surface,
244 wide, 6 inside it and 2 between its items, neither bound, showing six,
۰۹:۰۰ to ۱۱:۳۰ with ۱۰:۰۰ chosen. In the calendar popover's Time List=Open,
`780:44558`, it hangs 4 under the time field at the field's width, 242. The
handoff gives the time only in the interview's calendar, from a half-hour
list, so it holds the 48 half-hours of a day in the reader's digits, two of
each, a window of six that scrolls with no bar since the file draws none, and
opens with the chosen time third, as the file shows it, or on ۰۹:۰۰ with none
chosen. It is a listbox on MUI's MenuList: the arrows, Home and End move,
Enter chooses, and told to it puts focus on the chosen time as it opens; the
keyboard's row takes the Hover fill and the three pixel ring of the Select's
rows. KN-755.

### The board's add links

**Board / Add Card Link**, `961:95525`, Default and Hover, read on 2026-11-03:
a row the cards' 276 wide and 36 tall, 8 above and below, 12 at the sides and
6 between, a radius of 8, none bound; the set's plus at 16 leads «افزودن فرصت
شغلی» in 13 on 20 at Medium, both in `color/text/secondary`, and Hover fills
it with `color/bg/surface-secondary`. Its description puts it right after a
column's last card, opening the add modal with the column's status, so its
name is «افزودن فرصت شغلی به» and the column's name, beginning with the words
it shows. **Board / Add Status Column**, `961:95530`, Default and Hover: 300
by 50, a stage column's width, an edge of one dashed 5 and 4 in
`color/text/disabled` counted in the layout, 13 above and below, 16 at the
sides and 8 between, a radius of 16, none bound; the plus at 18, none of the
icon sizes and drawn from the set's geometry, leads «افزودن وضعیت» in
14 on 22 at Medium, both in `color/text/secondary` and centred, and Hover fills it
with `color/bg/surface-secondary`. Its description: an empty column that makes
a new stage, always beside the open stages. The file draws neither a focus, so
each takes the Add Stage's ring, three of `color/border/focus` inside. They
replace the old file's Add Card, `241:142`, and Add Column, `241:34`, which
the board still draws until KN-805 builds it from the redesign. KN-758.

### The toast

**Toast / Action**, `956:3193`, Default and Hover, read on 2026-11-03: «لغو» in
13 on 20 at SemiBold in #93C5FD, which no variable carries, so it is
`text/brand-inverse`, the handoff asking for a token; Hover underlines it. No
frame uses the component; the frames draw the whole message, the Toast at
`717:12416` and its copies in `1062:54408`, its message in 13 on 20 at Regular
in `color/bg/surface` at the inline start and the action 16 after it, on a pill
of `color/text/primary` that hugs them, 12 above and below and 16 at the
sides, a radius of 12, none bound, with `elevation.toast`. Shown, it sits 24
above a desktop frame's foot, centred over the page beside the 240 sidebar; the
other copies sit below the frame, where it rises from. On a phone, where no
frame draws it, it sits 24 over the tab bar. The handoff gives the rest: a
message with a button stays 5 seconds and «تغییرات ذخیره شد» 3, it comes in
over 250, and none of that motion runs for a reader who asks for less; its
button is «لغو». MUI's Snackbar keeps the times, holding while the pointer or
focus is on it, and closes on Escape; a press elsewhere leaves it, so the undo
stays to hand. Its message is spoken from a status region that stays in the
page and is written 100 after the toast opens, KN-326, so the pill's copy is
hidden from a screen reader and the action is named with the message, «لغو:»
and what it undoes. In dark the pill turns light with its words dark on it,
both at 4.5 to one or more. The board writes the messages and decides where
focus goes after an undo, KN-805. KN-764.

### The paste step's field and its manual link

**Paste Field**, `961:101573`, Default and Hover, read on 2026-11-03: a field 512
wide and 54 tall, the 22 of one line with `spacing/md` round it,
`color/bg/surface` at `radius/md`, one pixel of `color/border/default` inside
and out of the layout, which Hover draws in `color/text/secondary`; its
placeholder «لینک یا متن کامل آگهی رو اینجا بذارید» at 14 in
`color/text/secondary`. In place, the Field Wraps of `166:82` stack it 4 under
«لینک آگهی یا متن کامل آگهی» at 12 on 19, and 4 over the helper «هم لینک، هم
متن کامل آگهی؛ لازم نیست چیزی رو جدا کنید.» at 14 on 22 in
`color/text/secondary`, or the reading's failure in `color/text/error`; filled,
`371:422`, a link keeps it one row. The code's `PasteField` is the Input of
several lines asked for one row, `minRows`, growing with what is pasted to the
Input's eight; its resting edge is the owner's `border/control`, since an empty
field is found by its edge alone, KN-275, and its focus the Input's two of
`border/focus`, which the file does not draw. **Manual Path Link**,
`961:101603`, Default and Hover: «لینک یا متن آگهی ندارید؟» at 14 on 22 in
`color/text/secondary` and `spacing/2xs` after it «ورود دستی» at Medium in
`color/text/brand`, underlined on Hover; a button, since it turns the flow to
the empty form, with the product's outline for the keyboard. The add modal
takes both in KN-817, where the old copy, «لینک آگهی را بچسبان…» and «خودت دستی
وارد کن», goes. KN-766.

### The related person

**Related Person**, `1096:3109`, Default and Hover, read on 2026-11-03: the job
modal's related people row, 672 by 60, 12 above and below, 16 at the sides and
12 between, on `color/bg/surface`. From the inline start the name in Title and
«سمت · شرکت» in Label in `color/text/secondary`, 40 together, which reach 2
into the padding of a row the file fixes at 60; the person's tag in a chip of
`color/bg/surface-secondary`, 4 and 8 round its Label; and at the inline end
three Icon Buttons 4 apart, from the row's end «برداشتن از این فرصت شغلی» with `link-off` at
Tone=Neutral, «کپی ایمیل» with `mail` and «کپی شماره» with `phone` at
Tone=Primary, drawn at no opacity. Hover fills the row with
`color/bg/surface-secondary`, lifts the chip to `color/bg/surface` and shows
the buttons. **Related Person / Mobile**, `1313:3295`, is 358 wide and hugs,
its items at the top, the chip 4 under the role, the buttons always shown,
since a phone has no hover. Unlinking leaves the person in the network, as the
description and the handoff say. The code shows the desktop buttons on keyboard
focus inside the row too, and always where there is no hover; it draws a copy
button only when there is a value to copy; and the row is a group named by the
person, so each button is heard with whose it is. A copy writes to the
clipboard and tells the caller, which says so with the toast, KN-764; a refused
clipboard says nothing. KN-773.

### The stage delete modal

**Modal / Delete Status**, `919:2885`, Cards=None and Cards=Has, read on
2026-11-04: deleting a stage the reader made, as its description says; the
default stages have no delete. The shell at 440, its title «حذف وضعیت «…»؟» with
Popover / Close at 20. Cards=None, 208 tall, says «این وضعیت از برد حذف می‌شه.
فرصت شغلی‌ای توش نیست.» in Body `text/secondary` above Ghost «انصراف» and
Destructive «حذف وضعیت». Cards=Has says how many job opportunities it holds and
asks where they go, «۲ فرصت شغلی توی این وضعیت هست. انتخاب کنید بعد از حذف کجا
برن.», with the Select «انتقال فرصت‌های شغلی به» 16 under it, filled, and
Destructive «حذف و انتقال». The code starts the Select on the first stage the
caller gives, turns Delete and move off while there is nowhere to move them,
counts in the reader's digits and plural, quotes the name in the reader's own
marks from the catalog, `quoted`, and gives Cancel the focus as it opens, as the
Confirm modal does; the close, Escape and the scrim cancel. KN-761.

### The unsaved changes modal

**Modal / Unsaved**, `893:3780`, read on 2026-11-04: one component with no
variants, asked when a modal holding unsaved changes is closed. The shell at
360, its header «تغییرات ذخیره نشده» with Popover / Close at 20, a divider,
«اگه بدون ذخیره ببندید، تغییرهایی که دادید از بین می‌رن.» in Body
`text/secondary`, a divider, and at the inline end, 12 apart, the Secondary M
«بستن بدون ذخیره» then the Primary M «ذخیره» at the very end, as its description
says. The × goes back to the modal, and so do Escape and a press on the scrim.
The code puts focus on Save as it opens, so Enter keeps the changes, where the
Confirm modal's Cancel takes it because there the first key must change
nothing. Its body is the Confirm modal's paragraph, the shell's `ModalText`.
KN-763.

### The company match

**Company Match**, `1096:3111`, read on 2026-11-04: one component with no
variants, at the top of the job modal's related people tab, where its one
instance, `1096:92316`, fills the tab's 672. A column that hugs its height, 88
with one person, on `color/bg/brand/container` at `radius/md`, `spacing/sm`
above and below, `spacing/md` at the sides and `spacing/xs` between its rows,
its items at the inline start. The title row: the `user-plus` at 16 in
`color/text/brand`, then «۱ نفر از دیجی‌کالا در شبکهٔ شماست» in Label in
`color/text/brand`, `spacing/xs` apart. The person, 40 tall: the name in Title
in `color/text/primary` over «سمت · شرکت» in Label in `color/text/secondary` at
the inline start, and at the inline end a Button / S Secondary «وصل کردن» whose
fill the instance sets to `color/bg/surface`. Connect links the person and the
box goes; with nobody, there is no box, as the description and the handoff say.
The code counts the title in the reader's digits and plural, Persian keeping
«نفر» singular; draws several people as a row each, `spacing/xs` apart, where
the file draws one; keeps `spacing/sm` between a person and Connect, where the
file's spacer has no least width, so a long name is cut before it reaches the
button; puts the icon at the top of the title, the same on one line, so it
stays on the first when a long company wraps; and makes the box a group named
by its title and each person a group named by them, so each Connect is heard
with whose it is. KN-774.

### The outcome strip

**Board / Outcome Strip**, `638:7928`, read on 2026-11-04, sets its name 13 on 20
at SemiBold and its count 12 on 19, Figma's automatic line, at Medium,
`outcomeStripName` and `outcomeStripCount`: a closed outcome after the board's
stages, one component drawn as «بی‌پاسخ» whose 427 instances on the board frames
give the four. A strip 88 wide the board's height, `bg/surface-secondary` at
radius 16, 18 above, 14 below and 8 at the sides, its parts centred from the top
6 apart: the outcome's icon at 20, the name, and the count in a pill 1 and 8
round it. Accepted, «پذیرفته‌شده»,
draws the `check`, the name and the count in the custom-1 pair's base and the
pill in its container; rejected the `x` in the rejected pair; no response the
`clock` and withdrawn, «انصراف», `log-out`, both in `text/secondary` on a
`bg/surface` pill. A press opens it into its column with a close, `1223:97610`,
the board's, KN-805. The code makes it a button named by its name and count, its
keyboard ring the three inside its edge the status tabs draw. KN-749.

### The stats number

**Stats / Number**, `1168:3159`, Status=Applied, Interview, Offer, Rejected and
NoResponse, read on 2026-11-03: the Stats page's first row, a card of
`color/bg/surface-secondary` at `radius/md` that fills its row, `spacing/sm`
above and below, `spacing/md` at the sides and `spacing/2xs` between its two
lines, at the inline start. A dot of 8, bound to no size, in the base of the
status's pair, `color/status/applied/base` and the others, and for NoResponse
`color/text/secondary`; `spacing/xs` after it the label in Body in
`color/text/secondary-strong`; under them the number in Heading/L in
`color/text/primary`, in the reader's digits. Its description: the dot is the
status's colour on the board and the number is black at one weight. The dot is
decoration, since the label says what is counted. The page writes the labels,
KN-823, and runs the first row's count from one on entry, KN-824. KN-778.

### The week bar

**Stats / Week Bar**, `1168:3183`, Current=No and Current=Yes, read on
2026-11-04: one bar of the Stats page's applications by week, 32 wide and 68
tall at the specimen, neither bound, a column at the bottom with `spacing/2xs`
between the count in Label, centred, and the bar, which fills the rest at
`radius/sm`; Current=No draws the count in `color/text/secondary` over
`color/bg/brand/container`, Current=Yes, this week, in `color/text/primary`
over `color/bg/brand/default`. The page sets each bar's height in proportion to
its count, the description says; the code never draws one under the count, its
4 and a pixel of bar, 21, so a week with none keeps a line. The bar only draws
the count, so a screen reader reads the count and the chart says what the bars
are, KN-823. MUI reads a size of 1 or less as a fraction of the parent, so the
pixel is written in pixels. KN-780.

### The source row

**Stats / Source Row**, `1223:1807`, Context=Card and Context=Modal, read on
2026-11-04: one source of the Stats page's applications, `spacing/md` between
its parts, all in Body. From the inline start the source in
`color/text/primary`, 140 wide in the card and 200 in the window of every
source; then a bar in `color/data/bar` at `radius/sm`, 12 tall, with its count
`spacing/2xs` after its end in `color/text/primary`; and the interviews centred
in a 56 column in `color/text/secondary`; none of the widths bound. The file
sets the bar's length with the area's padding against the largest source; the
code gives each bar its share of the largest applications of the room the bar
has, keeping 32 for the count, so the bars are in proportion, and a single
source, Show Bar off, has none. The card's row is centred on its line and its
name one line with an ellipsis, shown whole in Tooltip / Label under the
pointer when it is cut, as the description asks in code; the modal's row sits
at the top and its name takes up to three lines, as the description says,
where the file's text node is set to one. The bar is hidden from a screen
reader, which reads the count. KN-781.

### The stats guidance

**Stats / Guidance**, `1168:3170`, read on 2026-11-04: one component with no
variants and one text property, Message, the first child of each Stats frame's
Content, whose instances fill its 1200 less 32 at each side, 16 above the
requests card; the frames of a reader with one to nine applications draw none.
A row that hugs its height, 60, on `color/bg/brand/container` at `radius/md`,
`spacing/sm` above and below, `spacing/md` at the sides and `spacing/md`
between, its items centred: from the inline start the message in Body in
`color/text/primary`, filling the row and wrapping, and at the inline end its
Action, a Button / S Secondary «دیدن درخواست‌ها» with no fill of its own, so
the ground shows through it. Its description and the handoff: at most two at
the top of the page, made by a fixed rule from the reader's own data, never
«پیگیری کنید»; the first the applications unanswered for more than 21 days,
linking to them; the second, which has no frame and whose exact rule is open,
«این هفته هنوز درخواستی ثبت نکردید. ۵ فرصت شغلی ذخیره‌شده دارید.» with «دیدن
فرصت‌های ذخیره‌شده». The code takes the message and an optional action,
`{ label, onClick }` as the Toast's; the file has no property to hide the
action, so without one the message fills the row. The page writes the messages
and chooses them, KN-823. KN-779.

### The mobile status tab

**Tab / Status (Mobile)**, `1274:3275`, Default, Active and Add, read on 2026-11-04: a status of the mobile
board's row of tabs, 12 on 19 for its count and 13 on 20 for its name, both at
Medium, the name SemiBold when chosen, neither bound to a text style. A pill 36
tall at `radius/full`, one pixel of edge counted in the layout, 14 at the sides
and 6 between, none bound; from the inline start a dot of 8 in the status's
base, the name and the count. Default is `color/bg/surface` edged in
`color/border/default`, the name `color/text/primary` and the count
`color/text/secondary`; Active is `color/bg/brand/container` edged in
`color/text/brand` with both in it. Add is 38 by 36, 10 at the sides, dashed in
`color/border/default` round the set's plus at 16 in `color/text/secondary`.
Each tab is a tab of the row the board makes a tablist, KN-826, named by its
name and count, the chosen one the row's Tab stop; the add tab is a button
named «افزودن وضعیت»; the keyboard's ring is three inside the edge. KN-784.

### The Button

**Button / S**, `37:10`, **Button / M**, `33:58`, and **Button / L**, `37:71`,
read in the original and in the copy on 2026-11-04, KN-785: each has the same
25 variants in both, Primary, Secondary, Text, Destructive and Ghost by
Default, Hover, Pressed, Disabled and Focus, and every one measures the same:
S 36 tall with 12 at the sides and 4 between, a 16 icon and its label at 14 on
22; M 44 with 16 and 8, a 20 icon and Body; L 52 with 24 and 8, a 24 icon and
Title; all at a radius of 8. Only the icons' layer order changed, the original
putting the leading icon at the inline start in a right to left reading, where
the code's start icon already sits. The handoff lists Button / L among the
components no screen uses, so the code draws S and M, and L is retired.
The Company Match's Connect, `1096:3117`, is a Secondary S whose instance
fills it with `color/bg/surface` on its coloured ground; the Button's
`surface` fills a style that has no fill at rest with it, its hover and
pressed fills staying its own, KN-774.

### The navigation

The Nav Item, `184:14`: 208 by 44 in the sidebar, radius md, 12 of padding, the
20 icon at the inline start and 8 after it the label at 14 and Medium. Default
is `text/secondary` on nothing; Hover takes `bg/surface-secondary` over the
reaction's 120 ms, ease out; Active takes `bg/brand/container` with
`text/brand` and is announced as the current page. The file draws no focus; the
keyboard's is three pixels of `border/focus` inside the row.

The sidebar, `185:11`, is 240 wide and the screen's height, at the page's inline
end side, the right in Persian, `bg/surface` with one pixel of `border/default`
on the edge that faces the page: 24 above and below, 16 at the sides, 8 between
its parts. From the top: the Brand Row, a 32 mark of radius md in
`bg/brand/default` holding the name's first letter at 16 and SemiBold in
`text/on-accent`, then «کارنما» at 20 and SemiBold; the User Row, a 32 avatar in
`bg/brand/container`, the name at 14 and Medium over the phone at 12 in the
reader's digits; a divider; a 16 spacer; «فضای کار» at 12 and Medium, which the
file draws in `text/disabled`, 2.54 to one on the sidebar's `bg/surface`, under
the 4.5 WCAG asks of text that size; it is information rather than an inactive
control, and the accessibility decision of 2026-09-16 set that bar, so the build
departs from the node and draws `text/secondary`, the existing token that meets
it here at 4.83, KN-666; the three destinations; the room the file leaves; the language
switch, settings and «خروج», the file's `log-out`, as one row of Icon Buttons,
the shell's own controls, the owner's instruction of KN-478 over the file's
«خروج» Nav Item, the first centred on the items' icon column. Before
anyone signs in, the user and «خروج» are left out.

The tab bar, `185:19`, is the screen's width and 72 tall, `bg/surface` with one
pixel of `border/default` along the top: the same three destinations in equal
thirds, the board at the inline start, each a 24 icon 4 above its label at 12
and Medium, `text/secondary`, or `text/brand` for the current page. Nothing else
joins it. Below MUI's md, 900, it replaces the sidebar, pinned to the foot of
the screen, and the page keeps its 72 clear; the file says it gives way to the
Bulk Action Bar while selecting, which is the board's to do. KN-027.

The add flow is a modal over the board, so while it is open the board stays the
current page in both, as `243:814` and `243:682` draw it, KN-481.

**Where focus goes when the screen changes.** The shell's page region takes it.
That region is the `main` element, it outlives every route change while the
screen inside it is replaced, and it carries `tabIndex={-1}` so it can be
focused on purpose and never reached by Tab. The case this is for was measured,
KN-473: with a delete confirmation open on the board, the browser's Back
replaces the screen, which unmounts the board and the dialog together, and MUI's
own restoration then aims at the opener that went with them. Focusing an element
that has left the document does nothing, so the reader was left on the page body
with their next Tab starting from the top.

The board and the add flow are ONE screen, so opening the flow is not a change
of screen and moves nothing: `/jobs` and `/add` differ in address and in
destination but not in what is drawn beneath, and treating them as different
would take focus out of the Add Job dialog at the moment it opened. Arriving at
the application moves nothing either, since nobody has been taken anywhere yet.

**And ONLY that case.** The shell settles focus when the board's delete
confirmation was open as the screen was replaced, which is the case that was
measured, and not merely whenever focus has been lost. An ordinary navigation,
where the reader activated a control that belongs to the shell and is still
there afterwards, leaves their focus alone. Focus resting on the page body is
the SAFETY condition on the settling, never the reason for it: it is also where
an ordinary navigation can leave a reader whose focus was inside the outgoing
screen, so treating it as the trigger would decide by the back door the very
question that is still open. What an ordinary navigation should do is not
settled here and is KN-715, KN-716.

### The add modal

Node `166:82`, the shell at 560 in four drawn steps and the loading panel of
`243:964` between them. **Paste**, `166:62`, is the Input of several lines, initially
140 tall with its text 16 from every edge. The owner's September 12 correction
makes this a minimum height: the field grows with its text up to eight rows,
then scrolls internally. It sits under «لینک آگهی یا متن کامل آگهی», its
helper «هم لینک را می‌پذیرد، هم متن کامل آگهی را — لازم نیست چیزی را جدا کنی.», and
the row «لینک یا متن آگهی نداری؟ خودت دستی وارد کن», the second half 14 at Medium
in `text/brand`; then Cancel and Primary «استخراج اطلاعات», disabled until the
field is filled and has been touched, taking focus counting as touching, the
critical path's «click into the field» (**PasteFilled**, `371:422`). The file
draws the label at its automatic 19, which the code keeps too, KN-359, so Paste
is 401 tall, as the file is. **Loading**, `243:964`, is the same dialog as a
panel of 360, 32 above and below and 24 at the sides, holding the Loading State
alone; it takes focus as a group named by the Loading State's line, whose status
then speaks only a later line, KN-362, and Escape there goes back to the paste
field with what was pasted. **Review**, `150:94`, is the form in 420 of the modal's 606,
scrolling beyond, its bar in the modal's padding at the inline end: two columns
of 248 with 16 between, from the inline start the title and the company, then
employment type and location, experience and level, the posting and the salary,
the source and the expiry, the posting's link across the row, and the Status
Picker; one column below MUI's sm. **The phone keeps the title first**, the
owner's decision of 2026-09-15, KN-358: `243:726` draws no form of its own but
the desktop Review at 358 wide, whose left to right wrap stacks the company
first. The title and the
company carry the required mark, the owner's KN-075, a star in `text/error`
after the label, said by the field's `aria-required`; saving without them says
«عنوان شغلی را بنویس» and «نام شرکت را بنویس». A pasted link fills the posting's
link when reading found none. **Manual**, `254:2`, is the same form, empty.
**Error**, `304:2`, titles itself «نشد آگهی را بخوانیم», keeps what was pasted,
puts reading's failure in `text/error` where the helper was, and offers «دوباره
امتحان کن» and the manual row; editing the field goes back to Paste. Leaving with
anything entered asks first in the Confirm modal, «بدون ذخیره بسته شود؟», since
the file draws no discard of its own. The set's name says Edit, but the file
draws no Edit step: a job opportunity is edited in place in the Job Modal,
section 3. KN-029.

### The Job Modal

Node `210:276`, 720 by 617, editable where it stands: the set's description
says there is no separate view and edit. The header, 24 above and at the sides
and 16 below, holds the title in Heading/M and the company in Body
`text/secondary` 4 under it, and at its other end the Status Control, which
changes the status at once rather than with Save, and the 20 x. The tabs follow
edge to edge, the Tab Item row of KN-023, in the owner's order, KN-072:
«اطلاعات فرصت شغلی», «سابقه», «یادداشت», «افراد مرتبط», «فایل‌ها»; the chosen one's
panel scrolls in the body's 24 while the row keeps its 44. A panel is a tab stop
only when nothing in it is, as the WAI-ARIA tabs pattern asks, so Tab goes from
the tab to a panel's first field, KN-302. **Info**, `210:101`,
is the add modal's fields at 328 a column, the posting's link with a 44 square
in `bg/surface-secondary` that opens it, drawn only when there is a link, a
rule, the description under a 16 note icon and «شرح شغل و مسئولیت‌ها» at 14 and
SemiBold, a field of two lines that grows, and the skills under a tag icon, chips
at 12 and Medium in `text/secondary` on `bg/surface-secondary`, radius full.
**History**, the file's block at the foot of Info moved to its own tab second,
lists each change of status newest first: the status's name at 14 and Medium,
and at the other end the day on the reader's calendar and «دستی» or «خودکار» at
12 in `text/secondary`. **Note**, `210:145`, is a field 200 tall with «آخرین
ویرایش:» and its day under it; what is typed there or in Info is held by the
modal, so a switch of tabs keeps it. **Related people**, `210:208`, are compact
Contact Cards and the dashed «+ افزودن مخاطب», 46 tall, dashed 6 and 4 in the file
and CSS's own dash here. **Files**, `210:275`, are rows of a 40 tile, the name at
14 and Medium over its kind, size and day at 12, and a 32 download in
`bg/surface-secondary`; then the drop zone on `bg/surface-secondary`, «فایل را
اینجا رها کن» over Button S Secondary «انتخاب فایل». The footer, 16 and 24 under a
rule, puts Cancel and Save at the inline start and Destructive «حذف فرصت شغلی» at
the end, where the file says «حذف آگهی», KN-329's rule. The file draws it in
Persian alone; where the three do not fit on one row, as in English on a phone,
the delete takes a row of its own 12 below and keeps the inline end, rather than
breaking its label onto a second line of the Button's 44, KN-514. Saving without
a title or a company goes back to Info and says which. KN-030.

### A stroke is drawn inside, and takes no space

Every stroke on a component in the file is aligned INSIDE and left out of
layout, read with use_figma on 2026-09-10: the Input's field, `95:5` and
`95:19`, one pixel and two when focused; the Checkbox's frame, `204:11`, one and
a half in every state, KN-281; the Filter Chip, `159:71`, one, one and a half
when pressed and none when selected, KN-282, with the owner's blue selected edge
from KN-276. The Tooltip and the Status Chip draw none. So a stroke is painted
over a component's padding and never moves what is inside it: the Input's text
sits 16 from its edge in every state, KN-266, and the Filter Chip's 12, with
none above or below it in the chip's 32, KN-282.

In CSS that is a border on a pseudo-element laid over the component, not a
border on the component itself, which is laid out, and not an inset box-shadow,
which Windows' forced colours removes, leaving no edge at all. Except where
the width is not a whole pixel: Chromium floors a border's width to whole CSS
pixels, measured in Chromium 151 at device pixel ratios 1 to 2, where the
standard would keep 1.5 at 2, so a 1.5 border draws 1. The Checkbox's 1.5 is
an inset box-shadow, which draws it, with a one pixel `ButtonBorder` border
under forced colours, where the shadow is removed. KN-281. A disabled
Checkbox takes `GrayText` there instead, so it does not read as enabled;
every other state takes `ButtonBorder`. KN-288. Its tick and the dash take `ButtonText`, or `GrayText` when disabled, on a `ButtonFace` frame, KN-290:
an SVG keeps its author stroke under forced colours, so the white mark would
vanish or read as enabled, and those are the pairs the system colours are made
to be read in. The Filter Chip's pressed 1.5 is an inset shadow too, over its
one pixel border on the pseudo-element, which turns `border/focus` with it and
which forced colours keep. KN-282.

### Dark mode

**The file defines light values only.** There are no dark tokens. Any dark
palette is derived, and must be labelled in the code as derived rather than
presented as the design's. Replace it wholesale if the design ever ships real
dark tokens.

The derivation lives in `apps/web/src/theme/darkMode.ts` and it is two stated
rules rather than a table, so it can be argued with. Hue is never touched,
because hue is the only part of a token that carries meaning. Lightness is
flipped for text, borders and accents, with a floor under the chromatic ones so
a saturated hue stays readable on a dark surface. **Backgrounds take the other
rule**: a flip reverses order, and the neutral backgrounds are all crowded
against white, so flipping put the card darker than the page it sits on and ran
elevation backwards across the whole board. They are remapped instead, order
preserved, from the narrow band they occupy near white onto a narrow band near
black. The Storybook theme toolbar labels the option **Dark (derived)** for the
same reason this paragraph exists.

**Then what has to be seen is checked, not assumed.** Text is walked lighter
in its own hue until it clears 4.5 to one on what it sits on. The two borders that
show a state, `border/focus` and `border/error`, are walked the same way until
they clear **3 to one**, WCAG 1.4.11's bar for the parts of a control that show
its state, against `bg/page`, `bg/surface` and `bg/surface-secondary`: the
derivation alone left the focus colour at 2.81 to one on the surface, KN-271.
`border/default` is not checked, because it shows no state and the design
itself draws it at 1.24 to one on white. `border/control`, the owner's resting
edge for a control, is walked to 3 to one against the surface as those two are,
KN-275. The change between a focused and an
unfocused control, WCAG 2.4.13's measure, is each component's own, KN-244 for
the Input.

**A fill that carries white text moves, not the text.** `text/on-accent` stays
the design's white in dark, and the two rest fills it sits on, the brand fill
and the danger fill, are walked darker in their own hue until white clears 4.5
on each: the derivation alone left the danger fills and the pressed fills
between 3.75 and 4.12, short even under pure white. **Hover and pressed then
step darker than the state before them**, as the file steps them in light: each
takes its own hue at the lightness that puts it the light pair's own contrast
ratio below the state before it, about 1.3 to one, so a Primary or a Destructive
button darkens as it is hovered and again as it is pressed, and white only reads
better on it. Walked to white's bar each on its own, the three danger fills had
stopped at one lightness and a pressed Primary had come out brighter than its
rest, KN-319. The pressed fill of the Secondary and Text buttons, `accent/200`,
is a dark tint of its hue as the brand container is, where it had come out light
under its own text at 1.30 to one. A test reads every text and fill the palette
and the Button pair, KN-108, and another the order of a filled button's states,
KN-319. The light palette is the design's, and its Destructive rest is 3.76,
KN-396, the owner's to settle.

---

## 2. Component families

Canvas `5:5`. Build these first, each with its story, before any screen exists.
The states listed are the ones the file actually draws, and all of them are part
of the contract.

| Family              | Node      | What it draws                                                                                   |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| Button                | `31:4`       | S `37:10` and M `33:58` × 5 styles Primary/Secondary/Text/Destructive/Ghost × 5 states; L retired                 |
| Status Chip         | `82:2`    | 9 statuses × 2 sizes S/M, display only                                                          |
| Status Choice       | `427:567` | Default, Hover, Selected                                                                        |
| Status Picker       | `427:592` | the popover that assigns a status                                                               |
| Grouped Picker        | `636:6417`   | Status Picker / Grouped: the stages and the outcomes in two groups, one choice                                    |
| Status Select         | `1257:3315`  | Default, Hover, Open: the add modal's footer trigger that opens the grouped chips upward                          |
| Status Control      | `199:21`  | the clickable wrapper around a chip, Default/Hover/Pressed                                      |
| Input                 | `95:39`      | Default, Filled, Focus, Error, Disabled, Hover, Filled Hover                                                      |
| Card                | `137:44`  | Default, Hover, Pressed, Selected, Static, Focus, desktop                                       |
| Card / Mobile       | `491:751` | Default, Selected                                                                               |
| Status Stripe       | `358:430` | the 4px colour bar on the card, one per status                                                  |
| Company Logo          | `620:3684`   | the default organisation icon; a fetched logo covers the same square                                              |
| Modal / Confirm     | `150:92`  | delete and archive confirmation                                                                 |
| Modal / Unsaved       | `893:3780`   | no variants: save, close without saving, or go back to the modal                                                  |
| Modal / Delete Status | `919:2885`   | Cards=None, Cards=Has: deleting a stage the reader made, its job opportunities moved                              |
| Modal / Change Status | `150:93` |                                                                                                 |
| Modal / Add-Edit    | `166:82`  | steps Paste, PasteFilled, Loading, Review, Manual, Error                                        |
| Page Header         | `155:56`  | title, optional back button, optional primary action                                            |
| Search Bar          | `155:92`  | Default, Focus, Filled, Hover                                                                        |
| Filter Chip         | `159:71`  | Default, Hover, Pressed, Selected, doubles as the status counter                                |
| Empty State         | `159:80`  | title and body as text properties, a required Primary M action; no screen in the redesign uses it |
| Loading / Extract   | `1031:3818` | Step 1, 2 and 3: three dots and no text, the owner's decision of 1 Aban; the status says why past fifteen seconds |
| Menu Item           | `181:22`  | Default, Hover, Disabled, Destructive, Destructive Hover                                                         |
| Menu                | `512:8350`| Type=Status, Type=Card                                                                          |
| Select                | `183:26`     | Default, Filled, Focus, Disabled, Open, Hover, Filled Hover                                                       |
| Option Row          | `408:465` | Default, Hover, Selected, Disabled                                                              |
| Sort Control        | `408:512` | Default, Hover, Open                                                                            |
| Tooltip             | `410:469` | FIXED 260 wide, text fills the rest; no variable bound to the width, so it is a component constant |
| Nav Item / Side     | `184:14`  | Default, Active, Hover                                                                          |
| Nav / Sidebar       | `185:11`  | desktop, on the RIGHT                                                                           |
| Nav / Tab Bar       | `185:19`  | mobile, at the bottom                                                                           |
| Checkbox            | `204:11`  | Unchecked, Checked, Indeterminate, Hover, Disabled, Checked Hover                                              |
| Code Input          | `407:6981`| the Code Row of the Auth Code frames, five boxes over one field; no library component |
| Tab Item            | `204:20`  | Default, Active, Hover                                                                          |
| Bulk Action Bar     | `401:436` | Type=Jobs, Type=Contacts                                                                        |
| Job Modal           | `210:276` | tabs Info, Note, Contacts, Files                                                                |
| Icon                | `239:44`  | 32 icons, 24×24, 2px stroke, round cap and join                                                 |
| Icon Button         | `460:672` | Neutral and Danger × Default, Hover, Disabled; Primary × Default, Hover                         |
| Contact Card        | `248:116` | Full and Compact × Default, Hover, Selected                                                     |
| Contact Modal       | `270:152` | Add, Edit                                                                                       |
| Color Picker        | `257:17`  | offers the nine status colour pairs, the current one marked                                     |
| Popover / Result      | `844:85811`  | what can follow an interview, one press applies; the redesign's popover panel                                     |
| Time List             | `774:16897`  | the day's half-hours, six shown; Time Item `786:1753` Default, Hover, Selected                                    |
| Add Card Link         | `961:95525`  | Default, Hover: after a column's last card, adds to that column                                                   |
| Add Status Column     | `961:95530`  | Default, Hover: a dashed stage-wide column that makes a stage                                                     |
| Toast                 | `956:3193`   | the action, Default, Hover; the frames' whole message `717:12416`                                                 |
| Paste Field           | `961:101573` | Default, Hover: the add form's one-row paste field                                                                |
| Manual Path Link      | `961:101603` | Default, Hover: the way round the paste field to the empty form                                                   |
| Related Person        | `1096:3109`  | Default, Hover; Related Person / Mobile `1313:3295`                                                               |
| Company Match         | `1096:3111`  | no variants: the related people tab's prompt to link someone from the job opportunity's company                   |
| Stats Number          | `1168:3159`  | Applied, Interview, Offer, Rejected, NoResponse: the Stats page's first row                                       |
| Week Bar              | `1168:3183`  | Current=No, Current=Yes: one week of the Stats page's applications                                                |
| Source Row            | `1223:1807`  | Context=Card, Context=Modal: one source of the Stats page's applications                                          |
| Stats Guidance        | `1168:3170`  | no variants: a rule's message and its action at the top of the Stats page                                         |
| Status Tab (Mobile)   | `1274:3275`  | Default, Active, Add: the mobile board's status tabs                                                              |
| Outcome Strip         | `638:7928`   | no variants: accepted, rejected, no response, withdrawn, each a closed outcome after the stages                   |

The icon set, all at 24×24: link, search, x, arrow-right, plus, check, mail,
trash, pencil, chevron-down, more, download, file, external-link, user, phone,
building, calendar, map-pin, briefcase, banknote, clock, log-out, filter, sort,
alert-circle, user-plus, tag, layers, note, chart, link-off. Default colour `text/secondary`,
overridable per instance. Every icon keeps its two pixel stroke at every size: the file's
instances resize the drawing and not the stroke, as the Color Picker's 14
pixel check shows, so the Icon draws a non-scaling stroke, KN-008.

The owner's icons, beyond the file's thirty-two: settings. The file draws no
settings, and the owner asked for one as an icon, KN-478, so the gear is
Lucide's own `settings` from lucide-static 1.41.0, the family the file's icons
are redrawn from, whose `log-out` the file's matches point for point. It is
written into the same 24 grid with the same two pixel round stroke, its arcs in
absolute coordinates, and Lucide's ISC licence travels with it in
`apps/web/src/shared/icon/LICENSE-lucide.txt`.

---

## 3. Decisions the design already made

These are written into the Figma annotations. They are settled, and reopening
one is a decision for the owner, not for whoever is building.

**Navigation is responsive, and has three destinations.** A sidebar on the
**right** on desktop, a tab bar at the **bottom** on mobile. Job detail is
**not** a destination and **not** a page: it opens as a modal from inside the
board.

The Components canvas annotation says two destinations, آگهی‌های من and
افزودن آگهی. **That is superseded.** The Documentation canvas is later and more
specific, and the owner confirmed it: the destinations are
**فرصت‌های شغلی من** (the board), **افزودن فرصت شغلی**, and **شبکه من**, a
standalone contacts page drawn in full at page-map row 5. The old labels are
also superseded, see the terminology rule below.

**The main screen is a kanban board, not a list.** Columns are statuses, cards
drag between them, and the desktop board scrolls horizontally. Read from
`241:2`: `Main` is 1200 wide at x=0 with the `Nav / Sidebar` 240 wide at
**x=1200**, the right edge, and inside `Main` sits a frame named literally
`Board (horizontal scroll)`. The columns frame is 1864 wide inside a 1200
container, which is the overflow.

**The rightmost column is the first stage**, because the layout is RTL. Left to
right the frames are Add Column, پیشنهاد کار, رد شده, مصاحبه, درخواست‌شده,
ذخیره‌شده, so read right to left the drawn order is ذخیره‌شده, درخواست‌شده,
مصاحبه, رد شده, پیشنهاد کار.

**The owner moved رد شده after پیشنهاد کار, so it is last.** See section 6:
asked on 2026-09-08 and answered. The file draws رد شده fourth, between مصاحبه
and پیشنهاد کار, and that is the one place the build does NOT follow the frame.
It is worth being loud about because "match the design exactly" is the standing
rule and this is a deliberate exception, made by the person the rule exists to
serve: an offer is the outcome you are working towards and a rejection is where
a record stops moving, so putting the terminal state after the goal reads as the
end of the trail rather than as a stage on the way to it.

A column is 300 by 684, holding a 276 by 40 header, cards
at 276 by 148, and an `Add Card` row pinned at the bottom. `Add Column` is
labelled «افزودن وضعیت», add status, which is the plainest statement that a
column IS a status.

**The Status Chip is display only.** It has no click target and no focus ring.
The interactive version is a separate wrapper, `Status Control`, and that is
what the card uses. Do not merge them.

**Custom statuses are managed inline**, through the column Menu, which has
exactly **three** options: rename, change colour, delete. **Reorder was removed
from the design**, so a menu offering four options is wrong. "Change colour"
chooses among the nine pairs the Color Picker draws, never a free colour.
Delete is disabled while the column still holds postings, and the
hover explains why. The colour menu **replaces** the main menu; the two are
never on screen together.

**There is no separate Edit button anywhere in the product.** Clicking a job
card or a contact card opens its modal already editable. Adding a status,
changing a status and adding a contact are all inline, and the separate
status-management page was removed.

**Status is chosen with chips, never a dropdown.** The `Status Picker` is a row
of status chips with a blue ring on the selected one, plus a dashed
«+ افزودن وضعیت» chip that creates a new status in place. In the add modal's
footer the chips sit behind a trigger, Status Select / Footer, which shows the
chosen status and opens the grouped chips upward; the status is still chosen
with chips, KN-752.

**The card's status stripe is on the RIGHT edge**, 4px, in the status colour.
On hover a checkbox appears, the title shifts, and a delete icon appears in the
corner. The link icon follows the title and is toggled per instance, because not
every posting has a link.

**Bulk selection has no bar above the columns.** A light bar floats at the
**bottom** centre of the page carrying the count, «انتخاب همه», «تغییر وضعیت»,
«حذف» and a close; the network's carries «حذف» alone. An earlier reading here
said the bar was dark and offered «انتقال به...»; the file's `401:436` draws
neither, read with use_figma on 2026-09-11. KN-025.

**Sorting** offers exactly four options: تازه‌ترین, قدیمی‌ترین,
نزدیک‌ترین مهلت, and نام شرکت alphabetically.

**RTL is `direction: rtl` with the natural array order.** The file says this
outright, twice, for the contacts grid and as a general principle. Figma reverses
its arrays because horizontal Auto Layout always lays out left to right; code
must not copy that. Reversing an array in code to "fix" RTL is a defect.

**The Job Modal replaces a detail page.** The file draws four tabs at `210:276`. The third one
was once labelled «مخاطبین», which the rename below supersedes, and the file has
since applied the renames, read with use_figma on 2026-09-11, KN-023:
اطلاعات فرصت شغلی, یادداشت, افراد مرتبط, فایل‌ها. It also puts status history at the
bottom of the Info tab and flags that as open item 18, and **the owner settled
that on 2026-09-08, KN-072: history is now its own tab**. Its POSITION, second,
is an **author proposal, not yet put to the owner**, see section 6. So the modal
has FIVE: اطلاعات فرصت شغلی, سابقه, یادداشت, افراد مرتبط, فایل‌ها. See section 6. This is
the second place the build deliberately departs from the frame, the first being
where رد شده sits on the board, and both are the owner's call rather than a
reading of the file.

**A Contact Card has no detail view.** Everything about a contact is on the
card itself. There is a Contact Modal, but only for Add and Edit.

**The add-job flow is Paste, then Loading, then Review**, with Manual as the
fallback path and Error as the failure path. Which fields the Review step shows
was settled by the owner, KN-075, see section 6: everything the parse filled,
the required fields marked. KN-029 builds it, "The add modal" in section 1.

**Auth is phone OTP**: a mobile number, then a five digit code. The Screens
canvas draws Login, Code and Signup for both desktop and mobile at page-map row
6, and the Login card asks for «شماره موبایلت را وارد کن». The owner confirmed
this over an earlier email-magic-link decision, and added: email stays as a
fallback behind the same interface, and **for the MVP the provider is mocked**,
so no real SMS is sent. Build it provider-agnostic with a fake that logs the
code, so nothing blocks on SMS credit.

### Terminology, which is a hard rule rather than a preference

The Documentation canvas records sixteen copy changes and states the rule
directly. **Fourteen of the sixteen were applied in the file; two were not**,
and the frame says so itself — see section 6. It is not stylistic: the two words
mean different things.

- **فرصت شغلی** is the record the user is tracking inside KarNama.
- **آگهی** is **only** the external source: the original posting on a job board,
  or the link or text the user pasted to extract from.
- **«فرصت» never appears alone.** Always the full phrase «فرصت شغلی», including
  in a secondary reference mid sentence. The delete-confirmation title is
  «حذف این فرصت شغلی؟», not «حذف این فرصت؟». Without exception.

Renames that follow from it: «آگهی‌های من» became «فرصت‌های شغلی من»,
«افزودن آگهی» became «افزودن فرصت شغلی», the nav item «مخاطبین» became
«شبکه من», and the contacts tab inside the job modal became «افراد مرتبط». The
nav item and the tab are different things: one is a standalone page for the
user's whole network, the other is the people attached to one فرصت شغلی.

Since message ids are English, this needs a glossary in the catalog: **job
opportunity** for the tracked record, **job posting** for the external source.
Getting these the wrong way round in English produces Persian that breaks the
rule.

**Tone.** UI labels, placeholders, field names and short system messages are
neutral, clean, formal Persian: «در» rather than «تو». Microcopy, meaning
guidance, empty-state encouragement and helper sentences addressed to the user,
is gently colloquial: «رو», «هر چی», «می‌شه». No emoji, and no heavy chat-speak,
in either register.

---

### Enumerated field values, from `434:33`

Job level is still **Provisional**, see the open questions below. Employment type
is the owner's decision of 2026-09-10, see "Settled by the owner on 2026-09-10".
English on the left because message ids are English, Persian on the right
because that is what ships by default.

**نوع همکاری, employment type, more than one per job:** full-time تمام‌وقت ·
part-time پاره‌وقت · internship کارآموزی · remote دورکاری · contract قراردادی ·
project پروژه‌ای · freelance فریلنسری · temporary موقت

**سطح شغلی, job level:** worker کارگر · employee کارمند · specialist کارشناس ·
senior specialist کارشناس ارشد · middle manager مدیر میانی ·
deputy or senior manager معاون / مدیر ارشد · chief executive مدیر عامل

**وضعیت, status:** the five defaults, plus «+ افزودن وضعیت» to create one. Two
Persianisations are already applied and should not be undone:
«تازه اضافه‌شده» became «ذخیره‌شده», and «اپلای‌شده» became «درخواست‌شده».

A status label is **data, not a catalog message**, because the user can rename
any of them. The five default names ship as catalog messages only as the seed
values for a fresh account.

### The design is 100 percent tokenised, which makes the no-literal rule checkable

Frame `434:26` reports full variable coverage across both the Components and
Screens pages: background colour 5496 of 5496, border colour 1995 of 1995,
padding 6276 of 6276, gap 3226 of 3226, radius 2038 of 2038, and 464 icon sizes
all bound to `size/icon-*`. Off-scale values were corrected in the same pass:
spacing 2 and 3 to 4, 6 and 10 to 8, 20 to 24, 40 to 32; radius 2 and 5 to 4;
font 11 to 12 and 18 to 20.

So every number a component needs **is** in the token set. If an implementation
reaches for a literal, either the value is wrong or the token was not looked up.

### States are variants on the component, not separate screens

Frame `416:14`: hover and press are reactions carried by each Component Set that
has a State axis, so they work on every instance rather than only on the one
drawn inside a Hover frame. They are applied to Card, Contact Card, Button in
all sizes and styles, Menu Item, Option Row, Filter Chip, Search Bar, Input,
Select, Status Control, Sort Control and Checkbox.

This means the `Hover`, `Drag` and `Drop Done` frames on the Screens canvas are
**prototype demonstrations, not screens to implement**. Build the states as
variants on the component. The file also records why bulk selection was not
wired from the card checkbox in the prototype: a reaction can only change a
variant on its own component, it cannot navigate elsewhere. That is a Figma
limitation, not a product decision, so the real app should wire it properly.

## 4. The Job Record

Read from the required-fields frame `434:2` and the add and edit modal at
`166:82`. English names on the left, because message ids and schema fields are
English; the Persian is what ships by default.

**Required. Three fields, not one.**

| Field     | Persian    | Why the design requires it                 |
| --------- | ---------- | ------------------------------------------ |
| `title`   | عنوان شغلی | without it the card has no name to display |
| `company` | نام شرکت   | the key the archive groups and searches by |
| `status`  | وضعیت      | always has a value, defaulting to «ذخیره‌شده» |

`status` is never absent, so it is not nullable anywhere: a record arrives with
the default and moves from there. And a status label is **data, not a catalog
message**, because the user can rename any status.

**Optional.** `postingUrl` لینک آگهی · `location` موقعیت مکانی ·
`employmentType` نوع همکاری · `jobLevel` سطح شغلی · `experience` سابقه‌ی موردنیاز
· `salary` حقوق · `postedAt` تاریخ انتشار · `expiresAt` تاریخ انقضا ·
`source` منبع · `description` شرح شغل · `skills` مهارت‌ها · `note` یادداشت ·
`contacts` افراد مرتبط · `files` فایل‌ها

The last three are relations rather than columns, and they are the Note,
Related People and Files tabs of the job modal.

**Not a field, but part of the record: `statusHistory`.** Every status change
appends an entry with its timestamp, and history is never rewritten. It is the
anchor of the whole product, so it is a table rather than a column, and the Info
tab renders it in reverse chronological order.

### Creating one

The add flow requires **exactly one of** a posting link **or** the full text of
the posting. Until one is present the «استخراج اطلاعات» button stays disabled,
and the file specifies it is disabled until the field has been touched as well
as filled. The manual path requires neither and opens with empty fields.

**The manual form and the extracted form are the same form.** The only
difference is whether the fields arrive filled, so there is one form component
with one validation, not two that drift.

### Contacts, custom statuses, signing in

A contact requires a full name and nothing else. Role, company, email, phone,
social and the related job opportunity are optional. **The file raises its own
open question here**, see section 6: a contact with neither email nor phone has
no contact route and is close to useless.

A custom status requires a name only. Its colour is assigned automatically from
the four reserved slots, so it is not a required input and must not be presented
as one.

Signing in requires a mobile number and a five digit code. The user's name is
asked **only on first sign-in**, and is required there.

## 5. Where the language switch goes

The owner's testing request of 2026-09-12 adds a Settings control, since
2026-09-14 one of the shell's own controls, below, KN-478. It opens
the existing modal shell at 420 pixels, with language and light, dark, or device
appearance choices, plus an explicit sample-data loader. This is an owner-requested
addition composed from existing controls, not a new Figma screen. The language
is the Select of `183:26`, each option and the chosen value led by the
language's flag, the owner's of 2026-09-14: "it needs to be in the settings,
with a drop down and a flag", KN-480. Sample records
are fictional, editable, and saved per reader; loading them preserves existing
records and does not duplicate samples already present.

The owner asked for a language button in the menu bar, placed so it does not
destroy anything in the design. The design has no language control, because it
was drawn Persian-only.

The rule for it: it goes in the **existing** app chrome and adds no new chrome.
On desktop that is the bottom of the sidebar (`185:11`), below the nav items,
where the sidebar already has empty space and already carries a `log-out` icon
in the icon set. On mobile the tab bar carries the three drawn destinations and
a fourth entry would change the design, so the switch belongs in the Page Header
(`155:56`) as an optional trailing action rather than in the tab bar.

The file draws two widths, 390 and 1440, and no breakpoint between them; the
build takes MUI's `md`, 900 pixels, as the line: below it the switch sits in
the Page Header, after its action, KN-021.

**The flag, the owner's addition of 2026-09-14, KN-479**: "the language button
should have flag next to it". Each language takes the flag of its region from
the `country-flag-icons` package, Persian Iran's and English the United
States', since the owner's word was to use a package rather than choose flags.
The file draws no flag, so its size and place are written here: three by two
across the 20 pixel icon column, radius `sm`, ringed by one pixel of
`border/default` drawn over its edge. Since KN-478 the switch is an Icon Button
whose icon is the flag, below; in the language menu the flag leads each
language's name, `xs` apart. It is decoration: the control's name is «زبان».

**The shell's own controls are Icon Buttons, the owner's instruction of
2026-09-14, KN-478**: "settings, signout, language, add contact, all needs to be
a icon button!" The language, settings and signing out are the Icon Button of
`460:672`, each with a Tooltip saying what its name does not: the language's is
the current language's own name, its icon that language's flag. On desktop they
are one row at the sidebar's foot, 12 apart, in place of the language row and
the file's «خروج» Nav Item; on a phone they follow the page's action in the Page
Header, and nothing sits in a row above a page's title. The network's add
contact, which the file draws as Button M in its Page Header, is the Icon Button
with `user-plus` there. The language menu opens above its button from the
sidebar and below it from a header, never over it. The settings gear is the
owner's icon, section 2.

**A disabled Icon Button stays reachable, the owner's call of 2026-09-17,
KN-426.** It is turned off by `aria-disabled` rather than the native attribute,
with its press refused, so it keeps its place in the tab order and still takes a
hover, and a Tooltip on it opens and says why it is off. That is the rule
already written above for the blocked delete, that the item stays in the
keyboard's path so the reason can be read, and an icon-only control is the case
that needs it most, having no text of its own to explain with. It is also why
this one component is drawn from `[aria-disabled='true']` where the Button, the
Checkbox and the auth screen key on MUI's disabled class: those still hand MUI
the native prop and this one no longer does, so the class it would match is
never added.

Nothing else moves. If honouring this ever requires resizing or reflowing a
drawn frame, stop and ask the owner rather than editing the design by hand.

---

## 6. Open questions the design has not settled

These are flagged in the file itself. They are the designer's or the owner's
call, not a build decision, and nothing should quietly resolve them by picking
one while implementing.

- **The job level option list**, **open, tracked by KN-073**, at `434:33` is marked
  **unconfirmed**: it was never checked against Jobinja and Jobvision because the
  network blocked it. Treat the values as provisional. The employment type list
  beside it was settled by the owner on 2026-09-10, below.
- **The two copy strings frame `505:3` marks as not applied.** **Open, tracked
  by KN-077.** Fourteen of its sixteen changes landed in the file. Item 10, the
  Review-step helper copy, records that no such node exists after searching all
  five Add and Edit states on both breakpoints, so its placement still needs
  confirming or the string needs adding. Item 15, the new-status helper copy,
  records that the text was not found and needs manual review. Both are wording
  the design has written but not placed, so neither can be read off a screen.

---

### Settled by the owner on 2026-09-08

Four of these were put to the owner directly, with the trade named on each, and
answered. They are decisions now, not questions, and nothing below reopens by
being inconvenient to build.

**«رد شده» stays as the last column, collapsed to a count by default.** Owner,
KN-070, over frame `434:16`. Rejected is the last stage of the pipeline and it
expands on click. The reason it collapses rather than simply sitting open: it is
the status that accumulates fastest in a job search, and an always-open rejected
column ends up dominating the screen it is least useful on. Off the board
entirely was rejected because the trail is what this product is for.

So the column order in section 3 stands, and the board renders it as
`رد شده ▸ 14` until the user opens it.

**A contact needs only a full name.** Owner, KN-071, over frame `434:2`. Build
what the frame specifies: name required, email and phone both optional. The
file's own note that a contact with neither is close to useless was put to the
owner and they chose the permissive rule anyway, which is a real position: a
half-remembered name you can fill in later is worth more than a form that
refuses it. **Do not add a one-of-two validation rule.**

**Status history gets its own tab in the job modal.** Owner, KN-072, over the
Components canvas open item 18. It is no longer at the bottom of the Info tab.
The trail is the payoff of the whole data model, and a tab gives it room for
timestamps and per-transition notes instead of burying it under a scroll.

**That makes FIVE tabs, not three.** Frame `210:276` draws four variants —
`Tab=Info` `210:101`, `Tab=Note` `210:145`, `Tab=Contacts` `210:208`,
`Tab=Files` `210:275`, each 720x617 — and this decision inserts a fifth:

> اطلاعات فرصت شغلی · **سابقه** · یادداشت · افراد مرتبط · فایل‌ها

**Author proposal, not yet put to the owner: history goes SECOND**, directly
after the information it is the history OF. The owner settled that history gets
its own TAB; they were never asked where that tab sits. Second position is the
author's reading of what follows from the decision, and it is recorded here so
it can be argued with rather than inherited as settled.

The
question put to the owner illustrated the idea with a three-tab sketch, and that
sketch was an illustration rather than the tab set: reading it as the answer
would silently drop افراد مرتبط and فایل‌ها, which the design draws and the product
needs. The decision adds a tab; it does not replace the others.

**The Review step shows everything the parse filled, with the required fields
marked.** Owner, KN-075, over frame `376:31`. Not only the three required ones.
Review exists to catch a bad parse, so the user has to be able to see what was
actually understood from what they pasted; a mis-parsed company or salary that
is never shown is found much later, by which time the posting may be gone.

One contradiction between two documentation frames, already resolved:
principle 5 at `376:9` forbids colloquial Persian outright, while the
copywriting frame at `505:3` requires it for microcopy and formal Persian only
for UI labels. **`505:3` wins**: it is the later revision and it enumerates the
sixteen copy changes, fourteen of the sixteen applied in the file, one of which
reverts a wrong colloquial edit on a UI label. Principle 5 is superseded, do not
re-apply it.

### Settled by the owner on 2026-09-10

Five answers. The owner gave the broad answer to the first two in chat, and
then confirmed the details through the question tool the same day; the other
three were put and answered through the question tool alone. Every line below
is the owner's, not a reading of it.

**Dropping a card onto the rejected column while it is collapsed to a count.**
Owner, KN-196. The file draws nothing for it: Drop Done `376:5997` predates the
collapse decision and shows rejected open, in the old order.

- **During a drag, the collapsed column expands after a short hover: 500 ms**
  of the dragged card resting over it. Long enough that crossing it on the way
  to another column does not open it, short enough to read as a response.
- **It accepts a drop while still collapsed.** A card dropped before it opens
  lands in rejected all the same: opening shows where the card will go, it is
  not a condition of going there.
- **After the card lands, it recollapses with a brief highlight, and only if
  the drag opened it.** The count ticks up, the header flashes the rejected
  status colour for about a second, and a screen reader hears the move, «رد شده،
  ۱۴», Moved to Rejected, 14. A column the user opened themselves stays open.
  If the save fails, the card goes back and there is no highlight.
- **The keyboard path offers the collapsed column as one target, announced with
  its count**, never as an empty slot to move into.

**Employment type: eight values, and a job holds more than one.** Owner, the
first half of KN-073. A superset of both Iranian job boards: the six in
"Enumerated field values" plus freelance فریلنسری and temporary موقت. The owner
accepted that contract قراردادی and temporary موقت overlap heavily in practice,
and so do freelance فریلنسری and project پروژه‌ای, so the picker offers choices
many people cannot tell apart; in exchange nothing an ad says goes unmatched.
**A job can be full-time and remote at once**, so the field holds more than
one value. The database enum and the list-valued field are a migration,
KN-265. The job level list was not part of the answer and stays provisional.

**A control's resting edge clears 3 to one.** Owner, KN-273. The file draws the
resting edge of the Input, `95:3`, and of the unchecked Checkbox in
`border/default`, 1.24 to one on white and 1.13 on the secondary surface, and
nothing else outlines an empty field, while WCAG 1.4.11 asks 3 to one of the
edge that identifies a control. Put to the owner with the trade named on each
option, they chose **a new named role for a control's resting edge**: a grey in
the file's own hue at 3 to one or more on every surface a control sits on,
picked with margin and derived for dark like the other borders. Not keeping the
file's colour, not taking `text/secondary`, and not asking the designer first.
The Input, the Checkbox and the Select use it, `border/control`, and a disabled
one keeps the edge the file draws; the Hover edge keeps its drawn colour, and
cards, dividers and the Filter Chip keep `border/default`. Like the order of the
columns and the history tab, this departs from the file on the owner's call.
KN-275 built it; the Search Bar and the Sort Control, built since, still draw
`border/default`, and whether they take it is the owner's to say.

**A selected Filter Chip shows a blue edge.** Owner, KN-276, put and answered
through the question tool. Node `159:71` shows selection only by the pale
`bg/brand/container` fill, 1.22 to one on white and 1.11 on the secondary
surface, and by a change of text colour, so the state fails WCAG 1.4.11's 3 to
one and rests on colour alone, against 1.4.1. Of four options, the owner chose
**a blue edge on the selected chip**: the fill stays as drawn, and the chip's
one pixel edge, which it has in both states, turns a blue at 3 to one or more
on every surface and against the fill inside it, `#2563eb` in light. Not a
check before the label, which would grow the chip as it toggles, not keeping
the file's fill, and not asking the designer first. That blue is already the
chip's pressed edge, so selection gets an edge of its own or is proved apart
from pressing. KN-279 built it, `border/selected`, a role of its own though the
same blue today, and a pressed chip is told from a selected one by its edge's
width, one and a half against one.

**A field's message line is drawn only when there is something to say.**
Owner, KN-285, put and answered through the question tool. All 91 Input
instances on the screens turn the Helper Text line off, and in the file the
error message is that line, so a field is 64 tall at rest and the 90 tall
Error variant when it fails. The Input reserved the line always, KN-011's
decision that an error never moves the form, which made every screen 26
taller per field than drawn. The owner chose **to follow the screens**: the
line is drawn when there is a helper or an error, an error appearing adds it
with its message and moves what is below by 26, and a field with neither is
the screens' 64. Not keeping the line reserved, not reserving it only on
fields that validate, and not asking the designer first. This reverses
KN-011's decision, and KN-287 built it: the Input's column has no gap, the
label keeps its 4 below it and the line takes its 4 above only when it has
something to say, so a field with neither is 64 and one with either is 90; a
helper made only of blank characters is no helper. A new error is announced
to a screen reader whichever way, KN-286.

## 7. The Documentation canvas, frame by frame

**Superseded, 2026-11-03.** The designer's handoff calls the Documentation page
old and not to be relied on, and [DESIGN-HANDOFF.md](./DESIGN-HANDOFF.md)
replaces it. What follows is kept as the history of what the old canvas said.

Canvas `5:8`. Every frame, with what it settles and where that now lives, so a
reader can tell at a glance whether this document has absorbed it. Two copy
strings are the one exception, and section 6 says which: they are open in the
Figma file too, so there is nothing to absorb yet.

"Where it landed" names a **heading**, not a section number. An earlier version
numbered them, a later edit renumbered the sections, and the index then pointed
readers at the wrong place while looking authoritative. Headings survive
renumbering; numbers do not.

**What the committed capture can and cannot support.** The frame list and the
inventory of pending items are derived from `agent/figma-capture/`, which holds
`get_metadata` responses. Those carry layer *names*, and Figma caps an
auto-generated text layer name: 64 of the 148 names in the documentation capture
sit at or just under the cap and are cut mid-phrase. Only frame `505:3`, whose layers
were named deliberately, is present in full. So the pending-item inventory is a
floor rather than a ceiling — a marker written past the cut is not in the
artefact and nothing can see it — and this index says where each frame landed,
not that the landing is complete. **Open, tracked by KN-079**, with the coverage
check itself tracked by KN-078.

| Frame     | Subject                | Where it landed                                                                                       |
| --------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `376:2`   | what the product is    | "What the product is", below, with Huntr and Teal as the reference products                            |
| `376:9`   | design principles      | "Decisions the design already made"; its tone rule is SUPERSEDED by `505:3`                            |
| `376:21`  | tokens                 | "Tokens", checked against the variables by `agent/scripts/verify/KN-004.mjs`                            |
| `376:31`  | key patterns           | "Decisions the design already made": the card stripe and hover, the board, bulk selection, the column menu |
| `376:43`  | Figma gotchas          | seven are plugin-scripting notes that do not reach the app; the two that do are below                  |
| `376:46`  | page map               | "The screens", the six flow rows                                                                       |
| `384:12`  | prototype map          | "The critical path" and the motion values, below                                                       |
| `416:14`  | interactive components | "States are variants on the component, not separate screens"                                           |
| `416:21`  | type scale             | "Type", five roles and no sixth                                                                        |
| `434:2`   | required fields        | "The Job Record"                                                                                       |
| `434:16`  | order and layout       | "Decisions the design already made": the column order, the contacts grid, the chip picker, the sort options |
| `434:26`  | variable coverage      | "The design is 100 percent tokenised, which makes the no-literal rule checkable"                       |
| `434:33`  | field options          | "Enumerated field values", provisional, tracked by KN-073                                              |
| `505:3`   | copywriting            | "Decisions the design already made": the terminology rule and the two registers                        |

### What the product is

From `376:2`, in the designer's own words: KarNama is a
Persian, right-to-left job application tracker. The user pastes a link or the
text of a posting, the information is extracted automatically, and the posting
moves between statuses on a kanban board. Two products are named as the
benchmark, **Huntr** and **Teal**, and they are the comparables to consult when
a design question is genuinely ambiguous.

**The two Figma gotchas that reach the app**, from `376:43`:

- **Persian text carries invisible characters, so `===` can fail.** Normalise
  with NFC before comparing, and do **not** strip the zero-width non-joiner: it
  is meaningful, «می‌شود» is not «میشود». A test that trims it is asserting the
  wrong string.
- **Keep a card's height stable on hover** by toggling visibility rather than
  removing the node. In the file that is a hidden layer, which in auto layout
  gives up its room: the Card's Default hides its Checkbox and delete, and its
  Hover shows them and moves the title over by 28. The height holds because the
  title row is fixed at 30. So the CSS is not `visibility: hidden` or
  `opacity: 0` keeping the room, which would draw Default with a gap before the
  title, and not `display: none` either, which takes a control out of the
  keyboard's path, KN-341: the controls fold to no room and fade. KN-015.

**Motion, from the prototype map `384:12` and the reactions themselves.** The
map's summary says Smart Animate **300ms** for a state change within a screen,
such as the card hover, Dissolve **150ms** for opening and closing a modal, and
**Instant** for menus and popovers. The components' own reactions, read with
use_figma on 2026-09-11, are finer, and where they differ they win: of the
file's 207 hover reactions, 124 are Smart Animate ease in and out over
**200ms**, among them the Buttons, the Card, the Filter Chip, the Menu Item and
the Status Control, 80 are ease out over **120ms**, among them the Input, the
Option Row, the Sort Control, the Status Choice, the Tab Item and the side Nav
Item, and 3 are 150. Presses and clicks are mostly ease out over 120ms, and the
map's 300 appears only on drags and a few clicks. The job card follows its
reaction, KN-015; KN-350 carries the built components. The prototype advances
Loading to Review after 1.4 seconds, which is a prototype timing rather than a
specification, but it is the intended feel.

### The critical path

Also from `384:12`. The canonical journey, and what the end-to-end scenario test
should walk:

> sign in → the board → click a card → the job modal → the related-people tab →
> add a contact → save → back to the board → add a job opportunity → paste a
> link, with extract still disabled → click into the field → extract becomes
> enabled → loading → Review → save

## 8. The screens

Canvas `5:7`, 53 frames, desktop 1440 by 900 and mobile 390 by 844, grouped into
six flow rows. **`Hover`, `Drag` and `Drop Done` are prototype demonstrations,
not screens to implement**: those states belong to the components, per `416:14`.

**The page's frame**, read from `241:2`, `241:146`, `252:2` and `252:411` with
use_figma on 2026-09-14, KN-481. The board and the network open on a Header
band, `bg/surface` with one pixel of `border/default` along its foot, drawn
inside: on a desktop 32 above and at the sides, 16 below and 16 between the Page
Header and the toolbar, 144 tall; on a phone 16, 12 below and 12 between, and on
the board it holds the status chips as well. The Page Header is 44 tall whatever
its action. The desktop toolbar puts the Search Bar's 320 at the inline start
and the Sort Control at the inline end. Under the band the page keeps the same
gutter, 32 or 16: the board's columns sit 32 in and 16 apart, a phone's cards 16
in and 12 apart, and the network's people fill two equal columns 24 apart from
md up and one column 12 apart below it. The shell gives a page no padding of its
own. Not matched yet, each its own card: the network's Sort Control, KN-512, and
a phone board's add button and sort row, which wait on the owner, KN-515 and
KN-516.

**Row 1, y=0, the board.** Desktop Board `241:2`, Mobile Board `241:146`, Mobile
Empty `243:2`, Desktop Hover `243:76`, Desktop Drag `243:224`, Mobile Selection
`243:325`, Desktop Selection `243:433`, Desktop Search Empty `305:1547`, Desktop
Empty `305:1696`, Desktop Drop Done `376:5997`, Mobile Card Menu `492:7482`,
Mobile Status Menu `492:7581`.

**Row 2, y=1100, managing a status.** Column Menu `259:2`, Rename Column
`259:105`, Column Colour `259:184`, Delete Blocked `259:295`, Delete Status
Confirm `305:1377`.

**Row 3, y=2200, adding one.** Mobile Paste `243:682`, Mobile Paste Filled
`376:5868`, Mobile Review `243:726`, Mobile Manual `305:2`, Desktop Paste
`243:814`, Desktop Paste Filled `376:5645`, Desktop Loading `243:899`, Desktop
Review `243:971`, Desktop Manual `305:165`, Desktop Error `305:374`.

**Row 4, y=3300, the job modal.** Mobile and desktop for each of the four tabs,
`243:1078`, `305:558`, `305:705`, `305:876`, `243:1213`, `243:1374`, `243:1502`,
`243:1652`, plus Desktop Delete Confirm `305:1055` and Desktop Change Status
`377:6244`.

**Row 5, y=4400, the network.** Desktop `252:2`, Desktop Selection `252:175`,
Mobile `252:411`, Desktop Add `271:55`, Desktop Edit `271:190`, Mobile Add
`271:332`, Mobile Selection `305:1842`, Mobile Edit `305:2018`, Desktop Delete
Confirm `305:1232`, Desktop Empty `305:2243`.

**Row 6, y=5500, signing in.** Desktop Login `407:6951`, Desktop Code `407:6972`,
Desktop Signup `407:7000`, and the mobile three at `407:7022`, `407:7043` and
`407:7071`. Login then Code then Signup is what makes the phone OTP flow
unambiguous.

**The Auth Card**, `407:6952`, is one card on every step: 440 wide on a desktop and
342 on a phone, the page's 24 at either side, centred on `bg/page`; 32 of padding
and 24 between its parts; radius lg, `bg/surface` and one pixel of `border/default`
inside; and its own shadow, `elevation.authCard`. It opens with the sidebar's Brand
Row, the one component both draw, then the step's heading: the title at 24 and
SemiBold on the font's normal line, which is the file's 38, bound to no text style,
with the body 8 under it in Body, `text/secondary`. Login ends with a note at 12 and
Regular on the normal line, centred. The file draws it in `text/disabled`, 2.54 to one
on the card, under the 4.5 WCAG asks of text that size; **the owner decided on
2026-09-16 to raise it**, so the build draws `text/secondary`, 4.83, KN-591. KN-518.

**Under the code step's action**, `407:6972` and `407:7043` draw two lines, 24
apart, each the card's inner width and 22 tall. The Resend Timer, `407:6996`,
«ارسال دوباره‌ی کد تا ۰۰:۵۹», 14 Regular, centred, `text/disabled`, counts down the minute the API
asks before another code, its `retryAfterSeconds`, in the reader's digits, with
the time beside the words until KN-221. The file draws nothing once it ends; the
build's reading is the same line as a Footer Link, «ارسال دوباره‌ی کد», which sends another
code and starts the count again. The Footer Link `407:6998`, in the Change Number
frame `407:6997`, «ویرایش شماره», 14 Medium, centred, `text/brand` and pressed across
the card's width, goes back to the number step with the number kept, as its
reaction goes back to Login, and puts the reader in the number field. The file draws
the timer in `text/disabled`, 2.54 to one, as it draws the Terms Note; the owner's
decision of 2026-09-16 raises both, so the build draws `text/secondary`, KN-591.
KN-587.

**The Code Row**, `407:6981` and `407:7052`, is the Code Input, KN-586, which the
Components page does not hold: five boxes filling the card's inner width 8 apart,
56 tall, radius md, `bg/surface` with one pixel of `border/default` inside, each
digit 20 at SemiBold on a line of 32 in `text/primary`, in the reader's digits and
left to right whatever the page. The boxes are drawn over one real text field,
numeric, with the one-time-code hint and no length limit, so typing, pasting and a
phone's autofill are the field's own and a screen reader meets only the field. The
build's readings, where the file draws one state: the box at the caret takes two
pixels of `border/focus` while the field has focus; a press on a box puts the caret
there; and a refused code takes the Input's error line, with every resting edge in
`border/error`. A phone suggests the code only when the text message names the
site, KN-600.

What the frames draw and the build does not, each a card: the signup's «بعداً کاملش می‌کنم», which the name section 4 requires
contradicts, KN-588. **The Login and Code heading sublines are the build's own
words, and only those two**, decided 2026-09-16. The file draws four: «شماره
موبایلت را وارد کن؛ یک کد پنج‌رقمی برایت پیامک می‌کنیم.» on Login, `407:6951`
and `407:7022`, and «کد پنج‌رقمی را به ۰۹۱۲ ۳۴۵ ۶۷۸۹ پیامک کردیم.» on Code,
`407:6972` and `407:7043`. The build draws two: «شماره موبایلت را وارد کن»,
which claims nothing, and «کد مربوط به» with the number, which names whose code
is on the screen. Nothing is sent while the provider is mocked — `AuthProvider`'s
`send` makes the code, holds it pending and writes it to the console, and
KN-459's notice puts it on the screen — so the file's two lines would tell a
reader something that is not happening. Asked on 2026-09-16 the owner declined to
choose, so **the decision is the author's**, KN-589, under the rule that the
first screen does not say what is untrue; the file's lines return when a real
provider sends. **It covers those two sublines and nothing else**: the resend
timer and its link still read «ارسال دوباره‌ی کد», which presupposes a send that
never happened, and that is KN-664. The note names terms and a privacy policy the
product does not have yet: the owner's decision of 2026-09-15 is to write both
pages and link the note to them, KN-590. The signup body says «برد فرصت‌های شغلی‌ات» where the file says «برد
آگهی‌هایت», the terminology rule of section 3, as KN-329 records for the bar's
count.

## 9. RTL, and what it does to the DOM

The design is laid out right to left. A panel drawn on the **left** of a frame
comes **second** in the DOM, and one on the right comes first. Read the child
`x` coordinates from `get_metadata` and order the JSX from those, do not
eyeball it from a screenshot. This is the single most common way a
Persian-first layout gets built backwards.

The app defaults to Persian and the user can switch to English, so direction is
a runtime value, not a build-time one. Every layout has to be correct in both.
English strings are longer than Persian, so a row that fits in Persian can
overflow in English; check both before calling a layout done.
