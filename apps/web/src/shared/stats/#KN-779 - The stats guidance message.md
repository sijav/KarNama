# KN-779 · The stats guidance message, Stats / Guidance 1168:3170

**Why**, from the board: components before screens; the redesigned Stats page
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1168:3170 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1168:3170; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-04

- **Stats / Guidance**, 1168:3170, one component with no variants and one
  text property, Message: a row 1136 wide that hugs its height, 60,
  `color/bg/brand/container` at `radius/md`, `spacing/sm` above and below,
  `spacing/md` at the sides and `spacing/md` between, its items centred.
- From the inline start, the Message in Body, `color/text/primary`, filling
  the row and wrapping, «۳ درخواست بیشتر از ۳ هفته‌ست بی‌جواب موندن. اونها رو به
  «بی‌پاسخ» ببرید.»; at the inline end the Action, an instance of Button / S,
  Style=Secondary, «دیدن درخواست‌ها», no icons and no fill of its own, so the
  ground shows through it, unlike the Company Match's Connect.
- Its description: the guidance at the top of the Stats page, at most two,
  made by a fixed rule from the reader's own data, never «پیگیری کنید»; the
  text from the Message property, the Action with its own label; message one
  the applications unanswered for more than three weeks, message two a week
  with no application.
- Its instances, one in each of five Stats frames, `1204:284` in 714:42197
  among them, fill a Content of 1200 less 32 at each side, its first child, 16
  above the requests card; the frames of a reader with one to nine
  applications draw none.
- The handoff: guidance one links to those applications; guidance two, «این
  هفته هنوز درخواستی ثبت نکردید. ۵ فرصت شغلی ذخیره‌شده دارید.» with «دیدن
  فرصت‌های ذخیره‌شده», has no frame, and its exact rule is open.

## The approach

1. `StatsGuidance` in `shared/stats`: the message, and an optional action,
   `{ label, onClick }` as the Toast's, a Secondary S at the inline end. It
   fills its container's width, as the instances do. The card calls the
   action optional, and the file has no property to hide it; without one the
   message fills the row.
2. The two messages of the handoff are fixtures in both languages; the page
   writes them from its rules and the catalog, KN-823, and decides which, at
   most two, to show.
3. Stories: the file's measure with each message, the action by pointer and
   keyboard, no action, a narrow width where the message wraps and the action
   stays centred, English and dark.

## How it is checked

Its stories, lint, tsc, the unit suites, and a look in both schemes.
