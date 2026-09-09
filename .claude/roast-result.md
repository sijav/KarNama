# Roast: plan

- when: 2026-09-09T21:20:40+00:00
- reviewer: codex gpt-5.6-terra, effort medium
- session: 01a08809-e3e1-71c1-91f0-9fc952fd3731 (new)
- subject: (unstated)

- earlier attempts: codex/gpt-5.6 failed: OpenAI Codex v0.153.4
--------
workdir: D:\Kar\Gandom\KarNama
model: gpt-5.6
provider: openai
approval: never
sandbox: read-only
reasoning effort: high
reasoning summaries: none
session id: 01a08809-d7ce-72b1-931b-dd7dfd084f1c
--------
user
You are checking a PLAN for work about to be done in the Ka

---

No. KN-071’s decision is already correctly recorded in `DESIGN.md`: full name required, email and phone both optional. But its exit condition still cannot be met, because neither KN-031 nor KN-039 actually states that rule. Updating only the design document would look complete while leaving downstream form and API work free to add a one-of-two constraint.

The simplest correct plan is:

1. Do not seek another owner decision.
2. Amend KN-031 and KN-039 to explicitly require “name required; email and phone optional; no one-of-two validation.”
3. Add a small KN-071 verifier for those three documentation/card assertions, then close through the normal roast gate.

“Set the validation accordingly” does not belong in this design-only task. It should be implemented and tested by the form/API tasks that own it.

The most likely mistake is treating an optional field in the UI as the complete rule. Current MUI 9.4 `TextField required` correctly makes its underlying input required, so it is suitable for the name field, but it says nothing about server-side validation or an accidental email-or-phone rule. The API task must enforce the same permissive invariant. [MUI TextField API](https://mui.com/material-ui/api/text-field/)

There is also a present gate problem: KN-071 has no verify command, so the board tool will refuse to mark it done. Separately, KN-002’s verifier currently fails because its manifest still lists several settled items, including `contact-route`, as open. That should be repaired before relying on KN-002 as a clean prerequisite.

No obsolete library assumption was found. The HTML/MUI behavior the plan would rely on remains current: `required` only requires the individual input carrying it. [HTML required attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/required)
