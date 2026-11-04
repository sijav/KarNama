# KN-745 · The redesigned job card, Card / Kanban 793:1820

**Why**, from the board: components before screens; the redesigned board, every
frame of which is made of it, composes it, and cannot be built to the design
until it exists.

**Exit**, from the board: a story per variant of 793:1820 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches get_design_context on
793:1820; DESIGN.md names the node, its states and its rules; lint, tsc and its
tests pass.

## What the file draws, read 2026-11-04

**Card / Kanban**, `793:1820`, has nine variants: State Default, Hover and Select
Hover, each with the deadline مهلت عادی, نزدیک or تمام‌شده. Its description and
its documentation frame, `812:55419`, give the rules; the screens' 1301
instances show which parts the board uses.

- **The frame**: 276 wide, hugging its height; `spacing/md` round and
  `spacing/sm` between; `bg/surface` inside one pixel of `border/default`, radius
  8. The Status Stripe, 4 wide and the full height, in the status's colour, sits
  at the inline start.
- **The head**, 12 between its parts, from the inline start:
  - the Select slot, a 20 Checkbox, while the board is selecting;
  - the Company Logo, 36 at radius 8;
  - the title, 14 on 22 at Medium in `text/primary`, over the company, 12 on 19
    in `text/secondary`, each one line, cut;
  - on Hover, the More button, a Neutral Icon Button 28 square with `more`.
- **The meta line**, 6 apart: the location, a `·` in `text/disabled`, and the
  salary, each 12 on 19 in `text/secondary`.
- **The interview slot**, Card / Interview Slot `656:6291`, is KN-747's. The
  card gives it a slot.
- **The note line**: `note` at 14 in `text/secondary`, then the note, 12 on 19
  in `text/primary`, one line, cut.
- **The prompt**: «هنوز منتظرید؟» in `text/primary` and Link / Inline «بی‌پاسخ
  موند» at the inline end. It sits on `bg/surface-secondary` at radius 6, 6 and
  8 in.
- **The footer**, 10 between its parts:
  - the source at the inline start;
  - every time at the inline end: the saved date in Regular, or the deadline,
    `clock` at 16 then the words in Medium, red at near;
  - then the pencil, Card / Edit Icon `793:1770`, 28 by 19 at radius 5 with a
    14 `pencil`, `bg/surface-secondary` under the pointer.
- **Hover**: the shadow `#121726` at 10 percent, 4 below, blur 12, and the More
  button. **Select Hover**: the shadow, with the Checkbox in its own hover. The
  hover animates over 150 ms.
- **Selected**: the Checkbox ticked and a ring of two of the brand inside the
  edge.
- **Unused on the screens**: the Next row, the counters and the pencil as an
  instance setting. The board's cards draw none of them, so the code has none.

## The approach

1. Tokens:
   - `elevation.kanbanCard`, `0 4px 12px 0 #1217261A`;
   - the card's unbound text, `kanbanTitle` 14/22/500, `kanbanText` 12/19/400
     and `kanbanDeadline` 12/19/500.
2. The Icon Button gains `compact`, the 28 square.
3. `KanbanCard` in `shared/kanban-card`. It takes:
   - the job's words and logo, its status, its note;
   - the footer `cardFooter` returns;
   - an interview slot;
   - `onNoResponse` for the prompt;
   - the selection and the opener;
   - `onMore` and `onEditDate`, each given its anchor.

   The title is the card's button and its `::after` covers the card, so a press
   anywhere else opens it. While selecting, a press toggles the selection
   instead, as the handoff asks. More and the pencil show under the pointer,
   with the keyboard's focus inside, and More always where there is no hover.
4. The fixtures gain the frame's card copy in both languages.
5. Stories: the nine variants, plus selecting, selected, the note and the
   prompt, English, dark and a touch screen.

## How it is checked

The card's stories, measured against the frame; planted wrong sizes must fail
them. Also the Icon Button's stories, the token and theme suites, the docs
guard, lint, tsc, and a look against the frames.
