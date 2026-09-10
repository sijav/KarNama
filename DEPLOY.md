# Deploying KarNama

Three pieces, all on free tiers, all without a credit card.

| piece | where | live |
| --- | --- | --- |
| Web app | GitHub Pages | https://sijav.github.io/KarNama/ |
| Component library | GitHub Pages | https://sijav.github.io/KarNama/storybook/ |
| API | Render, free web service | not yet created |
| Database | Neon, free Postgres | not yet created |

The two Pages sites are already live and redeploy on every push to `main`, from
`.github/workflows/pages.yml`. The API and the database are the manual part,
below, because creating the accounts needs a person.

## Why Neon and not Render's own Postgres, or Supabase

This is the decision worth not re-litigating in six months.

- **Render's free Postgres expires 30 days after it is created.** After a 14 day
  grace period the database and its data are deleted. A demo that dies a month
  after it ships is not deployed, it is scheduled for deletion.
- **Supabase's free tier pauses a project after 7 days with no traffic**, and it
  needs a manual unpause. That is exactly the traffic pattern a portfolio
  project has: quiet, then someone opens it.
- **Neon's free tier scales compute to zero but keeps the project reachable**,
  and does not expire. It costs a moment of wake-up latency on the first query,
  which this product already has to handle anyway.

Render still hosts the API, because its free web service needs no card and gives
750 instance-hours a month. It sleeps after 15 minutes of inactivity and takes
about a minute to wake, which `DESIGN.md` already requires the UI to handle
honestly rather than look broken.

## 1. The database, on Neon

1. Sign in at **https://neon.tech** with GitHub.
2. **Create a project.** Name it `karnama`. Pick the region closest to your
   users — `AWS eu-central-1 (Frankfurt)` matches the Render region below.
3. Open **Connection Details** and copy the **pooled** connection string. It is
   the one whose host contains **`-pooler`**. Use the pooled one: the API opens
   a connection pool, and a serverless database behind a direct connection runs
   out of connections under exactly the load you want it to survive.

It looks like:

```
postgresql://USER:PASSWORD@ep-something-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## 2. The API, on Render

`render.yaml` is committed at the repository root, so Render builds the service
from the file rather than from form fields nobody can review later.

1. Sign in at **https://render.com** with GitHub.
2. **New → Blueprint**, and select the **`sijav/KarNama`** repository.
3. Render reads `render.yaml` and offers one service, `karnama-api`, on the
   **free** plan in **Frankfurt**.
4. It will prompt for the one variable the file deliberately does not contain:
   **`DATABASE_URL`**. Paste the Neon **pooled** string from step 1.
5. **Apply.**

`WEB_ORIGIN` is already set to `https://sijav.github.io` in `render.yaml`. It is
required with no default on purpose: a default there is a permissive CORS policy
nobody chose.

## 3. After the first deploy

Run the migrations once against the new database:

```bash
DATABASE_URL="<the Neon pooled string>" npm run db:migrate --workspace @karnama/api
```

Then point the web app at the API and redeploy Pages. The API's URL will be
`https://karnama-api.onrender.com`.

## Handing credentials over safely

If you want the deploy automated rather than clicked, two API keys are needed:

- **Render**: Dashboard → *Account Settings* → *API Keys* → create one.
- **Neon**: Console → *Account settings* → *API keys* → create one.

**Do not paste them into the chat.** A transcript persists, and both are live
credentials that can create and delete infrastructure. Put them in
`.env.deploy.local` at the repository root, which is already covered by the
`*.local` rule in `.gitignore` — verified with `git check-ignore`, not assumed:

```
RENDER_API_KEY=...
NEON_API_KEY=...
```

Then say the file is there. Revoke both keys once the deploy is set up; they are
worth more than the ten minutes of clicking they save.
