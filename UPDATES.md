# Updates

## 2026-06-07 - Begin PLAN.md acceptance implementation

### Summary

Started implementing the measurable `PLAN.md` acceptance criteria on branch
`codex/resolve-plan-criteria`. Recorded baseline evidence before app-code changes and began the
classroom-safe deck discovery and metadata-search slice.

### Files Created

- `PLAN.md`
- `TILTED_CODE_REVIEW.md`

### Files Updated

- `README.md`
- `AGENTS.md`
- `UPDATES.md`
- `.github/workflows/ci.yml`
- `.gitignore`
- `config/security-headers.json`
- `eslint.config.js`
- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `e2e/.gitkeep`
- `vite.config.ts`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/components/AppScreens.tsx`
- `src/components/ConfirmDialog.tsx`
- `src/components/ConfirmDialog.test.tsx`
- `src/components/DeckEditor.tsx`
- `src/components/DeckEditor.test.tsx`
- `src/components/SharedDeckNotice.tsx`
- `src/components/deck-editor/CardListSection.tsx`
- `src/components/deck-editor/DeckDetailsPanel.tsx`
- `src/components/deck-editor/DeckSidebar.tsx`
- `src/components/deck-editor/ImportPanels.tsx`
- `src/components/deck-editor/RecoveryNotice.tsx`
- `src/components/deck-editor/useDeckWorkshop.ts`
- `src/components/DeckSelectScreen.tsx`
- `src/components/DeckSelectScreen.test.tsx`
- `src/components/HistoryScreen.tsx`
- `src/components/HistoryScreen.test.tsx`
- `src/components/TeamSetupScreen.tsx`
- `src/components/TeamSetupScreen.test.tsx`
- `src/services/preferences.test.ts`
- `src/services/appFlow.ts`
- `src/services/appFlow.test.ts`
- `src/services/roundHistory.ts`
- `src/services/roundHistory.test.ts`
- `src/services/deckSharing.ts`
- `src/services/deckSharing.test.ts`
- `src/services/teamSession.test.ts`
- `src/styles/global.css`
- `tests/e2e/smoke.spec.ts`
- `scripts/verify-static.mjs`

### Baseline Evidence Before App-Code Changes

| Command | Result | Notes |
| ------- | ------ | ----- |
| `git branch --show-current` | Pass | Printed `codex/resolve-plan-criteria`. |
| `git status --short` | Pass with notes | `PLAN.md` and `TILTED_CODE_REVIEW.md` were untracked and are included in this plan. |
| `npm run typecheck` | Pass | TypeScript project build check passed. |
| `npm test -- --run` | Pass | 16 test files and 54 tests passed. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `204bed1859c1`. |
| `npm run verify:static` | Pass | Static bundle verification passed. |
| `npm run audit:production` | Expected fail | Live `/sw.js` still returned `Cache-Control: max-age=14400`; HSTS preload warning remains. Items 1B and 1C require external production/proxy/domain action before completion. |
| `npm test -- --run src/components/DeckSelectScreen.test.tsx src/services/preferences.test.ts` | Pass | 2 files and 14 tests passed after adding classroom-safe and metadata coverage. |
| `rg -n "loadClassroomOnly\|saveClassroomOnly\|classroomOnly" src/App.tsx` | Pass | Found app-level preference load, save, state, and prop wiring. |
| `rg -n "Classroom-safe decks only\|classroomSafe" src/components/DeckSelectScreen.tsx` | Pass | Found toggle copy and built-in deck filtering. |
| `rg -n "\\.deck-card__metadata\|display: flex\|flex-wrap: wrap\|gap:" src/styles/global.css` | Pass | Found `.deck-card__metadata` selector with `display: flex`, `flex-wrap: wrap`, and `gap`. |
| `rg -n "Classroom-safe decks only" README.md` | Pass | README copy matches the implemented toggle label. |
| `rg -n "CLASSROOM_ONLY_KEY\|loadClassroomOnly\|saveClassroomOnly" src/services/preferences.test.ts` | Pass | Preference test covers the classroom-safe key and load/save helpers. |
| `npm test -- --run src/components/PwaBanner.test.tsx src/App.test.tsx` | Pass | 2 files and 7 tests passed after moving the banner to non-game screens. |
| `rg -n "<PwaBanner" src/App.tsx \| wc -l` | Pass | Printed `1`. |
| `npm run typecheck` | Pass | TypeScript project build check passed after classroom-safe, metadata, and PWA banner changes. |
| `npm test -- --run` | Pass | 16 test files and 64 tests passed after the current implementation slice. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `bf126de1026b`. |
| `npm run verify:static` | Pass | Static bundle verification passed after the current implementation slice. |
| `npm test -- --run src/components/DeckEditor.test.tsx` | Pass | 1 file and 6 tests passed after adding single-card, bulk-card, all-card, and different-deck undo coverage. |
| `rg -n "Deleted [^\\n]*cards\|Undo" src/components/DeckEditor.tsx` | Pass | Found batch delete notice and Undo button copy. |
| `npm test -- --run src/services/teamSession.test.ts src/components/TeamSetupScreen.test.tsx` | Pass | 2 files and 7 tests passed after adding duplicate-name validation, no-roster fallback, and comma-separated player coverage. |
| `npm run typecheck` | Pass | TypeScript project build check passed after team validation changes. |
| `npm test -- --run src/services/roundHistory.test.ts` | Pass | 1 file and 4 tests passed after adding malformed card/outcome sanitization coverage. |
| `npm run typecheck` | Pass | TypeScript project build check passed after round-history validation changes. |
| `npm test -- --run` | Pass | 17 test files and 73 tests passed after team and round-history changes. |
| `npm test -- --run src/App.test.tsx src/services/deckSharing.test.ts` | Pass | 2 files and 11 tests passed after adding shared-link import, malformed-link, oversized-link, and dismiss coverage. |
| `rg -n "window\\.confirm\|window\\.alert" src/App.tsx` | Pass | Returned no matches. |
| `rg -n "status: \"none\"\|status: \"ok\"\|status: \"error\"" src/services/deckSharing.ts` | Pass | Found the discriminated shared-link result statuses. |
| `npm run typecheck` | Pass | TypeScript project build check passed after shared-link import changes. |
| `npm test -- --run` | Pass | 18 test files and 79 tests passed after shared-link changes. |
| `npm run typecheck` | Pass | TypeScript project build check passed in the final verification pass for this chunk. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `030cf1c9b504`. |
| `npm run verify:static` | Pass | Static bundle verification passed in the final verification pass for this chunk. |
| `npm install -D @playwright/test eslint@^9.39.4 @eslint/js@^9.39.4 typescript-eslint eslint-plugin-react-hooks eslint-plugin-jsx-a11y globals` | Pass | Added Playwright and ESLint tooling; 0 vulnerabilities reported. |
| `npm run lint` | Pass | ESLint completed with 0 errors and 4 React Hooks dependency warnings. |
| temporary negative lint check with `const temporaryUnusedLintCheck = true;` in `src/App.tsx` | Expected fail | `npm run lint` failed with `@typescript-eslint/no-unused-vars`, proving unused locals fail lint. The temporary edit was removed. |
| `npm run test:e2e -- --list` | Pass | Listed 5 Chromium smoke tests in `tests/e2e/smoke.spec.ts`. |
| `npx playwright install chromium` | Pass | Installed the Chromium browser required for local Playwright runs. |
| `npm run test:e2e` | Pass | 5 Chromium smoke tests passed using the Vite preview web server. |
| `rg -n "Quick Round\|Tilt Off\|Correct\|Round Complete" tests e2e` | Pass | Found quick-round smoke coverage. |
| `rg -n "Team Game\|Choose a Deck\|turn" tests e2e` | Pass | Found team handoff smoke coverage. |
| `rg -n "custom deck\|New Deck\|Add Card\|Manage Decks" tests e2e` | Pass | Found custom-deck creation smoke coverage. |
| `rg -n "#deck=\|shared deck\|Import" tests e2e` | Pass | Found valid and invalid shared-link smoke coverage. |
| `rg -n "viewport\|landscape\|390\|844\|mobile" tests e2e` | Pass | Found mobile landscape viewport coverage. |
| `rg -n "npm run test:e2e" README.md` | Pass | README documents the browser smoke command. |
| `rg -n "test:e2e" package.json` | Pass | `package.json` contains the e2e script. |
| `rg -n "webServer" playwright.config.ts` | Pass | Playwright config defines a Vite preview web server. |
| `rg -n "npm run test:e2e" .github/workflows/ci.yml` | Pass | CI runs the browser smoke tests. |
| `rg -n "playwright-report/\|test-results/" .gitignore` | Pass | Playwright output directories are ignored. |
| `rg -n "test:e2e:ui" package.json README.md` | Pass | Returned no matches. |
| `rg -n "jsx-a11y\|accessibility" eslint.config.* package.json` | Pass | Found JSX accessibility lint coverage. |
| `rg -n "no-unused-vars\|unused-imports\|@typescript-eslint/no-unused-vars" eslint.config.* package.json` | Pass | Found unused-code lint coverage. |
| `rg -n "loadClassroomOnly\|saveClassroomOnly" src/App.tsx src/components src/services/preferences.test.ts` | Pass | Classroom-only helpers are actively used and tested. |
| `npm test -- --run src/services/preferences.test.ts` | Pass | 1 file and 4 tests passed after lint tooling was added. |
| `npm run typecheck` | Pass | TypeScript project build check passed after lint and e2e tooling changes. |
| `npm test -- --run` | Pass | 18 test files and 79 tests passed after excluding Playwright specs from Vitest. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `030cf1c9b504`. |
| `npm run verify:static` | Pass | Static bundle verification passed after lint/e2e tooling changes. |
| `npm run test:e2e` | Pass | 5 Chromium smoke tests passed after Playwright locator/timing fixes. |
| `npm test -- --run src/components/ConfirmDialog.test.tsx src/components/DeckEditor.test.tsx src/components/HistoryScreen.test.tsx src/App.test.tsx` | Pass | 4 files and 20 tests passed after adding the app-native confirmation dialog and migrating destructive confirmations. |
| `rg -n "window\\.confirm\|window\\.alert" src` | Pass | Returned no matches. |
| `npm run typecheck` | Pass | TypeScript project build check passed after dialog migration. |
| `npm run lint` | Pass | ESLint completed with 0 errors and 4 React Hooks dependency warnings after dialog migration. |
| `npm test -- --run` | Pass | 20 test files and 85 tests passed after dialog migration. |
| `npm run test:e2e` | Pass | 5 Chromium smoke tests passed after dialog migration. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `1a8c580c0e40`. |
| `npm run verify:static` | Pass | Static bundle verification passed after dialog migration. |
| `rg -n "Content-Security-Policy\|Permissions-Policy\|Referrer-Policy\|X-Content-Type-Options\|X-Frame-Options" config/security-headers.json` | Pass | Source of truth contains all five required security headers. |
| `rg -n "config/security-headers.json\|securityHeaders\|assertHeaderValues" scripts/verify-static.mjs` | Pass | Static verifier reads the source of truth and validates header values from it. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `1a8c580c0e40` before header verification. |
| `npm run verify:static` | Pass | Exact header values passed for `deploy/nginx.conf`, `dist/_headers`, and `vercel.json`. |
| temporary drift check changing `deploy/nginx.conf` `X-Frame-Options` from `DENY` to `SAMEORIGIN` | Expected fail | `npm run verify:static` failed with `deploy/nginx.conf does not match /add_header\\s+X-Frame-Options\\s+"DENY"\\s+always;/`. The temporary edit was reverted. |
| `npm run verify:static` after reverting temporary drift | Pass | Static bundle verification passed after restoring the header value. |
| read-only Item 14 verification subagent | Pass with stale-note caveat | Confirmed `config/security-headers.json`, exact-value validation in `scripts/verify-static.mjs`, and `npm run verify:static` passing. Its missing negative-check note was resolved by the drift-check entry above. |
| `npm run lint` | Pass | ESLint completed with 0 errors and 4 React Hooks dependency warnings after security-header changes. |
| `npm run typecheck` | Pass | TypeScript project build check passed after security-header changes. |
| `npm test -- --run` | Pass | 20 test files and 85 tests passed after security-header changes. |
| `npm run test:e2e` | Pass | 5 Chromium smoke tests passed after security-header changes. |
| `wc -l src/App.tsx && test "$(wc -l < src/App.tsx)" -le 419` | Pass | `App.tsx` is 417 lines after extracting screen rendering and shared-link notice. |
| `rg -n "localStorage\|navigator\|document\\.\|window\\.\|primeAudio\|roundDisplay\|motion\\." src/services/appFlow.ts` | Pass | Returned no matches, confirming the app-flow reducer stays side-effect free. |
| `npm test -- --run src/services/appFlow.test.ts src/App.test.tsx` | Pass | 2 files and 13 tests passed after app-flow extraction. |
| `npm run typecheck` | Pass | TypeScript project build check passed after app-flow extraction. |
| `npm test -- --run` | Pass | 21 test files and 90 tests passed after app-flow extraction. |
| `npm run lint` | Pass | ESLint completed with 0 errors and 4 React Hooks dependency warnings after app-flow extraction. |
| `npm run test:e2e` | Pass | 5 Chromium smoke tests passed after app-flow extraction. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `f7c38da7a484` after app-flow extraction. |
| `npm run verify:static` | Pass | Static bundle verification passed after app-flow extraction. |
| `wc -l src/components/DeckEditor.tsx && test "$(wc -l < src/components/DeckEditor.tsx)" -le 504` | Pass | `DeckEditor.tsx` is 120 lines after extracting hook and section components. |
| `find src/components/deck-editor -maxdepth 1 -type f \| wc -l` | Pass | Printed `6`, exceeding the four-file extraction requirement. |
| `rg -n "Import JSON\|Import CSV\|Import from link" src/components/DeckEditor.tsx` | Pass | Returned no matches after moving import panels out of `DeckEditor.tsx`. |
| `rg -n "Card [0-9]\|card-row\|starter" src/components/DeckEditor.tsx` | Pass | Returned no matches after moving card-list and starter-sidebar JSX out of `DeckEditor.tsx`. |
| `rg -n "useDeckWorkshop" src/components/DeckEditor.tsx src/components/deck-editor/useDeckWorkshop.ts` | Pass | Found the typed hook export and active `DeckEditor.tsx` usage. |
| `npm test -- --run src/components/DeckEditor.test.tsx` | Pass | 1 file and 7 tests passed after the DeckEditor extraction. |
| `npm run typecheck` | Pass | TypeScript project build check passed after the DeckEditor extraction. |
| `npm run lint` | Pass | ESLint completed with 0 errors and 4 React Hooks dependency warnings after the DeckEditor extraction. |
| `npm test -- --run` | Pass | 21 test files and 90 tests passed after the DeckEditor extraction. |
| `npm run test:e2e` | Pass | 5 Chromium smoke tests passed after the DeckEditor extraction. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `e5fc387665d3` after the DeckEditor extraction. |
| `npm run verify:static` | Pass | Static bundle verification passed after the DeckEditor extraction. |
| `npm audit --omit=dev --audit-level=moderate` | Pass | 0 vulnerabilities reported after the implementation pass. |
| `npm audit` | Pass | 0 vulnerabilities reported after the implementation pass. |
| `docker compose config` | Pass | Compose config resolved successfully after the implementation pass. |
| `npm run verify:container` | Pass | Hardened container smoke test passed on port 61701 after the implementation pass. |
| `npm run audit:production` | Expected fail | Live `/sw.js` still returned `Cache-Control: max-age=14400` on 2026-06-07, and HSTS preload remains enabled pending domain-owner confirmation. |
| `curl -fsSI https://tilted.mrhallsclass.com/sw.js` | Expected fail | Live response still showed `server: cloudflare`, `Cache-Control: max-age=14400`, and `cf-cache-status: REVALIDATED` on 2026-06-07. |
| `curl -fsSI https://tilted.mrhallsclass.com/` | Pass with pending HSTS decision | Root response showed `Cache-Control: no-cache` and `Strict-Transport-Security: max-age=63072000;includeSubDomains; preload` on 2026-06-07. |
| `rg -n "cloudflare\|CF_\|wrangler\|pages\|vercel\|netlify\|deploy\|rsync\|ssh\|tilted\\.mrhallsclass\|mrhallsclass" ...` | Pass with notes | Found no Cloudflare or direct host deployment automation in the repository; production cache/HSTS changes remain external. |
| `npm run build` | Pass | Vite build passed and stamped service-worker cache `e5fc387665d3` after making the Nginx `/sw.js` cache header explicit. |
| `npm run verify:static` | Pass | Static verifier now requires the exact Nginx `/sw.js` `Cache-Control: no-cache, must-revalidate` header and passed. |
| repeated blocker audit: `npm run audit:production` | Expected fail | A later 2026-06-07 rerun still failed because live `/sw.js` reported `Cache-Control: max-age=14400`; the HSTS preload warning also remains. |
| repeated blocker audit: `curl -fsSI https://tilted.mrhallsclass.com/sw.js` | Expected fail | Live response still showed `server: cloudflare`, `Cache-Control: max-age=14400`, and `cf-cache-status: REVALIDATED`. |
| repeated blocker audit: `curl -fsSI https://tilted.mrhallsclass.com/` | Pass with pending HSTS decision | Root response still showed `Strict-Transport-Security: max-age=63072000;includeSubDomains; preload`. |
| repeated blocker audit: repo deployment search | Pass with notes | `rg` found README guidance and repository Nginx/static verification, but no repo-owned Cloudflare, SSH, rsync, or host deployment automation that can change the live production headers. |

