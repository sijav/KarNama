# KN-759 · The column sort controls: Column Header / Sort 961:97159, Menu / Sort 912:40045, Menu / Sort (Custom) 919:2886 and Menu Item / Check 912:40044

**Why**, from the board: components before screens; the redesigned board's
column headers compose these, and cannot be built to the design until they
exist.

**Exit**, from the board: a story per variant of 961:97159, 912:40045, 919:2886
and 912:40044 renders it in fa-IR and en-US, light and dark, with both
story-docs entries; every size, gap, radius and colour resolves through the
tokens and matches `get_design_context` on the four nodes; `DESIGN.md` names
the nodes, their states and their rules; lint, tsc and the tests pass.

## What the file draws, read 2026-11-04

- **Column Header / Sort**, 961:97159, State Default and Hover: the column's
  order as a caption, 11 on 17 at Regular, `color/text/disabled` at rest and
  `color/text/primary` under the pointer, then Icon / more, 16, in
  `color/text/secondary`, 8 apart. On the board, 983:104369, it sits at the
  inline end of the 276 wide Column Header, 4 in.
- **Menu / Sort**, 912:40045: 220 wide, radius 8, `color/bg/surface` with one
  pixel of `color/border/default` inside and in layout, Elevation/Card's two
  shadows unbound, 4 above and below. Its Group, padded 8 above, 12 at the sides
  and 4 below, says «مرتب‌سازی این ستون» at 12 on Figma's automatic 19, Medium,
  in #9ca3af, `text/disabled`; then the options, Menu Item / Check. Its
  description: it opens under the order's caption, its left edge on the column
  header's, 4 below the header, drawn like the card's ⋯ menu.
- **Menu / Sort (Custom)**, 919:2886: the same, then 4, a one pixel divider of
  #e5e7eb, `border/default`, and two Menu Items, «ویرایش وضعیت» Default and
  «حذف وضعیت» Destructive. Its description: a reader-made stage's header menu,
  order, edit and delete; the default stages have Menu / Sort alone.
- **Menu Item / Check**, 912:40044, State Default, Hover, Selected and Selected
  Hover: 40 tall, 12 at the sides, 8 between; the label 14 on 22 at Regular in
  #111827, `text/primary`; a 16 room for the tick at the inline start. Hover
  fills #f3f4f6, `bg/surface-secondary`; Selected draws the label at Medium in
  #1d4ed8, `text/brand`, and the check icon in it; Selected Hover both.
- **The screens**, 912:82571, 912:83039, 912:83507 and 912:83975, open each
  column's menu. Saved: «به ترتیب مهلت (پیش‌فرض)», «تازه‌ترین ذخیره»,
  «قدیمی‌ترین ذخیره», «نام شرکت», captioned «به ترتیب مهلت». Applied: «زمان
  انتظار (پیش‌فرض)», «تازه‌ترین درخواست», «قدیمی‌ترین درخواست», «نام شرکت»,
  captioned «به ترتیب زمان انتظار». Interview: «تاریخ مصاحبه (پیش‌فرض)»,
  «تازه‌ترین ورود», «قدیمی‌ترین ورود», «نام شرکت», captioned «به ترتیب تاریخ
  مصاحبه». Offer, and a reader-made stage: «به ترتیب ورود (پیش‌فرض)»,
  «قدیمی‌ترین ورود», «نام شرکت», captioned «به ترتیب ورود».

## The approach

1. A new `shared/sort-menu`. `columnOrders(i18n, kind)` lists each column's
   orders as the screens do, the default first, each with its menu label and its
   caption; `newest` and `oldest` mean by the column's own date. The order
   itself, and keeping it, is KN-736's.
2. `SortCaption`: a button showing the caption and the ⋯, named by the caption
   and the column, which says it opens a menu and whether it is open.
3. `CheckMenuItem`: a menu item that is a radio, checked or not, on the menu
   items' look.
4. `SortMenu`: MUI's Menu, anchored by the board on the column header, hanging
   from its inline end 4 below; the group label names it; choosing an order
   closes it and hands the order over; with `onEdit` and `onDelete`, the custom
   stage's divider and two actions. The plain items take their look from the
   shared Menu's, which moves into one place for both.
5. Tokens `sortCaption` and `sortMenuLabel`; the catalog's orders, '(default)',
   'Sort this column', 'Edit status' and 'in the column'.
6. Stories for every variant, the keyboard, a choice, the custom stage, English
   and dark.

## How it is checked

Its stories, the Menu's own stories after the move, the tokens test, lint, tsc,
the unit suites and a look.
