# KN-762 · The delete modal with a reason, Modal / Delete 865:33825 and Reason Option 865:33595

**Why**, from the board: components before screens; the redesigned board and
the job modal compose it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 865:33825 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
865:33825; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Modal / Delete**, Reason هیچ, مهم نیست, جواب نگرفتم and اشتباه: 400 wide,
  «حذف این فرصت شغلی؟»; «چرا می‌خواید حذفش کنید؟» 14 on 22 at Medium and «لازم
  نیست انتخاب کنید.» 12 on the automatic 19, 4 apart; three Reason Options 8
  apart: «دیگه دنبالش نیستم», «جوابی نگرفتم», «اشتباهی یا تکراری اضافه شده».
- **None and mistake**: the Ghost «نگه داشتن» and the Destructive «حذف», 395 tall.
- **Not wanted and no answer**: a hint in `#eff4ff` at radius 10, 10 and 12 in,
  13 on the automatic 20, «به‌جای حذف، می‌تونید ببریدش به «انصراف» …» or
  «… «بی‌پاسخ» …»; the footer Keep, the Text style's «حذف», its label bound to
  `bg/danger/default`, and the Primary «بردن به انصراف» or «بردن به بی‌پاسخ»;
  471 tall.
- **Reason Option**, Default, Selected, Hover, Selected Hover: 44 tall, radius
  10, 11 and 14 in, 10 between, an 18 radio at the inline start; one pixel of
  `border/default` at rest, `text/secondary` under the pointer; chosen
  `#eff4ff` inside one and a half of `bg/brand/default`, the radio five of it.
- The description: Keep is not «انصراف», a status's name; a card made the same
  day is deleted without this window.

## The approach

1. `bg/brand/subtle`, `#eff4ff`, a role no variable carries, a dark fill in
   dark under `text/primary` at 4.5.
2. `ReasonOption`: a label row holding MUI's Radio with its own ring, its state
   from the radio group.
3. `DeleteJobModal`: open, the two outcomes' names, onDelete(reason or null),
   onMove(withdrawn or no response), onKeep; the reason forgotten on each
   opening; Keep focused as it opens.
4. The red Text «حذف» in `text/error` through `destructive-text`, since the
   file's `bg/danger/default` reads at 3.8 to one.
5. Stories for both, docs, tokens, the catalog and DESIGN.md.

## How it is checked

Their stories, with planted wrong sizes failing them, the docs guard, the
tokens and dark contrast tests, lint, tsc and a look against the four frames.
