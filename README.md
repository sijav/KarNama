# KarNama — کارنما

A job application tracker. You add a posting yourself, by link or by pasting the
text; the product structures it into a record; the record carries a status
through your search. **The value is the trail, not the listing.**

Persian first, right-to-left, with English as the source language for message
ids. Live:

- **App** — https://sijav.github.io/KarNama/
- **Component library** — https://sijav.github.io/KarNama/storybook/

## Running it

```bash
npm install
npm run setup:browsers
```

**Both commands, in that order.** `npm install` does NOT fetch the browser the
test suite needs: the Storybook test project runs in real Chromium, Playwright
downloads browsers in a `postinstall`, and the allow-scripts policy blocks
postinstall scripts. Without the second command `npm test` fails with a message
about a missing executable that never says "install a browser", and it reads
like a broken suite rather than a missing step.

If you skip it, `node agent/scripts/verify/KN-003.mjs` names the browser, prints
the path Playwright expected, and tells you the command.

Then:

```bash
npm run dev --workspace @karnama/web   # the app, on 5173
npm run storybook --workspace @karnama/web   # the component library, on 6006
```

## The gate

```bash
npm run lint       # zero warnings
npm run lint:tsc   # zero errors
npm test           # every workspace, 100 percent coverage on apps and packages
npm run build      # and the GraphQL schema must match the resolvers
```

Coverage is a **product** rule: `apps/*` and `packages/*`. It does not apply to
`agent/scripts/**`, and markdown has no tests.

## The API and the database

The API is not part of the web build. It needs a Postgres connection string in
`apps/api/.env`, which is gitignored:

```
DATABASE_URL="<the Neon POOLED connection string>"
WEB_ORIGIN="https://sijav.github.io"
```

Use the **pooled** string. The API opens a connection pool, and a serverless
database behind a direct connection runs out of connections under exactly the
load you want it to survive. Migrations run from the API workspace:

```bash
npm run db:migrate --workspace @karnama/api
```

[DEPLOY.md](DEPLOY.md) has the hosting: GitHub Pages for the two front ends,
Render for the API, Neon for Postgres, and why it is Neon rather than Supabase
or Render's own Postgres.

## Where the rules live

| file | what it settles |
| --- | --- |
| [AGENTS.md](AGENTS.md) | the working agreement, the conventions, the done gate |
| [DESIGN.md](DESIGN.md) | the design contract, tokens, Figma node ids, settled decisions |
| [agent/RALPH.md](agent/RALPH.md) | the build loop |
| [agent/TODO_BOARD.md](agent/TODO_BOARD.md) | the board, rendered from `agent/board.json` |

A Persian translation of this file, the tech-debt record and the phase-next
notes are KN-053; this file covers what someone needs to run the thing.
