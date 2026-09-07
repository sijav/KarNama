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

`bg/danger/*`, `text/error`, `accent/*` and `gray/200` were read from component
frames rather than from the Foundations overview, so they are real but they are
not on the Foundations board. Do not delete them as strays.

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
data, not a constant. The nine colours are a closed set: a custom status picks
one of the four reserved slots through the Color Picker at `257:17`.

### Spacing, radius, icon size

```
spacing  2xs 4   xs 8   sm 12   md 16   lg 24   xl 32   2xl 48   3xl 64
radius   none 0  sm 4   md 8    lg 16   full 999
icon     sm 16   md 20  base 24
```

`Elevation/Card` is two stacked drop shadows: `#0000000F` at `0 1 3`, and
`#0000000A` at `0 1 2`. It is the only elevation in the file.

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
- `Size=M`, 14px, height 28, is **only** for the kanban column header.

Reaching for the large size anywhere else is a departure from the design.

### Dark mode

**The file defines light values only.** There are no dark tokens. Any dark
palette is derived, and must be labelled in the code as derived rather than
presented as the design's. Replace it wholesale if the design ever ships real
dark tokens.

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
| Empty State         | `159:80`  |                                                                                                 |
| Loading State       | `159:92`  |                                                                                                 |
| Menu Item           | `181:22`  | Default, Hover, Disabled, Destructive                                                           |
| Menu                | `512:8350`| Type=Status, Type=Card                                                                          |
| Select              | `183:26`  | Default, Filled, Focus, Disabled, Open                                                          |
| Option Row          | `408:465` | Default, Hover, Selected, Disabled                                                              |
| Sort Control        | `408:512` | Default, Hover, Open                                                                            |
| Tooltip             | `410:469` |                                                                                                 |
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
| Color Picker        | `257:17`  | picks one of the four custom status slots                                                       |

The icon set, all at 24×24: link, search, x, arrow-right, plus, check, mail,
trash, pencil, chevron-down, more, download, file, external-link, user, phone,
building, calendar, map-pin, briefcase, banknote, clock, log-out, filter, sort,
alert-circle, user-plus, tag, layers, note. Default colour `text/secondary`,
overridable per instance.

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
ذخیره‌شده, so read right to left the order is ذخیره‌شده, درخواست‌شده, مصاحبه,
رد شده, پیشنهاد کار. A column is 300 by 684, holding a 276 by 40 header, cards
at 276 by 148, and an `Add Card` row pinned at the bottom. `Add Column` is
labelled «افزودن وضعیت», add status, which is the plainest statement that a
column IS a status.

**The Status Chip is display only.** It has no click target and no focus ring.
The interactive version is a separate wrapper, `Status Control`, and that is
what the card uses. Do not merge them.

**Custom statuses are managed inline**, through the column Menu, which has
exactly **three** options: rename, change colour, delete. **Reorder was removed
from the design**, so a menu offering four options is wrong. The four custom
colour slots are fixed, so "change colour" means choosing among them rather than
a free colour. Delete is disabled while the column still holds postings, and the
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

**Bulk selection has no bar above the columns.** A dark bar floats at the
**bottom** of the page carrying the count, «انتقال به...», «حذف» and a close.

**Sorting** offers exactly four options: تازه‌ترین, قدیمی‌ترین,
نزدیک‌ترین مهلت, and نام شرکت alphabetically.

**RTL is `direction: rtl` with the natural array order.** The file says this
outright, twice, for the contacts grid and as a general principle. Figma reverses
its arrays because horizontal Auto Layout always lays out left to right; code
must not copy that. Reversing an array in code to "fix" RTL is a defect.

**The Job Modal replaces a detail page**, with four tabs: اطلاعات آگهی,
یادداشت, مخاطبین, فایل‌ها. Status history currently sits at the bottom of the
Info tab, which the file flags as open item 18. Build it where the file puts it,
and raise the question separately.

**A Contact Card has no detail view.** Everything about a contact is on the
card itself. There is a Contact Modal, but only for Add and Edit.

**The add-job flow is Paste, then Loading, then Review**, with Manual as the
fallback path and Error as the failure path. The Review fields are provisional
until the Job Record shape is finalised.

**Auth is phone OTP**: a mobile number, then a five digit code. The Screens
canvas draws Login, Code and Signup for both desktop and mobile at page-map row
6, and the Login card asks for «شماره موبایلت را وارد کن». The owner confirmed
this over an earlier email-magic-link decision, and added: email stays as a
fallback behind the same interface, and **for the MVP the provider is mocked**,
so no real SMS is sent. Build it provider-agnostic with a fake that logs the
code, so nothing blocks on SMS credit.

### Terminology, which is a hard rule rather than a preference

The Documentation canvas records sixteen copy changes and states the rule
directly. It is not stylistic: the two words mean different things.

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

## 4. Where the language switch goes

The owner asked for a language button in the menu bar, placed so it does not
destroy anything in the design. The design has no language control, because it
was drawn Persian-only.

The rule for it: it goes in the **existing** app chrome and adds no new chrome.
On desktop that is the bottom of the sidebar (`185:11`), below the nav items,
where the sidebar already has empty space and already carries a `log-out` icon
in the icon set. On mobile the tab bar carries the three drawn destinations and
a fourth entry would change the design, so the switch belongs in the Page Header
(`155:56`) as an optional trailing action rather than in the tab bar.

Nothing else moves. If honouring this ever requires resizing or reflowing a
drawn frame, stop and ask the owner rather than editing the design by hand.

---

### Enumerated field values, from `434:33`

Provisional, see the open questions below. English on the left because message
ids are English, Persian on the right because that is what ships by default.

**نوع همکاری, employment type:** full-time تمام‌وقت · part-time پاره‌وقت ·
internship کارآموزی · remote دورکاری · contract قراردادی · project پروژه‌ای

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

## 5. Open questions the design has not settled

These are flagged in the file itself. They are the designer's or the owner's
call, not a build decision, and nothing should quietly resolve them by picking
one while implementing.

- **Where «رد شده» belongs.** Frame `434:16` marks it with a warning: should
  rejected stay as the last stage of the pipeline, or move off the board
  entirely? Undecided.
- **Whether a contact needs a contact route.** Frame `434:2` notes that only the
  full name is required, and that a contact with no email and no phone is
  practically useless, so QA should decide whether "email or phone" becomes a
  required one-of-two.
- **Where status history belongs.** The Components canvas flags it as open item
  18. It currently sits at the bottom of the Info tab, and that is where it gets
  built until someone decides otherwise.
- **The employment type and job level option lists** at `434:33` are marked
  **unconfirmed**: they were never checked against Jobinja and Jobvision because
  the network blocked it. Treat the values as provisional.

One contradiction between two documentation frames, already resolved:
principle 5 at `376:9` forbids colloquial Persian outright, while the
copywriting frame at `505:3` requires it for microcopy and formal Persian only
for UI labels. **`505:3` wins**: it is the later revision and it enumerates
sixteen concrete changes that were applied, one of which reverts a wrong
colloquial edit on a UI label. Principle 5 is superseded, do not re-apply it.

## 6. RTL, and what it does to the DOM

The design is laid out right to left. A panel drawn on the **left** of a frame
comes **second** in the DOM, and one on the right comes first. Read the child
`x` coordinates from `get_metadata` and order the JSX from those, do not
eyeball it from a screenshot. This is the single most common way a
Persian-first layout gets built backwards.

The app defaults to Persian and the user can switch to English, so direction is
a runtime value, not a build-time one. Every layout has to be correct in both.
English strings are longer than Persian, so a row that fits in Persian can
overflow in English; check both before calling a layout done.
