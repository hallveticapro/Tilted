# AGENTS.md

## Project

Tilted is a mobile-first classroom and party guessing game built as a static browser app. A player holds a phone in landscape orientation while teammates give clues; outcomes are recorded by tilt gestures or fallback touch/keyboard controls.

Repository evidence wins over prior agent memory. Keep docs concise and current; do not recreate historical audit files unless explicitly asked.

## Stack

- React 19 with TypeScript.
- Vite 8 for dev, build, and Vitest configuration.
- Vitest 4, Testing Library, jsdom, and Playwright for tests.
- Client-only architecture with no server/API routes, auth, cookies, database, or backend session store.
- LocalStorage-backed custom decks, preferences, favorites, and round history through `src/services/*`.
- Static PWA assets live in `public/`, including `public/sw.js` and `public/site.webmanifest`.
- Docker runtime uses pinned `nginxinc/nginx-unprivileged` with the repo Nginx config.

## Repository Map

- `src/App.tsx`: screen flow, round startup, history persistence, and team-session transitions.
- `src/components/`: screen-level UI for deck selection, setup, game, history, teams, PWA status, and deck editing.
- `src/components/deck-editor/`: extracted Deck Workshop sections and `useDeckWorkshop`.
- `src/hooks/`: timer, motion controls, landscape detection, PWA status, wake/fullscreen helpers.
- `src/services/`: LocalStorage wrappers, deck validation/import/export, sharing, audio, preferences, team sessions, history export, and app-flow helpers.
- `src/data/`: built-in deck seeds and generated built-in decks.
- `public/`: static assets, manifest, service worker, and static-host headers.
- `deploy/`: Nginx config and Docker runtime metadata injection.
- `.github/`: CI, container publishing, and Dependabot configuration.
- `scripts/`: static bundle, production, service-worker, and container verification.
- `tests/e2e/`: Playwright smoke coverage.

## Common Commands

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run verify:static
npm run test:e2e
npm audit --omit=dev --audit-level=moderate
npm audit
docker compose config
npm run verify:container
```

Production drift check:

```bash
npm run audit:production
```

`audit:production` checks public headers, `/healthz`, metadata, and `/sw.js` cache behavior. It may fail when CDN/reverse-proxy settings still need manual updates outside the repository.

Useful inspection:

```bash
rg --files
rg -n "replit|\.replit|replit\.nix|starter|template|scaffold" . --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**'
gh workflow list
gh run list --limit 5
```

## Environment

- No required local `.env` is expected.
- `VITE_PUBLIC_URL`: build-time social metadata URL.
- `VITE_SHARE_IMAGE_URL`: build-time Open Graph/Twitter image URL.
- `TILTED_PUBLIC_URL`: Docker runtime replacement for the default public URL.
- `TILTED_SHARE_IMAGE_URL`: Docker runtime replacement for the default share image URL.

Do not commit secrets. The app should work without private environment values. Default social metadata points at `https://tilted.mrhallsclass.com`; forks and self-hosted deployments should override the metadata values.

## Development

- Prefer small, focused changes that match existing React component and service boundaries.
- Keep core game behavior in typed helpers or hooks where practical, then cover it with Vitest.
- Use `src/services/safeStorage.ts` for browser storage access instead of direct LocalStorage calls.
- Keep custom-deck imports bounded and validated; do not trust pasted JSON, CSV, or shared URL fragments.
- Preserve client-only privacy unless a future product decision explicitly adds a backend.
- Keep saved round history anonymous by default; active team sessions may display names, but persisted history should not keep team/player identifiers.
- Avoid broad refactors during docs-only or audit-only tasks.

## Testing

- For gameplay changes, run `npm run typecheck`, `npm test -- --run`, `npm run build`, and `npm run verify:static`.
- For UI flow changes, also run `npm run lint` and `npm run test:e2e`.
- For deployment changes, also run `docker compose config` and `npm run verify:container`.
- Manual device checks remain important for iOS Safari and Android Chrome motion permissions, orientation lock behavior, installed PWA behavior, and projector readability.

## Security And Privacy

- React rendering avoids raw HTML; keep it that way unless there is a reviewed sanitizer.
- Custom decks, preferences, favorites, and round history are local to the browser origin.
- Shared deck links encode the whole deck in the URL fragment. They are not sent to the server during normal HTTP requests, but copied links can expose custom prompt content to recipients.
- Nginx, Vercel, and Netlify-style headers include CSP, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options`, and `X-Frame-Options`.
- Production proxy/CDN rules should keep `index.html` and `sw.js` uncached or promptly revalidated.

## Deployment

- `Dockerfile` builds static output with Node 22 and serves it from pinned unprivileged Nginx.
- `docker-compose.yml` uses a read-only root filesystem, `tmpfs` for `/tmp`, dropped capabilities, `no-new-privileges`, and restart policy `unless-stopped`.
- `deploy/40-runtime-metadata.sh` copies immutable build output into `/tmp/tilted-html` and replaces default social metadata at container startup.
- `scripts/stamp-service-worker.mjs` stamps `dist/sw.js` with a hash of the built app shell during `npm run build`.
- `.github/workflows/ci.yml` verifies pull requests and pushes to `main`.
- `.github/workflows/publish-container.yml` repeats app verification before publishing multi-arch GHCR images.

## Known Follow-Ups

- Production `/sw.js` has previously been observed with `Cache-Control: max-age=14400`; verify after deployment or CDN changes with `npm run audit:production`.
- Production HSTS includes `includeSubDomains; preload`; confirm that remains intentional for the whole domain.
- Real-device motion/PWA behavior and projector readability still need classroom-device testing.

## Future Agent Notes

- Use `rg` for file and text search.
- Do not expose secrets or `.env` values.
- Do not make app-code changes during audit-only tasks.
- If touching gameplay, verify touch/keyboard fallback and motion-control assumptions.
- If touching deployment, verify static headers, Docker hardening, production metadata, and `/healthz`.
- Record substantive validation or user-visible changes in `UPDATES.md` as one concise dated line.
