# CommitMuseum

Sign in with GitHub and see your own commit history as a dashboard —
contribution heatmap, per-repo and per-language breakdowns, when-you-commit
patterns, trends over time — plus a "Hall of Fame" of the funniest commit
messages you've actually shipped, detected from your real history.

**Nothing is persisted.** There's no database. Every dashboard load fetches
fresh from the GitHub API and forgets it as soon as you leave; your session
is a JWT cookie holding your GitHub access token, nothing more.

## How it works

- **Auth**: [Auth.js](https://authjs.dev) with the GitHub provider, JWT
  sessions (no database adapter). By default it requests no scope beyond
  `read:user` — it never asks for `repo` access unless you explicitly opt
  into scanning private repos (see `INCLUDE_PRIVATE_REPOS` below).
- **Data**: one GraphQL call fetches your contribution calendar and repo
  list; a handful of REST calls (capped and concurrency-limited) pull recent
  commits from your most-recently-pushed repos.
- **Charts**: a hand-rolled contribution heatmap + day/hour heatmap, and
  Recharts bar/area charts for the rest of the dashboard.
- **Funny commit detection**: a weighted set of regex/keyword rules
  (frustration words, repeated words, placeholder messages like `wip`/`fix`,
  profanity, revert chains, ALL CAPS, emoji spam, "final version" jokes...)
  scores every fetched commit message; anything above a threshold shows up
  in the Hall of Fame.
- **Repo filtering**: happens entirely client-side against the data already
  fetched for the page load — toggling filters never hits the GitHub API
  again.

## Local development

1. Create a GitHub OAuth App: **GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App**.
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Copy `.env.example` to `.env.local` and fill in `GITHUB_CLIENT_ID`,
   `GITHUB_CLIENT_SECRET`, and a generated `AUTH_SECRET`
   (`openssl rand -base64 32`). Leave `NEXTAUTH_URL` as
   `http://localhost:3000`.
3. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open <http://localhost:3000> and sign in.

## Deploying to your own VPS (Docker + Nginx + Let's Encrypt)

This repo ships a `docker-compose.yml` with three services: `app` (the
Next.js server, not exposed publicly), `nginx` (reverse proxy + TLS
termination, the only thing exposed on 80/443), and `certbot` (invoked
on-demand to issue/renew certificates).

1. **Point DNS** at your VPS: an A/AAAA record for your domain (e.g.
   `commitmuseum.yourdomain.com`) pointing at the server's IP.
2. **Create the GitHub OAuth App** for your real domain this time:
   - Homepage URL: `https://<your-domain>`
   - Authorization callback URL: `https://<your-domain>/api/auth/callback/github`
3. **Clone the repo onto the VPS** and create `.env` from `.env.example`,
   filling in `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, a generated
   `AUTH_SECRET`, and `NEXTAUTH_URL=https://<your-domain>`.
4. **Bring up the app once** so the ACME HTTP challenge has something to
   answer, then run the one-time cert bootstrap script:

   ```bash
   docker compose up -d app nginx
   ./docker/certbot/init-letsencrypt.sh <your-domain> <your-email>
   ```

   This obtains the first certificate and swaps `nginx`'s config from the
   checked-in HTTP-only bootstrap version to the full HTTPS config (see
   comments in `docker/nginx/conf.d/commitmuseum.conf` and
   `docker/nginx/templates/commitmuseum.tls.conf.template`).
5. **Set up renewal** (Let's Encrypt certs expire every 90 days). A simple
   host crontab entry:

   ```cron
   0 3 * * * cd /path/to/commitmuseum && docker compose run --rm certbot renew --quiet && docker compose exec nginx nginx -s reload
   ```

6. From then on, `docker compose up -d` (or `docker compose up -d --build`
   after pulling new code) is all you need.

### Environment variables

See `.env.example` for the full list. Notable ones:

- `INCLUDE_PRIVATE_REPOS` (default `false`): scanning private repos
  requires the GitHub OAuth App to request the `repo` scope — broad
  read/write access to private repo *code*, not just commit metadata.
  Only turn this on if you understand and accept that trade-off; users will
  need to re-consent on their next sign-in.
- `MAX_REPOS_TO_SCAN` / `MAX_COMMITS_PER_REPO` / `GITHUB_API_CONCURRENCY`:
  keep the per-visit GitHub API usage bounded, since nothing is cached to
  disk — every dashboard load is a fresh fetch.

## Verifying a build locally

```bash
npm run build
npm run start          # note: `next start` warns with output:"standalone" —
                        # for a true standalone smoke test, run the copied
                        # server instead:
node .next/standalone/server.js
```

For the standalone server you'll also need to copy `public/` and
`.next/static/` into `.next/standalone/` first (the Dockerfile does this
automatically during the image build).
