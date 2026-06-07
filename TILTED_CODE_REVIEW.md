# Tilted Code Review Report

## Executive Summary

Tilted is a compact, well-tested React/Vite static app with strong client-only privacy boundaries, defensive custom-deck validation, and a hardened Docker/static-host deployment story. Local verification passed for typecheck, the full Vitest suite, production build, static bundle verification, Compose config, and npm audits. The main current risks are not catastrophic code defects; they are product drift around classroom-safe filtering, a live deployment cache policy that still keeps `/sw.js` stale, data-loss edges in deck editing, and maintainability pressure in the two largest stateful components. Security posture is good for a no-backend app, but shared deck URLs and LocalStorage history still need continued care because they can contain classroom-created prompt content.

## Prioritised Action Items

### P0

No P0 issues were found. I did not identify a current remote-code-execution path, committed secret, backend exposure, auth/session defect, broken production build, or game-breaking runtime failure in the repository.

### P1

#### 1. Title: Fix live `/sw.js` cache drift so updates are discoverable promptly

Affected files/functions: `deploy/nginx.conf` (`location = /sw.js`), `public/_headers`, `vercel.json`, `scripts/check-production.mjs`, production proxy/CDN config for `https://tilted.mrhallsclass.com/sw.js`

Problem: The repository intends `sw.js` to be uncached or revalidated, and local static verification passes, but `npm run audit:production` currently fails because live production returns `Cache-Control: max-age=14400`. This can delay service-worker fixes, offline cache changes, and update prompts for classroom users by up to four hours. The same production audit warns that HSTS preload is enabled and still needs domain-owner confirmation.

Fix prompt: Update the live deployment layer for `https://tilted.mrhallsclass.com/sw.js` so the response uses `Cache-Control: no-cache, must-revalidate` or an equivalent immediate revalidation policy. Check Cloudflare, reverse proxy, static host, and container routing rules, because the repo's Nginx/static-host files already express the intended policy. Confirm whether `Strict-Transport-Security: includeSubDomains; preload` is intentional for the whole `mrhallsclass.com` domain. After changing deployment config, run `npm run audit:production` and record the result in `UPDATES.md`.

#### 2. Title: Restore or intentionally remove classroom-safe filtering

Affected files/functions: `README.md` feature list and deck discovery section, `src/components/DeckSelectScreen.tsx`, `src/components/DeckSelectScreen.test.tsx`, `src/services/preferences.ts` (`CLASSROOM_ONLY_KEY`, `loadClassroomOnly`, `saveClassroomOnly`), `src/data/builtInDecks.ts` (`classroomSafe`)

Problem: The README says the deck picker has a classroom-safe toggle, built-in decks still carry `classroomSafe`, and preferences still expose `loadClassroomOnly`/`saveClassroomOnly`. The actual deck selector does not render or apply the filter, and the component test explicitly asserts that the classroom-safe checkbox is absent. That is a user-facing feature/documentation mismatch in a classroom app.

Fix prompt: Decide whether classroom-safe filtering is still a supported feature. If yes, add a `classroomOnly` state to `App`, initialize it with `loadClassroomOnly`, pass it into `DeckSelectScreen`, render a clearly labeled toggle, persist changes with `saveClassroomOnly`, and filter built-in decks and mixed/surprise candidates to `deck.classroomSafe !== false` when enabled. Update `DeckSelectScreen.test.tsx` to assert the toggle exists and hides entertainment/theme-park/movie/music decks. If no, remove the README claims, delete the unused preference key/helpers, and consider deleting or documenting the remaining `classroomSafe` deck metadata.

#### 3. Title: Add protection for bulk card deletion in the deck editor

Affected files/functions: `src/components/DeckEditor.tsx` (`bulkDelete`, `deleteCard`, `undoDeleteCard`, selected-card action bar)

Problem: Single-card deletion has an undo notice, but bulk deletion immediately removes all selected cards from the custom deck and persists the change with no confirmation or batch undo. This is a local-only app, so losing a teacher's deck edits can still be meaningful data loss.

Fix prompt: Change `bulkDelete` to either ask for explicit confirmation before deleting more than one card or, preferably, create a batch undo path parallel to `deletedCard`. Store `{ deckId, cardsWithIndexes }` before removal, show a warning notice such as `Deleted 12 cards`, and restore those cards in original order when Undo is clicked. Add tests covering bulk delete cancellation or undo, and verify that deleting all cards still shows `Keep at least one card in the deck.`

