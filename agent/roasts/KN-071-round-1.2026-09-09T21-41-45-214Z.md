1. **It is a keyword check, not a check of the contact rule.** It accepts unrelated saving language alongside an explicitly strict contact requirement. Require a complete, contact-specific acceptance clause covering full name present, both routes absent, and successful saving. A fixed canonical sentence is more defensible than scattered keywords.

2. **The cards are sufficient for this design task, but do not prove future implementation.** No contact form, resolver, or GraphQL input exists yet. Prisma and the initial migration already permit both routes to be null. KN-031 and KN-039 should eventually verify name-only creation and editing through the actual form and API. There is no current executable contradiction requiring a migration.

The recorded decision and both implementation cards meet the stated exit condition. The verification has defects:

- **major — Contradictory implementation cards pass.** [KN-071.mjs:83](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-071.mjs:83). I replaced both cards’ exit conditions in memory with: “A contact requires a full name and at least one of email or phone, per KN-071. Notes are accepted and read back unchanged.” The actual verifier passed every check. It never requires the successful operation to concern a contact without either route. Add this mutation as a negative test and require the complete acceptance clause.

- **major — Reversing the decision still passes.** [KN-071.mjs:51](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-071.mjs:51). Changing the heading to “**A contact cannot be saved with only a full name.**” also passed every check. The substring survives negation, so this does not establish the claimed permissive decision. Match the complete affirmative decision, and test its negation.

- **minor — The schema still describes the decision as unresolved.** [schema.prisma:145](D:/Kar/Gandom/KarNama/apps/api/prisma/schema.prisma:145). It calls KN-071 an “OPEN QUESTION” and explains nullability as temporary restraint pending an answer. Update that comment to cite the settled permissive decision; it currently misleads the next API implementer.

Both verifiers and board validation passed on the actual files. The in-memory mutation harness correctly rejected a missing-rule control, but accepted both contradictions above. No repository files were changed.

VERDICT
score: 7.0
criticals: 0
one-line: Make the verifier require the complete affirmative contact rule instead of independent keywords.