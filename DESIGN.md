# Design contract

Everything here was read from the Figma file, not invented. When this file and
Figma disagree, **Figma wins** and this file gets corrected in the same change.

The owner's instruction, verbatim: _match it exactly like design, every
component should be exactly like the design_. Exactly means every size, every
state, every variant, and every token. A component that looks right but is
missing its `Focus` state does not match.

## The file

**File key** `EITM6CbJY33dMY8IsMFR4R`

That is a **copy**. The original, `K1EP8GCOmelU8o4vPR7a9f`, is view-only for the
account the MCP is authenticated as and every call against it fails with "you
don't have edit access". Use the copy.

| Canvas         | Node id |
| -------------- | ------- |
| Cover          | `0:1`   |
| Foundations    | `5:3`   |
| Components     | `5:5`   |
| Screens        | `5:7`   |
| Documentations | `5:8`   |

Two quirks that cost time if you rediscover them:

- `get_metadata` **with no `nodeId` lists only the Cover page.** It does not list
  the other canvases. Go straight to a canvas id from the table.
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
| `red/700`                   | `#b91c1c` |
| `overlay/scrim`             | `#00000080` |

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
| `text/error`         | `95:39`   | `#b91c1c` | the Input error state                         |
| `black/base`         | `31:4`    | `#000000` | the base the two elevation shadows take alpha from |
| `overlay/scrim`      | `377:6244` | `#00000080` | black at half behind a modal, the variable's own alpha |

`black/base` is why the shadow colours are written `#0000000F` and `#00000014`
rather than as greys: they are black at an alpha, and the alpha is the whole
token. It is not a colour any component may paint with.

### Colour, status

Five defaults and four reserved for user-defined statuses. Each has a `base`,
which is the text and the stripe, and a `container`, which is the chip fill.

| Status     | base      | container | Persian      |
| ---------- | --------- | --------- | ------------ |
| `new`      | `#4b5563` | `#e5e7eb` | ذخیره‌شده     |
| `applied`  | `#4f46e5` | `#e0e7ff` | درخواست‌شده   |
| `interview`| `#b45309` | `#fef3c7` | مصاحبه       |
| `rejected` | `#b91c1c` | `#fee2e2` | رد شده       |
| `offer`    | `#166534` | `#dcfce7` | پیشنهاد کار  |
| `custom-1` | `#0f766e` | `#ccfbf1` | سفارشی ۱     |
| `custom-2` | `#7e22ce` | `#f3e8ff` | سفارشی ۲     |
| `custom-3` | `#be185d` | `#fce7f3` | سفارشی ۳     |
| `custom-4` | `#155e75` | `#cffafe` | سفارشی ۴     |

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
rejected.

### Spacing, radius, icon size

