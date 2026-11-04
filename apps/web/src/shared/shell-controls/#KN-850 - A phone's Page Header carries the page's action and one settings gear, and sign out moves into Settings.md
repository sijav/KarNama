# KN-850 · A phone's Page Header carries the page's action and one settings gear, and sign out moves into Settings

**Why**, from the board: Tab Bar v2, KN-783, takes add out of a phone's bottom
bar, and a phone's board has no other way to add a job opportunity once there
is anything on it; the owner chose this header over an icon-button add or
keeping the old tab bar.

**Exit**, from the board: JobsScreen's phone stories show the header as
1274:64227 draws it, the title and the Button S add with its plus at the inline
end, and one Settings gear, with no language or sign-out button; the Settings
dialog's stories show «خروج» when it is given onSignOut and none without, and
pressing it signs out; the network page's phone header carries its add contact
and the gear; in fa-IR and en-US, light and dark, with both story-docs entries;
DESIGN.md section 5 records the owner's answer; lint, tsc and the tests pass.

## The owner's answer, 2026-11-04

Asked through the question card how a phone's header should work once the
redesign moves adding into it, the owner chose **"Gear holds the rest"**:

- the title and Figma's Primary Button S «افزودن فرصت شغلی» exactly;
- one settings gear after it;
- sign out moves inside the Settings dialog, which already holds the language;
- the title may be cut a little at 390, more in English.

They passed over two other choices: the add as an icon button beside all three
shell controls, and keeping add in the tab bar.

## What the file draws

`1274:64227`, the phone board's Header: 16 round, 12 below. Its Title Row, 358
wide, has the Page Header «فرصت‌های شغلی من» at the inline start and Button / S,
Primary, Leading Icon on, «افزودن فرصت شغلی», at the inline end. No shell
control is drawn anywhere on the phone.

## The approach

1. `ShellControls` with `placement="header"` is the `SettingsControl` gear
   alone; the sidebar's row of three is unchanged.
2. `SettingsControl` takes `onSignOut`; its dialog then carries «خروج», a
   secondary Button with `log-out`, which closes the dialog and signs out.
   `SettingsDialog` takes the same prop.
3. `PageHeader` hands its `onSignOut` to that gear, as it handed it to the row.
4. `JobsScreen` gives its Page Header the add on a phone too, Button S with its
   plus, opening the flow as the desktop's button does.
5. The stories and e2e specs that pressed a phone header's language or «خروج»
   go through Settings; `e2e/session.ts` gains `signOut`, which takes the
   sidebar's button on a desktop and Settings' on a phone.

## How it is checked

These stories: the shell controls', the settings control's and dialog's, the
Page Header's, the App's, the board's and the network page's. A planted
three-button header must fail them. Also the e2e shell, sign-in, connected,
settings and address specs in both projects, the docs guard, lint, tsc, and a
look at the phone board against the frame.
