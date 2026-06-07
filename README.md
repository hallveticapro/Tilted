# Tilted

![Tilted cover](./public/assets/tilted-cover.png)

Tilted is a mobile-first, classroom-friendly team guessing game for browsers. One player
holds a phone against their forehead in landscape mode while teammates describe the visible
word without saying the word or any part of it. The phone holder guesses, then tilts the
phone down for Correct or up to Pass.

Tilted includes classroom review decks, party-friendly categories, quick rounds, local team
games, persistent round history, custom deck editing and sharing, motion diagnostics, touch
and keyboard fallbacks, installable offline support, and a small static Docker image for
self-hosting.

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Requirements](#requirements)
- [Install and Run Locally](#install-and-run-locally)
- [Controls](#controls)
- [Motion Controls](#motion-controls)
- [Team Games and History](#team-games-and-history)
- [Deck Discovery and Round Filters](#deck-discovery-and-round-filters)
- [Custom Decks](#custom-decks)
- [Run the Checks](#run-the-checks)
- [Static Hosting](#static-hosting)
- [Docker Compose](#docker-compose)
- [Use a Published GHCR Image](#use-a-published-ghcr-image)
- [Reverse Proxy and HTTPS](#reverse-proxy-and-https)
- [Run on Unraid](#run-on-unraid)
- [Social Preview Metadata](#social-preview-metadata)
- [Install and Offline Support](#install-and-offline-support)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)
- [Project Structure](#project-structure)
- [Unofficial Content Notice](#unofficial-content-notice)

## How It Works

1. Pick a built-in or custom deck.
2. Choose a round length and optional motion settings.
3. Hold the phone sideways with the screen facing the clue-givers.
4. Place the phone against your forehead when prompted.
5. Let teammates describe the word without saying it.
6. Tilt down for Correct or up to Pass, then return the phone to neutral.
7. Review the score and card history after the round.

Motion controls are optional. Touch buttons and keyboard shortcuts are always available.

## Features

- More than 70 built-in decks organized into browsable categories.
- At least 50 shuffled cards in every built-in deck.
- Fresh Fisher-Yates shuffle at the start of every round.
- Local team games with optional player rosters, automatic turn rotation, and cumulative
  scoreboards.
- Privacy-first recent-round history, deck best scores, and anonymous CSV exports.
- Optional motion controls with forehead calibration and neutral-position rearming.
- Motion sensitivity presets and an in-app diagnostic screen.
- Portrait-orientation reminder before a round starts.
- Progressive-enhancement wake lock, fullscreen, and best-effort landscape locking.
- Touch controls and keyboard shortcuts as reliable fallbacks.
- Correct and Pass screen flashes, audio cues, and optional haptic feedback.
- Persistent sound, vibration, and reverse-direction preferences.
- Deck search, favorites, recently played labels, random selection, classroom-safe filtering,
  mixed-category play, and optional per-round card filters.
- A button-controlled teacher review style that skips forehead calibration.
- Local custom deck creation, editing, copy, pasted-line and CSV import, whole-library backup,
  JSON import/export, URL sharing, bulk edits, and card reordering.
- Recovery download when malformed custom-deck storage is detected.
- Installable web manifest, offline app-shell caching, offline status, and update prompts.
- Static hosting support and a hardened unprivileged Nginx container.

## Requirements

For local development:

- Node.js 22
- npm

For container deployment:

- Docker with Compose support

For phone motion controls:

- A browser with `DeviceOrientationEvent` support
- HTTPS outside of local development

## Install and Run Locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/<github-owner>/tilted.git
cd tilted
npm install
npm run dev
```

Open the URL printed by Vite. The development server binds to localhost by default. Keep it
that way unless you intentionally want other devices on your network to access it.

To preview the production build:

```bash
npm run build
npm run preview
```

For local verification:

```bash
npm run lint
npm run typecheck
npm test -- --run
```

Browser smoke tests use Playwright. Install the Chromium browser once on a new machine, then
run the suite:

```bash
npx playwright install chromium
npm run test:e2e
```

## Controls

### Motion

- Tilt down: Correct
- Tilt up: Pass
- Return to neutral between cards

The directions can be reversed in round setup.

### Touch

Button-only rounds show the large Pass, Pause, and Correct buttons. During motion rounds,
tap the top-right menu button to reveal the optional controls.

### Keyboard

| Key | Action |
| --- | --- |
| `Right Arrow` | Correct |
| `Left Arrow` | Pass |
| `Space` | Pause or resume |

## Motion Controls

Tilted requests motion permission only after the player taps **Start Round**. This keeps the
request inside the user gesture required by iOS Safari.

After permission is granted, move the phone to your forehead. Tilted detects the larger
movement, shows **Ready?**, and silently calibrates during the three-second countdown. A
deliberate tilt is required, and the phone must return to its neutral position before another
card can be recorded.

If permission is denied, unavailable, or errors, Tilted offers a **Continue with buttons**
action. Motion controls never need to block a round.

Browsers do not expose the phone's rotation-lock setting directly. Tilted can detect that the
viewport is still portrait and remind the player to disable Portrait Orientation Lock on
iPhone or enable Auto-rotate on Android.

## Team Games and History

Choose **Team Game** from the home screen to create two or more teams. Each team can use its
name as the phone holder, or provide a comma-separated optional roster so Tilted rotates
players within that team across turns. Choose a total number of rounds or an optional target
score, then pass the same phone between teams.

Recent completed rounds stay in LocalStorage on that browser origin. **Round History** shows a
compact local record and can export an anonymous CSV summary. Tilted strips team and player
identifiers before saving history, so names entered for the active team game are visible during
that session but are not preserved in the browser's saved history.

## Deck Discovery and Round Filters

Use deck search, favorites, recently played labels, **Surprise Me**, or **Play Mixed Category**
to move quickly through the built-in library. The **Classroom-safe decks only** toggle hides
built-in decks marked as not classroom-safe from deck cards, Surprise Me, and mixed-category
play while keeping local custom decks visible. Deck cards can show compact subject, age-range,
and classroom-safe metadata labels, and deck search includes subject, age range, and tags.

Round setup can filter cards by difficulty and subcategory, cycle back through a reshuffled
deck when a fast team reaches the end, or stop after an optional pass limit. **Teacher review**
uses visible buttons and skips motion setup for projector-led classroom play.

## Custom Decks

Use **Create/Edit Decks** to create decks stored in the browser's LocalStorage. Built-in decks
are read-only, but each can be copied into an editable custom deck.

Available editor actions:

- Create, rename, and delete custom decks.
- Add, edit, reorder, bulk categorize, bulk delete, and undo deletion of cards.
- Paste one prompt per line or import card rows from CSV.
- Import a full typed deck from JSON.
- Export a deck as JSON or CSV and back up or restore the whole custom-deck library.
- Share a deck through the native share sheet or a URL fragment that can be imported on a
  second device without an account or server. Share links include the full deck content, so
  only share decks with recipients who should be able to see every prompt and hint.
- Download a recovery backup if malformed saved content is detected.

Custom-deck data stays in the browser and site URL that created it. Changing the hostname,
port, or protocol creates a different browser storage origin.

To avoid browser-storage abuse and accidental freezes, imports have practical limits:

- Up to 100 stored custom decks.
- Up to 500 cards per deck.
- Up to 500,000 characters per JSON or pasted-list import.

## Run the Checks

Run the same verification commands used by CI:

```bash
npm ci
npm run typecheck
npm test -- --run
npm run build
npm run verify:static
npm audit
```

The pull-request workflow runs type checks, unit tests, the production build, and static-output
checks. The container-publishing workflow repeats those checks before pushing an image.
Dependabot checks npm packages, GitHub Actions, and Docker base images weekly.

With Docker running, smoke-test the exact production container locally:

```bash
npm run verify:container
```

That command builds the image, runs it with a read-only filesystem and dropped capabilities,
checks `/healthz`, confirms the served security headers, and verifies runtime metadata
injection.

To audit the public deployment from your workstation:

```bash
npm run audit:production
```

That command checks the production URL, `/healthz`, security headers, Open Graph metadata, and
the public `/sw.js` cache policy. It can fail when a CDN or reverse proxy is still overriding
headers, which means the next fix belongs in the deployment layer rather than in app code.

## Static Hosting

Build the static app:

```bash
npm ci
npm run build
```

Publish the generated `dist/` directory to GitHub Pages, Netlify, Vercel, or another static
host. Tilted uses relative asset URLs so it works from a subdirectory as well as a root domain.
The included `public/_headers` and `vercel.json` provide matching security-header examples for
Netlify-style static hosts and Vercel.

Use HTTPS if players need motion controls on mobile devices.

## Docker Compose

The included [`docker-compose.yml`](./docker-compose.yml) builds and runs Tilted locally:

```bash
docker compose up --build -d
curl http://127.0.0.1:8080/healthz
```

Open `http://127.0.0.1:8080`. Stop the container with:

```bash
docker compose down
```

The runtime container:

- Serves static files from an unprivileged Nginx process on port `8080`.
- Uses a read-only root filesystem.
- Drops Linux capabilities.
- Sets `no-new-privileges`.
- Mounts a small writable `/tmp` filesystem required by Nginx.
- Exposes `/healthz` for container health checks.
- Copies immutable build output into `/tmp` at startup so deployment-specific social metadata
  can be injected without rebuilding the image.

Custom decks remain in browser LocalStorage, so updating the image does not remove a user's
decks when the public site URL stays the same.

## Use a Published GHCR Image

The GitHub Actions workflow publishes multi-platform images after a push to `main`, a `v*`
tag, or a manual workflow run. Replace `<github-owner>` with the account or organization that
owns your fork:

```text
ghcr.io/<github-owner>/tilted:latest
```

Use the published image with the included Compose file:

```bash
TILTED_IMAGE=ghcr.io/<github-owner>/tilted:latest docker compose up -d
```

Published tags include:

| Tag | Use |
| --- | --- |
| `latest` | Follow the newest default-branch image |
| `main` | Follow the newest `main` image |
| `sha-<commit>` | Pin a specific release |
| `v*` | Pin a tagged release |

For a controlled Unraid deployment, prefer a release tag, SHA tag, or image digest instead of
the mutable `latest` tag.

## Reverse Proxy and HTTPS

Point a reverse proxy upstream to `http://<server-ip>:8080`. Terminate TLS at the reverse
proxy and expose an HTTPS public URL.

The bundled Nginx configuration adds:

- Content Security Policy
- `Permissions-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- Long-lived asset caching and uncached HTML/service-worker responses

If your reverse proxy also sets security headers, verify that it does not replace the
container's policy with one that blocks service workers or device-orientation APIs.
Also verify that the proxy or CDN does not cache `/sw.js`; it should be served with
`Cache-Control: no-cache, must-revalidate` or an equivalent prompt-revalidation policy so
installed browsers discover app updates quickly.

For Cloudflare-backed deployments, add a cache rule for the hostname and URI path `/sw.js`
that bypasses cache or sets Edge TTL to 0 while respecting the origin response. Re-run
`npm run audit:production` after the rule is published; the check should no longer report
`Cache-Control: max-age=14400`.

After the HTTPS public hostname is stable and verified, configure HSTS at the TLS-terminating
reverse proxy:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Do not add `preload` until every relevant subdomain is permanently HTTPS-ready.

## Run on Unraid

Create a Docker container in Unraid with these values:

| Setting | Value |
| --- | --- |
| Repository | `ghcr.io/<github-owner>/tilted:<release-tag>` |
| Container port | `8080` |
| Host port | Any available port, such as `8080` |
| Network type | Your reverse-proxy-compatible Docker network |
| Restart policy | `unless-stopped` |
| `TILTED_PUBLIC_URL` | Optional HTTPS public app URL for social previews |
| `TILTED_SHARE_IMAGE_URL` | Optional absolute HTTPS cover-image URL for social previews |

Point your reverse proxy upstream to `http://<unraid-ip>:8080`, or use the container name and
port if the proxy shares its Docker network. Use an HTTPS public URL for mobile motion access.

Public GHCR packages can be pulled without a registry login. For a private fork, configure
Unraid with a GitHub username and personal access token that has package-read permission.

## Social Preview Metadata

Tilted includes Open Graph and Twitter/X card metadata. For the published container, customize
the canonical URL and social preview image at runtime:

```bash
TILTED_PUBLIC_URL=https://tilted.example.com \
TILTED_SHARE_IMAGE_URL=https://tilted.example.com/assets/tilted-cover.png \
docker compose up -d
```

Static deployments can customize the same values at build time:

```bash
VITE_PUBLIC_URL=https://tilted.example.com \
VITE_SHARE_IMAGE_URL=https://tilted.example.com/assets/tilted-cover.png \
npm run build
```

Docker builds accept the same values:

```bash
docker build \
  --build-arg VITE_PUBLIC_URL=https://tilted.example.com \
  --build-arg VITE_SHARE_IMAGE_URL=https://tilted.example.com/assets/tilted-cover.png \
  -t tilted:custom .
```

The Docker runtime variables take precedence over the image defaults. The defaults point to
the canonical public Tilted deployment at `https://tilted.mrhallsclass.com`; forks and private
self-hosted instances should override them so shared links advertise the correct hostname and
preview image.

## Install and Offline Support

The production build registers a small service worker that caches the app shell and fills its
cache with same-origin static assets as they are requested. After the first successful load,
the core interface and built-in deck bundle remain available during a temporary network loss.

On browsers that expose an install prompt, Tilted offers an **Install app** banner. On iPhone
or iPad, tap Share and then **Add to Home Screen**. Tilted also displays an offline indicator
and an update banner when a new service worker is ready. The production build stamps the
service-worker cache name from the built app shell, so cache revisions change when shell assets
change; keep `index.html` and `sw.js` uncached at the proxy so browsers can discover updates
promptly.

## Troubleshooting

### Motion permission does not appear

- Serve the app over HTTPS.
- On iOS Safari, reload the page and tap **Start Round** again.
- Check browser and device privacy settings.
- Continue with buttons if motion access is unavailable.

### Tilt directions feel backward

- Enable **Reverse tilt directions** during round setup.
- Hold still during the three-second countdown.
- Return the phone to neutral after each card.

### The phone will not rotate

- Disable Portrait Orientation Lock on iPhone.
- Enable Auto-rotate on Android.
- Rotate the phone before starting the round.

### A custom deck disappeared

- Open **Create/Edit Decks**.
- Download the preserved recovery backup if Tilted detected malformed storage.
- Keep exported JSON backups for decks you want to share or preserve.

### A container is unhealthy

```bash
docker compose ps
docker compose logs tilted
curl http://127.0.0.1:8080/healthz
```

## Security Notes

- The deployed app is client-only and has no backend or account system.
- Custom deck data stays in browser LocalStorage.
- Team rosters stay in memory during a team game; saved round history omits team and player
  identifiers before writing to LocalStorage.
- Anonymous CSV export is the default for round and history downloads.
- React escapes rendered card content.
- Imports are validated and size-limited before storage.
- The runtime image is unprivileged, read-only, and capability-dropped.
- GitHub Actions and base container images are pinned to immutable revisions.
- Run `npm audit` regularly and review Dependabot pull requests.

## Project Structure

```text
.
├── .github/               # CI, GHCR publishing, and Dependabot
├── deploy/                # Static server, runtime metadata injection, and headers
├── public/                # Favicons, share image, manifest, and service worker
├── scripts/               # Static-output and container smoke checks
├── src/components/        # Screen-state UI
├── src/data/              # Built-in guessing decks
├── src/hooks/             # Timer, orientation, and motion behavior
├── src/services/          # Audio, preferences, and LocalStorage helpers
├── Dockerfile             # Multi-stage production image
└── docker-compose.yml     # Local and self-hosted container example
```

## Unofficial Content Notice

Tilted is an unofficial fan-made game and is not affiliated with, endorsed by, or sponsored
by any brands, studios, publishers, or rights holders referenced by category names or prompts.
