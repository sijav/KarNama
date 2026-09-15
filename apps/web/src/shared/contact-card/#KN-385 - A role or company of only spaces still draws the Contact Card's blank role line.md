# KN-385 - A role or company of only spaces still draws the Contact Card's blank role line and divider, and the contact prop's docs say role cannot be missing

## The card

A child of KN-026, found by the KN-342 roast.

**Why.** A contact saved with a stray space is still a name-only contact, and the owner allowed
those, KN-071; a doc that contradicts the type misleads whoever builds the network screen on it.

**Exit.** The card trims each part before joining, and the Contact Modal trims role and company when
it saves, so a role of ' ' draws no line and no divider, which a story shows; and both languages'
docs for the contact prop say role and company may be missing.

## Read before planning, 2026-09-15

- **The card.** `ContactCard.tsx:254` joins the role and the company it keeps, those neither `null`
  nor `''`, so a role of `' '` passes, the line is not empty, and the full card draws the role line
  and the divider under it around nothing.
- **What saves a contact.** The Contact Modal hands its callers the name trimmed and the role and
  company as typed, `ContactModal.tsx:130`; both callers, the board screen and the network page,
  trim both and store an empty one as `null` before they keep it. So the card's "stored as it is"
  does not happen through those two today, and the card's own trim is what covers every road in,
  records kept before, another tab, a fixture.
- **The docs.** Both languages say every part but the name and the role may be missing, where
  `role` is `string | null`.

## The approach

1. **The stories first.** `ContactCard.stories.tsx` gains `BlankRoleAndCompany`, a contact whose
   role and company are only spaces, read as the `NameOnly` story reads a name-only contact: no
   role line and no divider. `ContactModal.stories.tsx`'s `SavesWithOnlyAName` also types spaces
   into the role and the company, and still expects both saved as `''`. Run against today's code;
   both must fail.
2. **The card** trims each part before it keeps it, `part?.trim() ?? ''`, and joins those left.
3. **The Contact Modal** saves the role and the company trimmed, as it saves the name.
4. **The words.** Both Contact Card docs' `contact` entry says every part but the name may be
   missing, the role and the company too; both describe the new story.

## What I will change

- `shared/contact-card/ContactCard.tsx`, `shared/contact-card/ContactCard.stories.tsx`
- `shared/modal/ContactModal.tsx`, `shared/modal/ContactModal.stories.tsx`
- `story-docs/en/Shared-ContactCard.md`, `story-docs/fa/Shared-ContactCard.md`

## What I expect to be hard, and what I am unsure of

- **Trimming inside the card changes what it shows**, not only whether the line draws: a role saved
  with a space around it now shows without it. That is the card being honest about the same text.
- **The compact card** draws the role on the same condition; `NameOnlyCompact` covers the name-only
  case there, and the new story reads the full card as the exit asks.

## How I will know it works

- `BlankRoleAndCompany` and the amended `SavesWithOnlyAName` fail against today's code and pass
  after.
- The Contact Card and Contact Modal stories, the unit project with the docs guard, lint and tsc are
  clean; the card is seen in fa-IR and en-US, light and dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved as the smallest sound change. It found the card the right boundary for records kept before
the screens trimmed, the modal's trim worth making so its save matches its callers, the search and
the delete confirmation untouched, since they read stored fields and the name, and the full card's
story enough, since the compact card draws from the same joined line. Its one warning, to build the
line from the trimmed parts rather than filter the parts as they came, is how step 2 is written.
The docs change is the `contact` entry, and each new story's own entry the docs guard asks for.

## Built, 2026-09-15

- **Stories first.** Against today's code `BlankRoleAndCompany` found the blank role line, a `p`,
  and `SavesWithOnlyAName` saw the spaces handed on untrimmed; both pass now.
- **The card** builds its line from the trimmed parts and keeps those that are not empty; with a
  third call in the chain Prettier writes one call a line, so the line is written that way.
- **The modal** saves the role and the company trimmed, as it saves the name, and the screens still
  turn an empty one into `null` before they keep it.
