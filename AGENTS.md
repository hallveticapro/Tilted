# AGENTS.md

## Project Overview

Tilted is a mobile-first classroom and party guessing game built as a static browser app. A player holds a phone in landscape orientation while teammates give clues; outcomes are recorded by tilt gestures or fallback touch/keyboard controls.

Repository evidence wins over prior agent memory. `TASKS.md` is the current audit brief when present.

## Tech Stack

- React 19 with TypeScript.
- Vite 8 for dev, build, and Vitest configuration.
- Vitest 4 plus Testing Library and jsdom for unit/component tests.
- Client-only architecture with no server/API routes, auth, cookies, database, or backend session store.
- LocalStorage-backed custom decks, preferences, favorites, and round history through `src/services/*`.
- Static PWA assets in `public/`, including `public/sw.js` and `public/site.webmanifest`.
- Docker runtime uses pinned `nginxinc/nginx-unprivileged` behind the provided Nginx config.

## Repository Map

- `src/App.tsx` controls screen flow, round startup, history persistence, and team-session transitions.
- `src/components/` contains screen-level UI such as deck selection, setup, game, history, team flow, PWA banner, and deck editor.
- `src/hooks/` contains timer, motion controls, landscape detection, PWA status, and wake/fullscreen helpers.
- `src/services/` contains LocalStorage wrappers, deck validation/import/export, sharing, audio, preferences, team sessions, and history export.
- `src/data/` contains built-in deck seeds and generated built-in decks.
- `public/` contains static assets, manifest, service worker, and static-host headers.
- `deploy/` contains Nginx config and Docker runtime metadata injection.
- `.github/` contains CI, container publishing, and Dependabot configuration.
- `scripts/` contains static bundle and hardened container verification.
- `references/` stores historical audit/reference markdown.

Keep `README.md`, `AGENTS.md`, `TASKS.md`, and `UPDATES.md` at the repository root.

## Common Commands

Verified on 2026-06-04:

```bash
npm ci
npm run lint
npm run typecheck
npm test -- --run
npm run build
npm run verify:static
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev --audit-level=moderate
npm audit
npm outdated
docker compose config
docker build -t tilted-audit-verify .
docker compose build
npm run verify:container
```

Live deployment drift check:

```bash
npm run audit:production
```

This checks public headers, `/healthz`, metadata, and `/sw.js` cache behavior. It may fail
when CDN/reverse-proxy settings still need manual updates outside the repository.

Useful inspection commands:

```bash
rg --files
rg -n "replit|\.replit|replit\.nix|starter|template|scaffold" . --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**'
gh workflow list
gh run list --limit 5
```

## Environment Variables

No required local `.env` file was found during the 2026-06-04 audit.

- `VITE_PUBLIC_URL`: build-time social metadata URL.
- `VITE_SHARE_IMAGE_URL`: build-time Open Graph/Twitter image URL.
- `TILTED_PUBLIC_URL`: Docker runtime replacement for the default public URL.
- `TILTED_SHARE_IMAGE_URL`: Docker runtime replacement for the default share image URL.

Do not commit secrets. The app should continue to work without private environment values.
Default social metadata points at `https://tilted.mrhallsclass.com`; forks and private
self-hosted deployments should override the `VITE_*` or `TILTED_*` metadata values.

## Development Conventions

- Prefer small, focused changes that match existing React component and service boundaries.
- Keep core game behavior in typed helpers or hooks where practical, then cover it with Vitest.
- Use `src/services/safeStorage.ts` for browser storage access instead of direct LocalStorage calls.
- Keep custom-deck imports bounded and validated; do not trust pasted JSON, CSV, or shared URL fragments.
- Preserve client-only privacy unless a future product decision explicitly adds a backend.
- Keep saved round history anonymous by default; active team sessions may display names, but
  persisted history should not keep team/player identifiers.
- Avoid broad refactors during audit/doc passes.

## Testing and Validation