### Changes Made

- Added app-level classroom-safe filter state backed by `loadClassroomOnly()` and `saveClassroomOnly()`.
- Added the **Classroom-safe decks only** control to deck selection.
- Filtered unsafe built-in decks out of visible built-in cards, Surprise Me, and mixed-category candidates while preserving custom deck visibility.
- Included deck `subject` and `ageRange` metadata in search text while preserving tag search.
- Displayed compact subject, age-range, and `Classroom safe` labels on deck cards.
- Added regression coverage for classroom-safe filtering, custom deck visibility, Surprise Me, mixed-category filtering, metadata search, metadata labels, and classroom preference persistence.
- Rendered the PWA/storage banner from one app-level location across non-game screens, while keeping it off active gameplay and pre-game orientation/countdown screens.
- Added App-level coverage proving the storage banner appears on a non-home screen and is absent during active gameplay.
- Replaced single-card-only delete undo state with a deletion batch that records deck id, original indexes, and card payloads.
- Routed single-card and bulk-card deletion through the same undo path, restores bulk-deleted cards in original order, and keeps all-card bulk deletion blocked.
- Added case-insensitive duplicate team-name validation with visible warning copy and disabled deck selection.
- Added tests preserving unique-name progression, comma-separated player parsing, no-roster active-player fallback, optional player rotation, and ID-based score separation.
- Added stored round-history card and outcome validators.
- Sanitized malformed `outcomes`, `correctCards`, and `passedCards` on load while preserving team/player identifier stripping and rewriting cleaned history to LocalStorage.
- Replaced shared-link native confirm/alert handling in `App.tsx` with app-rendered import, dismiss, and error notices.
- Changed shared-link reading to return `none`, `ok`, or `error` statuses while preserving malformed, validation, and size-limit error messages.
- Added ESLint flat config with TypeScript, React Hooks, JSX accessibility, and unused-code coverage.
- Added Playwright browser smoke tooling and CI execution.
- Added five e2e smoke tests covering quick rounds, team handoff, custom deck creation, shared-link import/error handling, and a mobile landscape game-screen path.
- Excluded `tests/e2e/**` from Vitest so unit tests and Playwright smoke tests run through their dedicated commands.
- Added reusable `ConfirmDialog` with accessible alertdialog semantics, focus movement/restoration, Escape dismissal, and destructive-action styling.
- Migrated deck deletion and clear-history confirmation away from native browser dialogs.
- Added cancellation tests proving deck deletion and clear-history actions leave data intact.
- Added `config/security-headers.json` as the machine-readable source of truth for security headers.
- Updated `scripts/verify-static.mjs` to validate exact security-header values across Nginx, generated `_headers`, and Vercel config.
- Proved header drift detection by temporarily changing one Nginx header value and confirming `npm run verify:static` failed before reverting it.
- Added a pure `appFlowReducer` in `src/services/appFlow.ts` with focused transition tests.
- Integrated named app-flow events into `App.tsx` while keeping storage-backed state, motion, wake/fullscreen, audio, and LocalStorage effects outside the reducer.
- Extracted screen rendering into `AppScreens` and shared-deck notices into `SharedDeckNotice`, reducing `App.tsx` to 417 lines.
- Extracted Deck Workshop state and persistence into `useDeckWorkshop`.
- Moved Deck Workshop sidebar, deck details, card list, recovery notice, and import panels into dedicated `src/components/deck-editor/` modules.
- Reduced `DeckEditor.tsx` to a 120-line coordinator without import-panel, card-list, or starter-sidebar JSX.
- Made the Nginx `/sw.js` cache policy explicit with `Cache-Control: no-cache, must-revalidate`.
- Extended `scripts/verify-static.mjs` so Nginx `/sw.js` cache-header drift fails local verification.
- Added a README note for Cloudflare-backed deployments to bypass cache or set Edge TTL to 0 for `/sw.js`.

