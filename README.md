# Grill

A notes / AI / focus web app built with Next.js, Postgres, and Drizzle.

## Local development

Prerequisites: Node.js 22+ (npm 11 recommended), a local Postgres database.

```bash
npm install
```

Create your `.env` file from the template:

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` (and keys if you use AI features or auth).

Run the database migrations, then start the dev server:

```bash
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm test        # run the test suite
npm run typecheck
npm run lint
npm run build   # production build
```

## Deploying to Railway

Railway builds this repo with the included `Dockerfile` (`railway.json` configures the Dockerfile builder and the `/` healthcheck). The Dockerfile runs `npm run db:migrate` during the build step, so migrations are applied before the app starts.

Deploy flow:

1. Create a new project on [Railway](https://railway.app).
2. Add a **Postgres** plugin to the project.
3. Add a service from this repository (deploy from GitHub or local CLI).
4. Set the environment variables below (for both build and run).
5. Deploy, then open the generated `*.up.railway.app` URL.

### Environment variables

| Variable              | Description                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL`        | Postgres connection URL (provided by the Railway Postgres plugin).                         |
| `ENCRYPTION_KEY`      | 64 hex chars. Generate with: `openssl rand -hex 32`                                        |
| `BETTER_AUTH_SECRET`  | Long random string. Generate with: `openssl rand -base64 32`                               |
| `NEXT_PUBLIC_APP_URL` | The public URL of your app, e.g. `https://grill-production.up.railway.app`                 |

> **Note:** because `npm run db:migrate` runs inside the Dockerfile, `DATABASE_URL` and `NEXT_PUBLIC_*` variables must be available **at build time** on Railway. In the Railway dashboard, set variables under **Variables** for both build and run so the migration step can reach the database and Next.js can inline public values during the build.
