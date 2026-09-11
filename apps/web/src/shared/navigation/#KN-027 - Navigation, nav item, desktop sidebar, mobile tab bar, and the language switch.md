# KN-027 · Navigation, nav item, desktop sidebar, mobile tab bar, and the language switch

Beside the navigation. Recorded after the build, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The sidebar renders on the right in Persian
and mirrors correctly in English, the tab bar replaces it at the mobile
breakpoint, exactly three destinations exist and are named with the current
terminology, the language switch changes locale and direction and persists, and
no fourth tab bar entry was added.

## What was built

- From nodes 184:14, 185:11 and 185:19, read with use_figma: the Nav Item in
  Default, Active and Hover, its hover over the file's 120 ms ease out; the
  sidebar with the brand, the user, «فضای کار», the three destinations and
  «خروج»; the tab bar of the same three in thirds.
- The three destinations live once, in `destinations.ts`, named «فرصت‌های شغلی
  من», «افزودن فرصت شغلی» and «شبکه من»; the tab bar has no fourth.
- The language switch sits at the sidebar's foot, DESIGN.md section 5, drawn as
  a Nav Item at rest; it changes the locale and the direction, and the
  preferences provider keeps the choice. On a phone it stays in the Page Header.
- `Navigation` shows the sidebar from MUI's md, 900, and the tab bar below it,
  pinned to the foot; the shell now carries it in place of the switch that sat
  there, with no user and no signing out until those exist.
- Found on the way: MUI read the divider's bare `height: 1` as the whole
  height, the lesson already in STATE.md; it is `1px` now.
- Stories: NavItem Default, Active, Hover, Focus and InEnglish; Sidebar
  Default, NetworkCurrent, WithoutUser, SwitchLanguage and InEnglish; TabBar
  Default and InEnglish; Navigation Default and Breakpoint, which resizes the
  runner's screen. Seen headless in a production build, the shell at 1440 and 390.