## 2026-06-04 - Implement local audit recommendations

### Summary

Implemented the audit items that could be completed locally in the repository. The changes keep Tilted client-only, preserve privacy defaults, improve deployment metadata defaults, automate service-worker cache naming, add a live production audit script, and document the remaining deployment-layer work that requires Cloudflare/reverse-proxy/domain access.

### Files Created

- `scripts/check-production.mjs`
- `scripts/stamp-service-worker.mjs`

### Files Updated

- `README.md`
- `AGENTS.md`
- `UPDATES.md`
- `package.json`
- `vite.config.ts`
- `deploy/40-runtime-metadata.sh`
- `public/_headers`
- `public/sw.js`
- `vercel.json`
- `scripts/verify-static.mjs`
- `src/components/DeckEditor.tsx`
- `src/services/roundHistory.ts`
- `src/services/roundHistory.test.ts`
- `src/styles/global.css`

### Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `git status --short --branch` | Pass | Started clean on `main...origin/main`. |
| `npm ci` | Pass | Installed dependencies; 0 vulnerabilities reported. |
| `npm run typecheck` | Pass | Passed after rerun. The first parallel attempt raced with `npm ci` replacing `node_modules`. |
| `npm test -- --run` | Pass | 16 test files and 54 tests passed. |
| `npm test -- --run src/services/roundHistory.test.ts` | Pass | Targeted privacy-history regression test passed. |
| `npm run build` | Pass | Vite build passed and stamped `dist/sw.js` with cache `204bed1859c1`. |
| `npm run verify:static` | Pass | Verified headers, metadata, stamped service worker, and unresolved placeholders. |
| `npm audit --omit=dev --audit-level=moderate` | Pass | 0 vulnerabilities. |
| `npm audit` | Pass | 0 vulnerabilities. |
| `docker compose config` | Pass | Compose config resolved successfully. |
| `docker build -t tilted-audit-verify .` | Pass | Fresh image built with stamped service worker. |
| `docker compose build` | Pass | Compose image build completed. |
| `npm run verify:container` | Pass | Passed after fixing runtime metadata replacement order. |
| `npm run audit:production` | Expected fail | Live deployment still has GitHub-default metadata and `/sw.js` cache `max-age=14400`; HSTS preload warning remains. These require deployment/proxy changes or a redeploy outside the local repo. |