```
spacing  2xs 4   xs 8   sm 12   md 16   lg 24   xl 32   2xl 48   3xl 64
radius   none 0  sm 4   md 8    lg 16   full 999
icon     sm 16   md 20  base 24
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
halo of `border/focus` at 18 percent spread 3, `elevation.cardFocus`. KN-015. The thirteen-frame sweep below did not include `410:469`,
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

Family **Vazirmatn**, flagged in the file as a placeholder. Five roles, and
**only five**, read from the type-scale documentation frame `416:21`:

| Role        | Size / line height | Weight   |
| ----------- | ------------------ | -------- |
| `Heading/L` | 24 / 32            | SemiBold |
| `Heading/M` | 20 / 28            | SemiBold |
| `Title`     | 16 / 24            | Medium   |
| `Body`      | 14 / 22            | Regular  |
| `Label`     | 12 / 16            | Medium   |

`Body` carries letter spacing 0 and `Label` carries 0.2, read from the component
frames.

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
its direction from the name, not the page, as the label in `84:4` does, so the
ellipsis always cuts the end of a name and its start stays in view in either
script.

### The Input focused while invalid

Node `95:38` draws six standalone states and no composite, so this one is a
decision rather than a reading. **A focused invalid field keeps the error
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
square pixels in a field W wide and 44 tall, against WCAG's two pixel
perimeter of 4W + 4H, which is 4W + 176; the ring alone, being inset, is a
little less, and the two bands count together, each a change of 3 to one or
more. A red ring would clear 3 to one too; blue is chosen so the product has
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
focus, until KN-279 gives a selected chip an edge of the same blue, and then
the ring alone would fall short there. The ring's colour clears 3 to one on
every fill the chip has: 5.17 on `bg/surface` in light and 3.04 in the derived
dark, 4.70 and 3.57 on the hover fill, and 4.24 and 3.33 on the selected one.
Its inner edge is 1 from the line's box, and the label's ink, Persian dots and
marks included, stays between 8.25 and 24.75 of the chip's 32, measured, so
the ring never touches it. Pressed, the chip's inset 1.5 is already blue under
the ring's outer half pixel, which paints over it, so on a pressed chip focus
changes 2.5 wide, about 5W + 48, still clearing the perimeter for any chip 25
or more wide; and KN-279's
one pixel selected edge sits outside the ring, so focus is told from pressed
and from selected by its width.

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
and the body as text properties, and the screens use it three times: the empty
job list, `243:64` and `305:1833`, the contacts, `305:2266`, and a search that
finds nothing, `305:1684`, which keeps the button that adds a job opportunity.
The body is fixed at 220 and wraps; the title hugs one line and may be the
wider, as the contacts' is at 236, making that instance 300. Every instance
carries the button, and the component has no boolean to hide it, so the code's
action is required. KN-022.

**The title binds no text style.** It is 16 at SemiBold on the file's automatic
line height, 25 in Vazirmatn. It is composed from the roles, as the Status
Chip's M is: Title's size and line height, 16 and 24, with SemiBold. So the
state is 296 tall where the frame is 297.

**The mark is all but invisible where it is used.** Every screen puts the Empty
State on `bg/page`, `#f6f7f9`, and the mark is `#f3f4f6`, about 1.02 to one.
It is decorative, so no contrast rule applies, and it is drawn as the file
draws it; whether it should be `bg/surface` or carry an illustration is the
owner's call.

### The Loading State says why it is slow

Node `159:92` is three dots of 10, spacing/2xs apart, in `border/focus`, the
middle one lit and the others at 0.4, and the line «داره آگهی رو می‌خونه…» 16
below them in Body, `text/secondary`. Its only use is the Loading Panel of the
add flow, `243:965`, on `bg/surface`, so the dots frame's own `bg/surface` fill
is left out. The file draws one frame and its description leaves the motion to
code: each dot takes a turn of 300 ms, the state change of section 7, so the lit
dot crosses the three in 900, and the moment the middle one is lit is the
file's frame. A reader who asks for less motion gets that frame, standing
still.

**Past fifteen seconds the line changes.** Render's free tier sleeps and takes
up to a minute to wake, DEPLOY.md, and three dots alone for that long look
hung. So from fifteen seconds the line reads «هنوز داره می‌خونه. اگه سرور خواب
بوده، بیدار شدنش تا یه دقیقه طول می‌کشه.», which says it is still working and
names the likely cause without claiming it. The state is a status region, so a
screen reader reads the change out. The file draws no second line; the copy is
KN-022's, in the file's register. KN-022.

### The Bulk Action Bar

Node `401:436`, Type=Jobs `205:18` and Type=Contacts `401:428`: `bg/surface`
with a one pixel `border/default` edge inside, radius lg, 12 and 16 of padding,
12 between its parts, and its own shadow, `elevation.bulkBar`. From the inline
start, the file's description says so for RTL: the count, then on the Jobs type
Ghost «انتخاب همه» and Secondary «تغییر وضعیت», Destructive «حذف», all Button
S, a divider 1 by 24 in `border/default`, and a close, a 32 square of radius md
round the 20 x icon in `text/secondary`, which the code draws with the Icon
Button's states. The count is Body's size and line height with Label's weight
at no tracking, `text/primary`. On the screens it sits 24 above the bottom,
centred, `243:595` and `252:386`. The set's Secondary Action boolean is bound to
no layer, so it does nothing and the code has no such prop. KN-025.

