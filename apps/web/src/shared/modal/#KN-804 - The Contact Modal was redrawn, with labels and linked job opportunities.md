# KN-804 · The Contact Modal was redrawn, with labels and linked job opportunities

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the network's add and edit are this modal.

**Exit**, from the board: the plan lists every difference between 270:152 in
the copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its
stories then draw the original's version of every variant, each new variant
with a story of its own, in fa-IR and en-US, light and dark, with both
story-docs entries; sizes, gaps, radii and colours resolve through the tokens;
DESIGN.md's section is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-04

Node 270:152, Mode=Add (270:74) and Mode=Edit (270:151), in the copy and in the
original K1EP8GCOmelU8o4vPR7a9f:

| What                    | The copy                                                | The original                                                                       |
| ----------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Height                  | 581 and 581, the body 435                               | 676 and 769, the body 530 and 623                                                  |
| Title                   | «افزودن مخاطب», «ویرایش مخاطب»                          | «افزودن به شبکه», «ویرایش اطلاعات»                                                 |
| After the role, company | the email and the phone                                 | Label Picker 1086:3004, 56 tall: Default in Add, Selected on «کارشناس جذب» in Edit |
| The last field          | Select «آگهی مربوطه», «یک آگهی انتخاب کن…»              | Linked Jobs 1092:3103: Empty in Add, 90 tall; Filled in Edit, 183, two rows        |
| Add's primary           | «ذخیره», State=Default                                  | «افزودن», State=Disabled                                                           |
| Edit's primary          | «ذخیره», State=Default                                  | «ذخیره», State=Disabled                                                            |
| Edit's delete           | «حذف مخاطب» at the inline end, the actions at the start | «حذف از شبکه» at the inline start, the actions at the end                          |

The same in both: 560 wide at radius 16; the header 68, 24 above and at the
sides and 16 below, with the 20 close and the title; the dividers edge to edge;
the body in 24 with 16 between; a field 512, or two of 248 16 apart, «سمت»
beside «شرکت» and «ایمیل» beside «شماره تماس»; the footer 76, in 16 and 24, 12
between, Cancel before the primary; every label and placeholder.

## What the frames ask of the code

- **The primary is off until it can do something.** Add draws «افزودن» off with
  every field empty, and the name is the only required field; Edit draws «ذخیره»
  off over an unchanged record, which the handoff says of the job modal's
  «ذخیره» too. So Add's is on once a name is written, Edit's once anything differs
  from the record and the name is still there. Nothing can then be saved without
  a name, and the error «اسم و فامیل را بنویس» has nothing left to show.
- **The label is the person's**, one or none. Making, renaming and deleting
  labels change the reader's labels at once, as the picker's in-row delete says
  of the people who carry one: the modal hands each on to the page, and the
  label it makes is the one it chooses.
- **A person links to any number of job opportunities**, each shown with its
  status, as the handoff's «یک نفر به چند فرصت شغلی وصل می‌شود».

## The approach

1. `PanelModal`: the aside first, at the inline start, the actions at the end.
2. `ContactModal`: the values gain `label` and `jobIds`, in place of `jobId`; the
   props take `jobs` as Linked Job items, and the reader's `labels` with
   `onCreateLabel`, which returns the new label's id as the records' `addStatus`
   does, `onRenameLabel` and `onDeleteLabel`. The titles, the primary and the
   delete as the original writes them; the Label Picker after the role and the
   company, the Linked Jobs last.
3. The screens keep what the records hold today, the first linked job
   opportunity and no label, until KN-738 gives the records labels and many
   links and KN-822 draws the network's add and edit.
4. The catalog's 'Edit details' «ویرایش اطلاعات» and 'Delete from network' «حذف از
   شبکه»; 'Write the full name', 'Choose a job opportunity…', 'Related job
   opportunity' and 'Edit contact' go once nothing uses them.
5. Stories: Add and Edit measured to the frames, the primary off and on,
   choosing, making and deleting a label, linking and unlinking, the delete at
   the inline start, English and dark.
6. Both docs, and DESIGN.md's section.

## How it is checked

The stories, with planted wrong values failing them, the docs guard, the
catalog test, lint, tsc, the screens' stories, a look against the frames, and
the published check.