### Changes Made

- Implemented privacy-first saved history: team/player identifiers are stripped before writing round history to LocalStorage, and older stored history is sanitized on load.
- Added regression coverage proving saved history does not retain team/player identifiers while explicit in-memory CSV export can still include names when requested by code.
- Changed default build-time and Docker runtime social metadata from GitHub URLs to `https://tilted.mrhallsclass.com`.
- Fixed Docker runtime metadata replacement order so custom `TILTED_SHARE_IMAGE_URL` is honored even when it shares the public URL prefix.
- Added `scripts/stamp-service-worker.mjs` and wired it into `npm run build` so the service-worker cache name is generated from the built app shell.
- Updated static-host/Vercel `/sw.js` cache headers to `no-cache, must-revalidate`.
- Added `scripts/check-production.mjs` and `npm run audit:production` for repeatable live checks of headers, metadata, `/healthz`, and `/sw.js` caching.
- Added deck-editor copy warning that share links contain the full deck content.
- Set game-card prompt letter spacing to `0` for better classroom/projector readability.
- Updated README and AGENTS documentation for privacy behavior, service-worker stamping, production metadata defaults, and live deployment checks.

### Audit Items Implemented

- `MED-002`: Team/player names no longer persist in saved round history.
- `MED-003`: Repository defaults now point social metadata at the production Tilted URL and hosted cover image.
- `LOW-001`: Game prompts no longer inherit negative global heading letter spacing.
- `LOW-002`: Service-worker cache revisioning is now generated during build from shell asset content.
- `LOW-003`: Deck sharing now displays a warning that shared URLs include full deck content.
- `FUNC-001`: Privacy-first team history behavior implemented.
- `FUNC-002`: Production deployment audit command added.