**The count says «فرصت شغلی».** The file draws «۲ آگهی انتخاب شده», and the
selected items are job opportunities, which section 3's terminology rule, the
file's own and without exception, never calls «آگهی». The code follows the rule
and KN-329 asks the file to. The number is the reader's digits, and the English
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
field 44 tall of radius md with one pixel of `border/default` inside, 16 of
padding, the value in Body and the 20 chevron-down in `text/secondary` at the
inline end, 8 from the value. Default shows «انتخاب کنید…» in `text/secondary`;
Filled the choice in `text/primary`; Focus two pixels of `border/focus`;
Disabled `bg/surface-secondary` with the text and chevron `text/disabled`; Open
one and a half of `border/focus`, an inset shadow over the one pixel border
since Chromium floors a border of 1.5, and the chevron not turned. The set
draws **no Hover**, so the field has none, where the Input has one. The label
is the Input's, Label role. KN-012.

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
when they do not fit. The two selects the file names, «نوع همکاری» and «سطح
شغلی», are `EmploymentTypeSelect` and `JobLevelSelect`, their values English
ids and their names from the catalog. On the screens the only Select drawn is
the contact modal's «آگهی مربوطه», whose own prompt is why the prompt is a prop.

### The modals: the shell, Confirm and Change Status

Nodes `150:92` and `150:93` share a shell: `bg/surface`, radius lg,
`Elevation/Modal`, 24 of padding and 16 between its parts; a header of the
title in Heading/M and the 20 x at the other end, drawn as the Icon Button round
it with its overhang given back; a divider; the body; a divider; and the actions
at the inline end, 12 apart, the least drastic first. It sits centred over the
file's scrim, `overlay/scrim`, black at half, a variable of its own that the
Foundations board does not show, read with use_figma from `377:6244`; dark takes
it unchanged. It dissolves in and out over 150 ms, section 7. On MUI's Dialog it
traps focus, closes on Escape, the close or a press on the scrim, and gives
focus back to its trigger; the prototype wires no overlay, so the scrim's press
is a cancel, never the action. **Confirm** is 360 wide, its question as the
title and what cannot be undone in Body `text/secondary`, then Cancel and the
Destructive action; Cancel takes focus as it opens. Its body in the file says
«این آگهی»; the code says «این فرصت شغلی», KN-329. **Change Status** is 420 wide
round the Status Picker, then Cancel and Primary «تأیید»; the choice waits until
Confirm, and each opening starts from the job's status. The set's description
still speaks of a radio list with a name field; the component draws the chip
picker. KN-028.

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
error. KN-031.

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
set's description says; Selected adds `bg/brand/container`. **Compact**, for
the phone, is a row of 12 padding and gap, radius md: a 40 avatar in
`bg/brand/container`, the name at 14 and 500 over the role at 12 and 400 on
CSS's normal line height, and the mail and delete Icon Buttons; its Hover adds
a shadow of its own, `elevation.contactCardHover`. Email and phone are mailto
and tel links, LinkedIn opens in a new tab, a field the contact lacks draws no
row, and every value is cut with an ellipsis. The name is the card's button,
stretched over the card, so a press anywhere else opens the contact. The
Checkbox keeps its ring whole in the Title Group, which clips nothing, KN-293.
KN-026.

### The Status Picker, its choices and the Status Control

The **Status Choice**, `427:567`, is the medium Status Chip in a shell of 4,
radius full, ringed two pixels inside: none at rest, its `bg/surface` stroke
being invisible on the surface it sits on, `border/default` on Hover and
`border/focus` when Selected. The **Status Picker**, `427:592`, puts «وضعیت», the
Label role in `text/secondary`, 8 above a row of choices that wraps, 8 both
ways, each item at the top of its line, and ends it with the dashed «+ وضعیت
تازه», 28 tall, `text/brand`, a 16 plus, one pixel of `border/default` dashed
4 and 3, which CSS draws with its own dash. The choices are one radio group:
Tab reaches the chosen one and the arrows move and choose, the Color Picker's
way; the keyboard's choice takes the three pixel ring, told from Selected's two
by its width. The file uses it in the add form and the Change Status modal.

The **Status Control**, `199:21`, is the clickable wrapper the card and the job
modal put round a chip that stays display only: a pill 32 tall, `bg/surface`
with one pixel of `border/default`, 4 round the small chip and 8 beyond a 14
chevron, which is none of the icon sizes and is drawn at 14. Hover takes
`bg/surface-secondary`; Pressed, which it shows while the picker is open, takes
it too with one and a half of `border/focus`. It opens the picker in a panel of
372, the width the Change Status modal gives it, 4 below; choosing closes it
and hands the choice over, Escape closes it with nothing changed. The file
draws the Change Status modal, `150:93`, for this; the panel stands in until
the Modal, KN-028, is built. KN-020.

### The Sort Control