### P2

#### 4. Title: Show recoverable errors for malformed shared deck links

Affected files/functions: `src/services/deckSharing.ts` (`readSharedDeckFromLocation`), `src/App.tsx` shared-deck `useEffect`, `src/services/deckStorage.ts` (`importDeck`)

Problem: `readSharedDeckFromLocation` returns `null` for both "no shared deck" and "bad shared deck." When a user opens a malformed, truncated, oversized, or incompatible `#deck=` link, the app silently ignores it and leaves the hash in the address bar. The current flow also uses `window.confirm` and `window.alert`, which makes this import path feel different from the rest of the app and harder to test.

Fix prompt: Replace `readSharedDeckFromLocation(): Deck | null` with a discriminated result such as `{ status: "none" } | { status: "ok"; deck: Deck } | { status: "error"; message: string }`. Preserve the specific `importDeck` error message when possible. In `App`, render an in-app import notice or modal with Import, Dismiss, and Copy/Download recovery actions; clear the hash after the user dismisses or completes the import. Add App tests for valid import, user cancellation, invalid base64/JSON, and oversized deck errors.

#### 5. Title: Surface PWA/offline/update status outside the home screen

Affected files/functions: `src/App.tsx` home branch, `src/components/PwaBanner.tsx`, `src/hooks/usePwaStatus.ts`

Problem: `PwaBanner` is only rendered when `screen === "home"`. Storage unavailable, offline state, install prompts, and service-worker update prompts are therefore hidden while the user is in deck selection, setup, history, or the editor. It is sensible not to overlay the active game screen, but an update-ready state can be missed during common non-home workflows.

Fix prompt: Render `PwaBanner` at the app level for non-gameplay screens, excluding `game`, `countdown`, `forehead-setup`, and `landscape-gate` if overlays would interrupt play. Keep the home behavior unchanged, but make the banner available on `decks`, `setup`, `editor`, `history`, `how-to-play`, and team setup/results screens. Add component or App tests proving update/offline/storage banners appear on at least one non-home screen and remain absent during an active round.

#### 6. Title: Split the largest stateful components before adding more features

Affected files/functions: `src/App.tsx`, `src/components/DeckEditor.tsx`

Problem: `App.tsx` is nearly 500 lines and owns screen routing, deck state, shared imports, motion setup, round display lifecycle, history persistence, and team-session transitions. `DeckEditor.tsx` is about 630 lines and mixes starter browsing, custom-deck persistence, deferred validation, card editing, imports, exports, sharing, recovery, pagination, and bulk actions. Both files still work, but they are now the highest-risk places for regressions because unrelated workflows share local state.

Fix prompt: Refactor in small steps with behavior-preserving tests. For `DeckEditor`, extract a `useDeckWorkshop` hook for `workingDecks`, deferred persistence, selection, errors, and recovery; split presentational pieces into `DeckWorkshopSidebar`, `DeckMetadataPanel`, `CardEditorList`, and `DeckImportPanels`. For `App`, consider a reducer or small state-machine helper that centralizes screen transitions and round-start destinations, leaving the component to render screens. Do not change gameplay behavior in the same patch; move code first, then add features.

#### 7. Title: Add browser-level smoke tests for real user flows

Affected files/functions: `package.json`, `.github/workflows/ci.yml`, likely new Playwright test files

Problem: The Vitest suite is good for services, hooks, and component behavior, but there is no browser runner covering full flows through the actual built app. The highest-risk workflows are quick round start/finish, team handoff, deck editor import/export/bulk edit, shared deck import, PWA update/offline banner visibility, and mobile landscape layout.

Fix prompt: Add a minimal Playwright suite that runs against `npm run build` plus `vite preview` or the dev server. Cover: quick round with Tilt Off and keyboard/touch scoring, team game handoff after deck selection, creating a custom deck and adding/importing cards, opening a valid and invalid `#deck=` shared URL, and rendering the game screen at a mobile landscape viewport. Wire the suite into CI after unit tests or as a separate workflow. Keep tests synthetic and avoid real student names.

#### 8. Title: Validate duplicate team display names in setup

Affected files/functions: `src/components/TeamSetupScreen.tsx`, `src/services/teamSession.ts`, `src/services/teamSession.test.ts`