### Audit Items Deferred

- `MED-001`: Live production `/sw.js` is still cached with `Cache-Control: max-age=14400`. Reason: fixing the observed live header requires Cloudflare, CDN, reverse-proxy, or server deployment access. Recommended manual next step: update the proxy/CDN rule for `/sw.js` to no-cache or must-revalidate, redeploy if needed, then run `npm run audit:production`.
- `MED-004`: Production HSTS includes `includeSubDomains; preload`. Reason: confirming or changing this requires domain/reverse-proxy ownership decisions outside the repository. Recommended manual next step: confirm every relevant `mrhallsclass.com` subdomain is permanently HTTPS-ready, or remove `preload`/`includeSubDomains` at the TLS-terminating layer.
- Real-device motion, installed-PWA update behavior, and projector/smartboard readability remain deferred because they require manual classroom-device testing.

### Follow-Up Needed

- Redeploy Tilted so production picks up the new default social metadata and runtime replacement fix.
- Update the production proxy/CDN cache rule for `/sw.js`.
- Confirm the domain-wide HSTS preload decision.
- Run `npm run audit:production` after deployment/proxy changes.
- Add browser-level smoke tests in a later pass if desired.

## 2026-06-04 - Initial repository audit and agent documentation

### Summary

Completed a documentation-only audit pass for Tilted using `TASKS.md` as the source of truth. Added future-agent guidance, a dated audit report, and this update log. No application code was changed.