Node `408:512`: a control 36 tall of radius md with one pixel of
`border/default` inside and no fill, 12 of padding and 8 between its parts,
from the inline start the 16 sort icon, «مرتب‌سازی:» in Body `text/secondary`,
the order at Label's weight in `text/primary`, and the 16 chevron. Hover takes
`bg/surface-secondary`; Open takes it too with one and a half of `border/focus`.
Its menu, `447:601`, is the Options Menu at 240, **6** below the control where
the Select's is 4, hanging from the control's inline end, with the four orders
of section 3 as Option Rows. The set draws no Focus, so the keyboard's is the
Select family's two pixels. A change is read out from a status region, «مرتب‌شده
بر اساس» and the order. KN-024.

### The Menu and its items

Node `512:8350`: fixed at 220, `bg/surface`, one pixel of `border/default`
inside, radius md, 4 above and below its items, `Elevation/Card`. Its items,
`181:22`, are 40 tall with 12 of padding, Body at Regular, where the Option
Row's names are Medium: Default `text/primary`, Hover `bg/surface-secondary`,
Disabled `text/disabled`, Destructive `text/error`. Both menus end with their
delete after a one pixel divider, so a destructive item is told apart by its
place and its verb as well as its red. The menu opens instantly, hangs from its
trigger's inline end, closes on Escape or a press outside, and gives focus back
to the trigger. The file draws no focused item; the keyboard's takes the Hover
fill and the three pixel ring drawn inside. KN-018.

**Type=Status** is the column's menu: «تغییر نام», «تغییر رنگ», «حذف وضعیت». Delete
blocked, `259:295`, is the Disabled item with the reason in a Tooltip beside the
menu at its inline start; the item stays in the keyboard's path so the reason
can be read. Change colour replaces the menu with the Color Picker in its place,
`259:184`. **Type=Card** is a job opportunity's menu on a phone: «تغییر وضعیت»,
«باز کردن لینک آگهی», and delete, which the file labels «حذف آگهی»; the code says
«حذف فرصت شغلی» under the terminology rule, as KN-329 records for the bar's
count. A posting without a link has no link item.

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
open the Card menu, the Checkbox only while selected, and a meta row of 19, the
date's own line in the file, which the web font's normal line height would make
16. The stripe, `358:430`, is 4 wide at the card's inline start in the status's
base colour; a status the board no longer has takes `new`'s. The title is the
card's button, stretched over the card, so a press anywhere else opens the job
opportunity; a button takes the browser's font rather than the page's, so the
title's is given back. KN-015.

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

**Collapsed, the author's reading, not drawn in the file.** The owner's rejected
column, `رد شده ▸ 14`, is the column's frame holding its header alone, 300 by 64:
one button with the chip, the count and a chevron where the menu's icon was,
which says it is closed and opens the column. It keeps the column's width so the
board's rhythm and the drop target stay. The board decides which column starts
that way. KN-060.

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
reader's digits; a divider; a 16 spacer; «فضای کار» at 12 and Medium in
`text/disabled`; the three destinations; the room the file leaves; the language
switch, drawn as a Nav Item at rest with no icon, since the set has no language
glyph, its name where the items' names start; and «خروج» with `log-out`. Before
anyone signs in, the user and «خروج» are left out.

The tab bar, `185:19`, is the screen's width and 72 tall, `bg/surface` with one
pixel of `border/default` along the top: the same three destinations in equal
thirds, the board at the inline start, each a 24 icon 4 above its label at 12
and Medium, `text/secondary`, or `text/brand` for the current page. Nothing else
joins it. Below MUI's md, 900, it replaces the sidebar, pinned to the foot of
the screen, and the page keeps its 72 clear; the file says it gives way to the
Bulk Action Bar while selecting, which is the board's to do. KN-027.

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
itself draws it at 1.24 to one on white. The change between a focused and an
unfocused control, WCAG 2.4.13's measure, is each component's own, KN-244 for
the Input.

---

## 2. Component families

Canvas `5:5`. Build these first, each with its story, before any screen exists.
The states listed are the ones the file actually draws, and all of them are part
of the contract.