The current suite covers motion controls, timer drift, deck storage/import/export, PWA banner ordering, team session rotation, deck selection, editor validation, and game input locking.

For gameplay changes, run:

```bash
npm run typecheck
npm test -- --run
npm run build
npm run verify:static
```

For deployment changes, also run:

```bash
docker compose config
npm run verify:container
```

Manual device verification is still important for iOS Safari and Android Chrome motion permissions, orientation lock behavior, installed PWA behavior, and real projector readability.

## Security and Privacy Notes

- React rendering avoids raw HTML; no `dangerouslySetInnerHTML` was found in source during the 2026-06-04 audit.
- Custom decks, preferences, favorites, and round history are local to the browser origin.
- Saved round history strips team/player identifiers before writing to LocalStorage.
- Shared deck links encode the whole deck in the URL fragment. They are not sent to the server as part of normal HTTP requests, but copied links can expose custom prompt content to recipients.
- Nginx, Vercel, and Netlify-style headers include CSP, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options`, and `X-Frame-Options`.
- Production proxy/CDN rules should keep `index.html` and `sw.js` uncached or revalidated promptly. Use `npm run audit:production` to check the live URL after deployment.

## Accessibility and Classroom UX Notes

- Motion controls are optional; touch and keyboard controls are present.
- Landscape gating explains phone rotation lock.
- Category scrollers expose selected state with `aria-pressed`.
- The About modal traps/restores focus and locks background scroll.
- Reduced-motion CSS is present.
- The largest remaining classroom usability risks are real-device motion behavior and projector readability on actual classroom hardware.

## Deployment Notes

- `Dockerfile` builds static output with Node 22 and serves it from pinned unprivileged Nginx.
- `docker-compose.yml` uses read-only root filesystem, `tmpfs` for `/tmp`, dropped capabilities, `no-new-privileges`, and restart policy `unless-stopped`.
- `deploy/40-runtime-metadata.sh` copies immutable build output into `/tmp/tilted-html` and replaces default social metadata at container startup.
- `scripts/stamp-service-worker.mjs` stamps `dist/sw.js` with a hash of the built app shell during `npm run build`.
- `.github/workflows/ci.yml` verifies pull requests and pushes to `main`.
- `.github/workflows/publish-container.yml` repeats app verification before publishing multi-arch GHCR images.
- The 2026-06-04 production check confirmed `https://tilted.mrhallsclass.com/healthz` returns `ok` and root responses include security headers.

## Functionality Planning Notes

Prefer features that reduce teacher workload, avoid student-data collection, improve classroom reliability, or make local play smoother. Good candidates from the 2026-06-04 audit:

- QR or shorter deck-sharing flow with clear content visibility warnings.
- Browser-level smoke tests for the main quick-round and deck-editor paths.
- Teacher session presets or reusable review collections.
- Deployment health/status documentation for production cache and metadata settings.

## Known Risks and Follow-Up Items

- Production `sw.js` was observed with `Cache-Control: max-age=14400` on 2026-06-04, despite the repo Nginx config intending no-cache behavior.
- Production social metadata defaults have been fixed in the repo; redeploy and verify with `npm run audit:production`.
- Production HSTS includes `includeSubDomains; preload`; confirm that is intentional for the whole domain.
- Shared deck URLs contain the full deck content in the copied URL fragment.
- Real-device motion/PWA behavior and projector readability still need manual classroom-device testing.

## Instructions for Future Agents

- Read `TASKS.md`, `README.md`, `UPDATES.md`, this file, and recent files in `references/` before major work.
- Use `rg` for file and text search.
- Do not expose secrets or `.env` values.
- Do not make app-code changes during audit-only tasks.
- If touching gameplay, verify both touch/keyboard fallback and motion-control assumptions.
- If touching deployment, verify static headers, Docker hardening, production metadata, and `/healthz`.
- Record substantive audit or validation work in `UPDATES.md`.
