# KN-489 - The Pages build ships an empty API address and reports success when KARNAMA_API_URL is missing

## The card

**Why.** A broken deploy that says it succeeded is found by a reader, not by the build.

**Exit.** The build step fails when `VITE_API_URL` is empty: the step begins with a check, and
running that step with the variable empty exits non-zero.

## Measured before planning, 2026-09-15

- **The step.** `Build the web app` in `.github/workflows/pages.yml` runs
  `npm run build --workspace @karnama/web` with `VITE_API_URL` set from `vars.KARNAMA_API_URL`, and
  nothing checks the value; a repository variable that is missing expands to an empty string.
- **What an empty address builds.** `client.ts` takes a value that is not a string as empty,
  rejects every call with `API_NOT_CONFIGURED`, and skips the health request that wakes the API, so
  the site deploys and every call it makes fails.
- **Today.** The repository variable `KARNAMA_API_URL` is set, read with `gh variable list`, so a
  check at the start of the step passes every deploy that has it. No other workflow reads it.
- **What proves it here.** The workspace has `yaml` 2.9.0 and Git Bash has bash 5.2, so the step's
  own `run` can be read out of the workflow and run with the variable unset, empty or set.

## The approach

1. **The step as it is, measured first.** Its `run`, read out of the workflow, runs in bash with
   `npm` stood in by a function that only says it ran: with `VITE_API_URL` empty it should exit 0,
   which is the card.
2. **The step begins with a check**: `set -euo pipefail`, then, when `VITE_API_URL` holds nothing
   but white space, an `::error` annotation naming the repository variable and what an empty one
   builds, and exit 1; then the build as before. White space counts as empty, since `client.ts`
   would take a few spaces for an address and call it. A comment above the step says why.
3. **The new step, run the same way**: with the variable unset, empty and only white space it must
   exit non-zero with the annotation and never reach `npm`; with an address it must reach the
   stand-in and exit 0.
4. **The workflow still parses**, read back with `yaml`.

## What I will change

- `.github/workflows/pages.yml`

## What I expect to be hard, and what I am unsure of

- **The runner is Ubuntu's bash**, and this proof runs the step in Git Bash 5.2. The check is `[`,
  `printf`, `tr` and a parameter expansion, which run alike in both.
- **The push deploys.** Every push to main runs this workflow. The variable is set, so the deploy
  goes ahead; the run's result is read after the push rather than waited on.
- **Checking more than emptiness**, the address's shape for example, is not asked for and is left
  out.

## How I will know it works

- The step as it was exits 0 with the variable empty; the new step exits non-zero, with the
  annotation, for unset, empty and white space, and reaches the build with an address.
- The workflow parses with `yaml`, and neither the workflow's nor this plan's Prettier drift grows.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, with one requirement, which the check meets: it reads `${VITE_API_URL:-}`, safe under
`set -u`, so the unset case prints its annotation rather than the shell aborting first. A missing
repository variable expands to an empty string in `vars`, so the deploy can ship the broken client
today; a guard at the start of the step with an `::error` annotation and an explicit non-zero exit
is the simplest way to fail it, where a job-level `if` would skip the work instead of reporting the
deploy failed. Running the step's `run` in bash with `npm` stood in is an honest proof of that
branch, though no substitute for the next real run. A markdown file in `.github/workflows` is inert,
since GitHub reads only workflow YAML there. The annotation names the repository variable,
`KARNAMA_API_URL`, while the check reads `VITE_API_URL`, which is the step's own.

## Built, 2026-09-15

- **The step as it was**, its `run` read out of the workflow with `yaml` and run in Git Bash with
  `npm` stood in, exited 0 with `VITE_API_URL` unset, empty, only white space and set alike: the
  card, measured.
- **The check.** `Build the web app` now begins with `set -euo pipefail` and, when
  `${VITE_API_URL:-}` holds nothing but white space, an `::error` annotation, titled that
  `KARNAMA_API_URL` is empty and saying what the app does without it, and `exit 1`, before the
  build. A comment above the step says why.
- **The new step, run the same way**: unset, empty and white space each exit 1 with the annotation
  and never reach `npm`; with an address it reaches the stand-in `npm` and exits 0.
- **Checks.** The workflow still parses with `yaml`, the proof itself reading the step out of it,
  and Prettier drift is 0 in the workflow and in this plan. No web source changed, so tsc, lint and
  the unit project, which read none of this, were not run.
- **The real run.** The push that closes this runs the workflow with the variable set; its result is
  read after, not waited on.
