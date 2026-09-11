# KN-029 · Add and edit job modal, all six steps

Beside the modal. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** All six steps match Figma, every step is
reachable in a story, Error offers Manual as the way out, Review is fully
editable before saving, and leaving the modal mid-flow asks before discarding.

## What was built

- From node 166:82, read with use_figma: Paste, PasteFilled, Review, Manual and
  Error in the shell at 560, and Loading as the panel of 243:964 at 360, in the
  same dialog so focus and the dissolve stay with it.
- The Input gained `multiline`, the paste field's 140 with its text 16 from
  every edge, and `required`, the owner's KN-075 mark after the label with
  `aria-required`; both are stories of the Input. The Modal's header, dividers,
  actions, paper and scrim became exports, so the flow composes them.
- `draft.ts` holds the record's shape, the link test, the required fields and
  whether anything was entered, unit tested. Review and Manual are one form,
  DESIGN.md section 4.
- Extract waits for a filled, touched field; reading shows the panel, which
  takes focus so Escape can leave it; each later step starts at its first
  field. Error keeps what was pasted and offers Try again and the manual row.
  Leaving with anything entered asks in the Confirm modal.
- The story fixtures gained what reading a posting finds, in both languages.
- Found on the way, filed: KN-357, the Select's `notched` warning.
- Stories: Paste, PasteFilled, ExtractsToReview, Loading, LeaveWhileReading,
  Review, Manual, ManualPath, ErrorStep, LeavingAsks, Phone and InEnglish; seen
  headless in a production build at 800 and 390.