Problem: `teamSession` now uses generated IDs for scoring, and tests prove duplicate names do not merge scores. The UI still allows two visible teams with the same name, which can confuse the handoff screen, scoreboard, and result summaries in a classroom.

Fix prompt: Add setup validation that trims team names and detects duplicates case-insensitively. Either disable "Choose a Deck" with a visible message until names are unique, or auto-suffix duplicate display names before creating the session. Add tests for duplicate names, blank names, and player fallback behavior so scoring-by-ID remains protected.

#### 9. Title: Harden round-history loading against malformed stored card payloads

Affected files/functions: `src/services/roundHistory.ts` (`isRoundResult`, `loadRoundHistory`, `sanitizeRoundForHistory`), `src/components/HistoryScreen.tsx`, `src/components/EndRoundScreen.tsx`

Problem: `loadRoundHistory` validates only the top-level round shape and array presence. It does not validate that `correctCards`, `passedCards`, or `outcomes[].card` contain valid card objects. React escaping prevents XSS through normal rendering, but malformed LocalStorage can still produce confusing history, broken CSV counts, or future errors if card fields are assumed to be strings.

Fix prompt: Add stored-history card validation that accepts only cards with string `id` and non-empty string `prompt`, plus optional string `answer`, `category`, and valid `difficulty`. Rebuild `outcomes`, `correctCards`, and `passedCards` from validated values, drop malformed rows, and preserve the existing team/player sanitization. Add tests with corrupted card arrays, non-string prompts, and mixed valid/invalid history entries.

### P3

#### 10. Title: Add automated unused-code and style checks

Affected files/functions: `tsconfig.app.json`, `package.json`, CI workflow, `src/services/preferences.ts`

Problem: TypeScript strict mode is enabled, but `noUnusedLocals`/`noUnusedParameters` are not. This lets dead exports such as the classroom-only preference helpers linger after UI changes, and the repo has no ESLint/Prettier script to catch unused imports, accessibility lint issues, or style drift.

Fix prompt: Add a lightweight lint step. Start by enabling TypeScript `noUnusedLocals` and `noUnusedParameters` if the current codebase can pass, or add ESLint with React/TypeScript/accessibility rules if broader checks are desired. Wire `npm run lint` into CI. As a first cleanup, either use or remove `loadClassroomOnly`, `saveClassroomOnly`, and `CLASSROOM_ONLY_KEY` depending on the classroom-safe filtering decision.

#### 11. Title: Replace native confirm/alert flows with app-native notices over time

Affected files/functions: `src/App.tsx` shared import flow, `src/components/DeckEditor.tsx` delete deck/share fallback, `src/components/HistoryScreen.tsx` clear history

Problem: Native dialogs are simple and safe, but they are blocking, inconsistently styled, less testable, and can feel abrupt on mobile. The rest of Tilted uses friendly in-app notices and panels, so confirm/alert flows now stand out.

Fix prompt: Introduce a small reusable confirmation/notice component or local modal pattern. Migrate shared-deck import, delete deck, clear history, and share fallback messages one at a time. Preserve keyboard focus management and add tests for confirm/cancel behavior. Avoid changing the active in-round controls until the dialog pattern is stable.

#### 12. Title: Centralize duplicated security-header definitions

Affected files/functions: `deploy/nginx.conf`, `public/_headers`, `vercel.json`, `scripts/verify-static.mjs`, `scripts/check-production.mjs`