### Files Created

- `AGENTS.md`
- `AUDIT-2026-06-04.md`
- `UPDATES.md`

### Files Updated

- `TASKS.md` was already present as an untracked root audit brief and remains at the root.
- Historical audit files were already under `references/`; no moves were needed.

### Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |
| `date +%F` | Pass | Returned `2026-06-04`. |
| `git status --short --branch` | Pass | `main...origin/main`; only `TASKS.md` untracked before new docs. |
| `git branch --show-current` | Pass | `main`. |
| `git remote -v` | Pass | `origin` fetch/push points to GitHub. |
| `rg --files` | Pass | Used to map repository files. |
| `npm ci` | Pass | Installed packages; 0 vulnerabilities reported. |
| `npm run typecheck` | Pass | TypeScript project build check passed. |
| `npm test -- --run` | Pass | 16 test files and 53 tests passed. |
| `npm run build` | Pass | Production build passed. |
| `npm run verify:static` | Pass | Static bundle verification passed. |
| `npm audit --omit=dev --audit-level=moderate` | Pass | 0 vulnerabilities. |
| `npm audit` | Pass | 0 vulnerabilities. |
| `npm outdated` | Pass | No outdated top-level packages reported. |
| `npm ls --depth=0` | Pass | Confirmed top-level dependency versions. |
| `docker --version` | Pass | Docker 29.4.2 available. |
| `docker compose version` | Pass | Compose v5.1.3 available. |
| `docker compose config` | Pass | Compose config resolved successfully. |
| `docker build -t tilted-audit-verify .` | Pass | Fresh Docker image built. |
| `docker compose build` | Pass | Compose image build completed. |
| `npm run verify:container` | Pass | Hardened container smoke test passed. |
| `gh --version` | Pass | GitHub CLI available. |
| `gh auth status` | Pass | Authenticated; token value not recorded. |
| `gh workflow list` | Pass | Verify app, Publish container, and Dependabot Updates active. |
| `gh run list --limit 5` | Pass | Latest `main` Verify and Publish runs succeeded. |
| `gh repo view --json nameWithOwner,isPrivate,defaultBranchRef,url` | Pass | Public repo, default branch `main`. |
| `gh api repos/hallveticapro/Tilted/branches/main/protection` | Pass | Branch protection requires `verify`; force pushes/deletions blocked. |
| `curl --head https://tilted.mrhallsclass.com` | Pass with notes | HTTP 200 and security headers present; HSTS preload observed. |
| `curl https://tilted.mrhallsclass.com/healthz` | Pass | Returned `ok`. |
| `curl https://tilted.mrhallsclass.com` | Pass with notes | HTML served; social metadata uses GitHub defaults. |
| `curl --head https://tilted.mrhallsclass.com/sw.js` | Pass with finding | HTTP 200, but `Cache-Control: max-age=14400`. |
| `curl --head https://tilted.mrhallsclass.com/assets/tilted-cover.png` | Pass | Asset served with long-lived caching. |
| `rg -n "replit|\.replit|replit\.nix|starter|template|scaffold" ...` | Pass with notes | No stale Replit/scaffold files found; active starter deck UI copy is intentional. |

