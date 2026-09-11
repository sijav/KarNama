# KN-342 · A contact with no role draws an empty role line and its divider

Beside the Contact Card. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** Role is optional in the card's type, the
role line and its divider are left out when there is neither role nor company,
and a story shows a name-only contact.

## What was done

- `ContactCardContact.role` is `string | null`, as the card's other fields
  are. The line joining role and company was already built from what is there;
  now, when nothing is, the full card leaves out the line and the divider under
  it, and the compact card leaves out its line under the name, whose flex gap
  would otherwise still add 4.
- NameOnly: the full card for a contact with only a name holds no paragraph and
  no rule and is 24, 30 and 24 tall. NameOnlyCompact: the name stands alone in
  its column beside the avatar. Both failed on the old card, and neither pins a
  language, so the Docs page keeps the toolbar's, KN-090.
