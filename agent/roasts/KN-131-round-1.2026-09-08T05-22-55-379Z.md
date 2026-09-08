1. **Exit condition: yes for both clauses in the current implementation.**
   - **Reduce and regenerate:** I removed `environment` and regenerated using the actual codegen configuration entirely in memory. The installed compiler reported **TS2339 at `apps/web/src/core/api/health.ts:47`**, naming `environment`. The [web build](/D:/Kar/Gandom/KarNama/apps/web/package.json:8) runs that compiler before Vite.
   - **Each workspace checks its sources:** web and GraphQL run `tsc --noEmit`; API runs `tsc -p tsconfig.build.json`. All three compiler commands passed independently with emission disabled. The verifier’s proof of workspace independence is weaker than this implementation, as detailed below.

   I did not execute the writing verifier or root build, so this is not an independently repeated end-to-end build proof.

2. **I found no current production implementation omitted from typechecking.** Web includes every existing `.ts`/`.tsx` source, including its TypeScript locale catalogs. GraphQL includes its source tree. API excludes nine test files, which its production build does not emit. Exclusion also does not prevent TypeScript from following an imported file. There is no existing web `public` directory or application JavaScript source bypass to name.

3. **Appending to these files is a valid type-error plant.** They are compiler inputs, and TypeScript checks the assignment regardless of runtime reachability or subsequent tree-shaking. However, the GraphQL plant can be caught by **web’s** compiler, so its failure does not prove GraphQL’s own build typechecks. Also, looking for the variable name depends on diagnostic formatting.

4. **There are cheaper arrangements.** The verifier actually runs the root build **five times**, not six. Run the three ordinary plants against their respective workspace builds, retaining the root build for the reduce-and-regenerate case and final clean case. This also fixes the attribution problem below. Web currently checks tests, stories, and tooling during deployment; a production-specific config could reduce that scope while the full `lint:tsc` remains separate. Keep production typechecking mandatory.

Findings:

- **Major: the GraphQL plant can pass despite disabling GraphQL’s own typecheck.** At [KN-131.mjs:85](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-131.mjs:85), every plant runs the root build and accepts the symbol anywhere in its output. Change GraphQL’s build to `npm run codegen:check && tsc --noEmit --noCheck`: the command predicate at line 54 accepts it, and web still catches the error in GraphQL’s `src/index.ts`. I confirmed that cross-workspace diagnostic using an in-memory plant. The verifier therefore misses a regression against the “each workspace checks its own sources” clause. Run each plant against its own workspace build.

- **Major: cleanup overwrites the starting generated file instead of restoring it.** At [KN-131.mjs:124](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-131.mjs:124), `finally` restores the operation and regenerates `generated.ts`. Start with an edited or stale generated file, and that original content is lost. The snapshot comparison detects the damage afterward but does not undo it. A failed cleanup regeneration can instead leave the reduced output behind. Restore `GENERATED` directly from its saved snapshot in `finally`.

- **Minor: `NO_COLOR=1` makes valid compiler rejection fail verification.** At [KN-131.mjs:89](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-131.mjs:89), success requires `kn131TypeError` in compiler output. The installed TypeScript checks `NO_COLOR` before `FORCE_COLOR`; plain diagnostics contain the file, location, TS2322, and incompatible types, but omit the variable name. The verifier inherits `NO_COLOR`. Match the planted file/location and diagnostic code instead of relying on the source excerpt.

Board validation also passed.

VERDICT
score: 8.0
criticals: 0
one-line: Make each workspace plant prove that workspace’s own build rejects the error.