Problem: CSP, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options`, and `X-Frame-Options` are repeated across Nginx, static headers, Vercel, and verification scripts. The current values match well, but every future header change requires several manual edits.

Fix prompt: Add a small script or JSON source of truth for security headers, then generate or validate `public/_headers` and `vercel.json` from it. For Nginx, either generate the `add_header` block or make `verify-static.mjs` compare exact values against the shared source. Keep local static verification strict so drift is caught before deployment.

#### 13. Title: Decide whether deck metadata fields should be surfaced or removed

Affected files/functions: `src/types.ts` (`Deck.subject`, `Deck.ageRange`, `Deck.tags`, `Deck.classroomSafe`), `src/data/builtInDecks.ts`, `src/components/DeckSelectScreen.tsx`

Problem: `tags` participate in search, but `subject` and `ageRange` are only set on a few educational decks and are not displayed or searchable. `classroomSafe` is also currently not applied by the selector. These fields are harmless, but they create uncertainty about whether metadata is product-facing, future-facing, or stale.

Fix prompt: After resolving classroom-safe filtering, choose a metadata policy. If metadata is product-facing, include `subject` and `ageRange` in deck search and display small labels on educational deck cards. If not, remove the unused fields from `Deck` and built-in seed data. Add a built-in deck test that asserts whichever policy is chosen.

## Quick Wins

- Update the production proxy/CDN rule for `/sw.js` and rerun `npm run audit:production`.
- Restore the classroom-safe toggle or remove the README claim and unused preference helpers.
- Add a batch undo or confirmation for `DeckEditor.bulkDelete`.
- Add one test for malformed `#deck=` URLs before refactoring shared imports.
- Render `PwaBanner` on non-game screens so update/offline/storage notices are not home-only.
- Add duplicate-team-name validation to `TeamSetupScreen`.
- Enable an unused-code check or add a lint script before the codebase grows further.
- Add a first browser smoke test for "Quick Round -> Tilt Off -> Start -> Correct -> Results."

## Redundancy Removal Log

- Confirmed duplicate/stale feature surface: `README.md` advertises classroom-safe filtering, while `DeckSelectScreen` does not implement it and `DeckSelectScreen.test.tsx` asserts the checkbox is absent.
- Confirmed unused preference helpers: `CLASSROOM_ONLY_KEY`, `loadClassroomOnly`, and `saveClassroomOnly` are only referenced inside `src/services/preferences.ts`.
- Confirmed metadata ambiguity: `Deck.subject` and `Deck.ageRange` exist in the type and seed data but are not surfaced in deck selection or round setup.
- Confirmed intentional duplication with drift risk: security headers are repeated across Nginx, static-host headers, Vercel config, and verification scripts.
- Confirmed complexity concentration: `App.tsx` and `DeckEditor.tsx` are the largest files and own many unrelated workflows; future redundancy should be removed by extracting hooks/components rather than by broad rewrites.
- Confirmed no tracked `.DS_Store`, `dist`, `node_modules`, or `*.tsbuildinfo` files; they are ignored by `.gitignore`/`.dockerignore` and do not need repository cleanup.

## Review Dimension Notes

- Correctness and bugs: No current game-breaking defect found in local validation. Main correctness concerns are feature drift in classroom-safe filtering, silent shared-link failures, duplicate team-name UX, and shallow history validation.
- Redundancy and dead code: Classroom-only preference helpers are currently unused. Header policy and large component state logic are repeated or concentrated enough to deserve cleanup.
- Refactoring: `App.tsx` and `DeckEditor.tsx` are the primary refactor targets. Refactor in behavior-preserving slices because both files coordinate user-facing workflows.
- Performance: Current bundle size is modest for this app, built-in decks are static, and imports are size-limited. No urgent runtime performance issue was found.
- Patterns and conventions: The repo consistently uses typed React components and service wrappers for storage. Native dialogs are the main pattern outlier.
- Security: No backend/API/cookies/auth surface, no `dangerouslySetInnerHTML`, no `eval`, no analytics/tracking, and npm audits report 0 vulnerabilities. Shared deck fragments still expose full deck content to recipients, which is documented and warned in UI.
- Maintainability and readability: The codebase is approachable, but the absence of lint/unused checks and the size of `App.tsx`/`DeckEditor.tsx` will matter as features continue.
- Feature logic and UX: Motion fallback, keyboard/touch controls, privacy-first saved history, and custom-deck validation are strong. Classroom-safe filtering and PWA status visibility are the biggest UX gaps.
- Over-engineering: No major over-engineering found. The bigger risk is under-extraction in stateful screens rather than too many abstractions.

## Validation Snapshot

- `git status --short --branch`: clean `main...origin/main` at start.
- `npm run typecheck`: passed.
- `npm test -- --run`: passed, 16 files and 54 tests.
- `npm run build`: passed; Vite built 52 modules and stamped `dist/sw.js` cache `204bed1859c1`.
- `npm run verify:static`: passed.
- `npm audit --omit=dev --audit-level=moderate`: 0 vulnerabilities.
- `npm audit`: 0 vulnerabilities.
- `docker compose config`: passed.
- `npm run audit:production`: failed with current live `/sw.js` cache `max-age=14400`; warned that HSTS preload should be confirmed.