| Family              | Node      | What it draws                                                                                   |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------- |
| Button              | `31:4`    | 3 sizes S/M/L × 5 styles Primary/Secondary/Text/Destructive/Ghost × 5 states                     |
| Status Chip         | `82:2`    | 9 statuses × 2 sizes S/M, display only                                                          |
| Status Choice       | `427:567` | Default, Hover, Selected                                                                        |
| Status Picker       | `427:592` | the popover that assigns a status                                                               |
| Status Control      | `199:2`   | the clickable wrapper around a chip, Default/Hover/Pressed                                      |
| Input               | `95:39`   | Default, Filled, Focus, Error, Disabled, Hover                                                  |
| Card                | `137:44`  | Default, Hover, Pressed, Selected, Static, Focus, desktop                                       |
| Card / Mobile       | `491:751` | Default, Selected                                                                               |
| Status Stripe       | `358:430` | the 4px colour bar on the card, one per status                                                  |
| Modal / Confirm     | `150:92`  | delete and archive confirmation                                                                 |
| Modal / Change Status | `150:93` |                                                                                                 |
| Modal / Add-Edit    | `166:82`  | steps Paste, PasteFilled, Loading, Review, Manual, Error                                        |
| Page Header         | `155:56`  | title, optional back button, optional primary action                                            |
| Search Bar          | `155:92`  | Default, Focus, Filled                                                                          |
| Filter Chip         | `159:71`  | Default, Hover, Pressed, Selected, doubles as the status counter                                |
| Empty State         | `159:80`  | title and body as text properties, a required Primary M action; used for jobs, contacts and search |
| Loading State       | `159:92`  | three dots taking 300 ms turns; the line says why past fifteen seconds                          |
| Menu Item           | `181:22`  | Default, Hover, Disabled, Destructive                                                           |
| Menu                | `512:8350`| Type=Status, Type=Card                                                                          |
| Select              | `183:26`  | Default, Filled, Focus, Disabled, Open                                                          |
| Option Row          | `408:465` | Default, Hover, Selected, Disabled                                                              |
| Sort Control        | `408:512` | Default, Hover, Open                                                                            |
| Tooltip             | `410:469` | FIXED 260 wide, text fills the rest; no variable bound to the width, so it is a component constant |
| Nav Item / Side     | `184:14`  | Default, Active, Hover                                                                          |
| Nav / Sidebar       | `185:11`  | desktop, on the RIGHT                                                                           |
| Nav / Tab Bar       | `185:19`  | mobile, at the bottom                                                                           |
| Checkbox            | `204:11`  | Unchecked, Checked, Indeterminate, Hover, Disabled                                              |
| Tab Item            | `204:20`  | Default, Active, Hover                                                                          |
| Bulk Action Bar     | `401:436` | Type=Jobs, Type=Contacts                                                                        |
| Job Modal           | `210:276` | tabs Info, Note, Contacts, Files                                                                |
| Icon                | `239:44`  | 30 icons, 24×24, 2px stroke, round cap and join                                                 |
| Icon Button         | `460:672` | Neutral and Danger × Default, Hover, Disabled                                                   |
| Contact Card        | `248:116` | Full and Compact × Default, Hover, Selected                                                     |
| Contact Modal       | `270:152` | Add, Edit                                                                                       |
| Color Picker        | `257:17`  | offers the nine status colour pairs, the current one marked                                     |

The icon set, all at 24×24: link, search, x, arrow-right, plus, check, mail,
trash, pencil, chevron-down, more, download, file, external-link, user, phone,
building, calendar, map-pin, briefcase, banknote, clock, log-out, filter, sort,
alert-circle, user-plus, tag, layers, note. Default colour `text/secondary`,
overridable per instance. Every icon keeps its two pixel stroke at every size: the file's
instances resize the drawing and not the stroke, as the Color Picker's 14
pixel check shows, so the Icon draws a non-scaling stroke, KN-008.

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
«+ وضعیت تازه» chip that creates a new status in place.

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
is **open, tracked by KN-075**, see section 6: the design draws the flow but not
the field list, and it cannot be settled by reading the file.

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

**وضعیت, status:** the five defaults, plus «+ وضعیت تازه» to create one. Two
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
The Input, the Checkbox and the Select when it is built use it; the Hover edge
keeps its drawn colour, and cards, dividers and the Filter Chip keep
`border/default`. Like the order of the columns and the history tab, this
departs from the file on the owner's call. KN-275 builds it.

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
from pressing. KN-279 builds it, after KN-272 fixes the dark fill.

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
`407:7071`. The Login card is 440 by 387: a brand row, a heading of
«ورود به کارنما» over «شماره موبایلت را وارد کن», one Input, one primary action,
and a terms note. Login then Code then Signup is what makes the phone OTP flow
unambiguous.

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
