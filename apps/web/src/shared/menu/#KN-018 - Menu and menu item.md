# KN-018 · Menu and menu item

Beside the menus. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** All four item states match Figma, both
menu types render, the menu closes on Escape and on outside click and returns
focus to its trigger, and destructive items are distinguishable without relying
on colour alone.

## What was built

- From nodes 181:22 and 512:8350, read with use_figma: a Menu on MUI's Menu,
  220 wide with Elevation/Card, and its items in their four states, the
  destructive ones last after a divider, so their place and their verb mark them
  as well as their red. It opens instantly from the trigger's inline end,
  closes on Escape or a press outside, and gives focus back.
- Type=Status as `StatusMenu`: rename, change colour and delete. Delete is
  disabled while the column holds job opportunities, stays reachable by the
  keyboard, and gives its reason in a Tooltip beside the menu, 259:295, for
  which the Tooltip gained a `start` placement. Change colour replaces the menu
  with the Color Picker in the same place, 259:184, and focus goes back to the
  trigger once it closes.
- Type=Card as `CardMenu`: change status, open the posting's link when there
  is one, and delete, said «حذف فرصت شغلی» under the terminology rule, KN-329.
- The Tooltip folder gained its barrel.
- Stories: ItemStates, ClosesAndGivesFocusBack and InEnglish for the Menu;
  Default, DeleteBlocked, ChangeColour and InEnglish for the Status menu;
  Default and WithoutALink for the Card menu; seen headless in a production
  build.