### Changes Made

- Added `AGENTS.md` with project overview, commands, repo map, conventions, validation notes, security/privacy guidance, accessibility notes, deployment notes, and future-agent instructions.
- Added `AUDIT-2026-06-04.md` with required audit sections, validation results, current findings, functionality opportunities, deployment review, and roadmap.
- Added `UPDATES.md` to preserve a dated log of this audit pass.
- Confirmed old audits are already organized under `references/`.

### Git Commit and Push

- Initial audit documentation commit: `57d3e8a` (`Add Tilted audit and agent documentation`).
- Push result: succeeded to `origin/main`.
- Push note: GitHub reported the repository owner bypassed the pending required `verify` status check on direct push; fresh Verify app and Publish container workflow runs started after the push.

### Findings Documented But Not Fixed

- `MED-001`: Production `sw.js` is cached for four hours.
- `MED-002`: Team/player names can persist in LocalStorage round history on shared devices.
- `MED-003`: Production social metadata points at GitHub defaults.
- `MED-004`: Production HSTS preload policy needs domain-wide confirmation.
- `LOW-001`: Game prompts inherit negative global heading letter spacing.
- `LOW-002`: Service-worker cache revisioning is manual.
- `LOW-003`: Shared deck URLs contain full deck content in the fragment.

### Functionality Ideas Documented

- `FUNC-001`: Privacy-first team history mode.
- `FUNC-002`: Production deployment status checklist.
- `FUNC-003`: Browser-level smoke tests.
- `FUNC-004`: QR-friendly deck sharing.
- `FUNC-005`: Teacher session presets.

### Follow-Up Needed

- Fix production cache behavior for `/sw.js`.
- Set production social metadata environment values.
- Decide how team/player names should behave in persisted history.
- Confirm HSTS preload scope for `mrhallsclass.com`.
- Add browser-level smoke tests and real-device motion/PWA checks.
