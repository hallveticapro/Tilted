# Measurable Plan to Resolve `TILTED_CODE_REVIEW.md`

## Objective

Resolve every action item in `TILTED_CODE_REVIEW.md` with measurable, inspectable acceptance criteria. This plan assumes the classroom-safe filter should be restored, deck metadata should become product-facing, and work should be delivered in small PR-sized slices.

## Measurement Rules

Every work item below is complete only when its listed evidence exists. When evidence cannot be produced, split that work item again before claiming it is done.

- File evidence means the named file contains the described code, copy, or config and can be verified with `rg`, `sed`, or direct inspection.
- Test evidence means the named automated test exists and fails without the intended behavior.
- Command evidence means the command exits 0 and its relevant output is recorded in `UPDATES.md` when the item changes product behavior, deployment behavior, test coverage, or developer workflow.
- Production evidence means a live HTTP response, GitHub Actions run, or deployment note proves the external state. Repository changes alone are not enough for production-only items.
- Search evidence means `rg` returns the expected matches or no matches, as stated.

## Baseline Evidence Before Implementation

Required before the first implementation PR:

- [x] Branch evidence: `git branch --show-current` prints a non-`main` branch name with the `codex/` prefix.
- [x] Worktree evidence: `git status --short` is recorded before app-code changes, and every uncommitted file is listed by path with a status of `included in this plan` or `pre-existing and intentionally untouched`.
- [x] Baseline type evidence: `npm run typecheck` exits 0.
- [x] Baseline unit evidence: `npm test -- --run` exits 0.
- [x] Baseline build evidence: `npm run build` exits 0 and prints a stamped service-worker cache.
- [x] Baseline static evidence: `npm run verify:static` exits 0.
- [x] Baseline deployment evidence: `npm run audit:production` output is recorded in `UPDATES.md`, whether pass or fail.

## Item 1A: Verify Repository `/sw.js` Cache Policy

Source review item: P1-1.

Why split: The repository policy and live proxy/CDN behavior are independently measurable. Repository policy can pass while production still fails.

Affected files:

- `deploy/nginx.conf`
- `public/_headers`
- `vercel.json`
- `scripts/verify-static.mjs`

Implementation steps:

- [x] Confirm or update `deploy/nginx.conf` so the exact `/sw.js` location is cache-revalidation oriented.
- [x] Confirm or update `public/_headers` so `/sw.js` emits `Cache-Control: no-cache, must-revalidate`.
- [x] Confirm or update `vercel.json` so `/sw.js` emits `Cache-Control: no-cache, must-revalidate`.
- [x] Ensure `scripts/verify-static.mjs` checks the generated static policy for `/sw.js`.

Measurable acceptance:

- [x] `rg -n "location = /sw\\.js|expires -1" deploy/nginx.conf` shows both the exact location and no-cache behavior.
- [x] `rg -n "/sw\\.js|Cache-Control: no-cache, must-revalidate" public/_headers` shows both the route and header.
- [x] `rg -n "\"source\": \"/sw\\.js\"|\"Cache-Control\", \"value\": \"no-cache, must-revalidate\"" vercel.json` shows both the route and header.
- [x] `npm run build` exits 0.
- [x] `npm run verify:static` exits 0.

## Item 1B: Fix Live Production `/sw.js` Cache Policy

Source review item: P1-1.

Why split: This may require Cloudflare, reverse-proxy, static-host, or server access outside the repository. It is still measurable through live HTTP headers.

Affected systems:

- Production CDN/reverse proxy/static host for `https://tilted.mrhallsclass.com/sw.js`
- `scripts/check-production.mjs`
- `UPDATES.md`

Implementation steps:

- [ ] Change the external production rule that currently serves `/sw.js` with `Cache-Control: max-age=14400`.
- [ ] Rerun the production audit after the external change.
- [x] Record the production audit command, result, and date in `UPDATES.md`.

Measurable acceptance:

- [ ] `curl -fsSI https://tilted.mrhallsclass.com/sw.js` output contains `Cache-Control` with `no-cache`, `no-store`, `must-revalidate`, or `max-age=0`.
- [ ] The same `curl -fsSI` output does not contain nonzero `max-age`.
- [ ] `npm run audit:production` exits 0.
- [x] `UPDATES.md` contains the exact date, command, and observed `/sw.js` `Cache-Control` value.

## Item 1C: Decide and Verify Production HSTS Preload Policy

Source review item: P1-1.

Why split: HSTS preload is a domain-owner decision, not an app-code decision.

Affected systems/files:

- Production TLS/reverse proxy for `https://tilted.mrhallsclass.com`
- `README.md`
- `UPDATES.md`

Implementation steps:

- [ ] Obtain a domain-owner decision for whether `includeSubDomains; preload` is approved for all `mrhallsclass.com` subdomains.
- [ ] If approved, document the approval.
- [ ] If not approved, change the production TLS/reverse-proxy HSTS header and document the new policy.

Measurable acceptance:

- [x] `curl -fsSI https://tilted.mrhallsclass.com/` output is saved or summarized in `UPDATES.md`.
- [ ] `UPDATES.md` explicitly states either `HSTS preload approved by domain owner` or `HSTS preload removed/changed`.
- [ ] If preload remains, `README.md` contains a note that the domain owner has confirmed all relevant subdomains are HTTPS-ready.
- [ ] If preload is removed, `curl -fsSI https://tilted.mrhallsclass.com/` no longer contains `preload`.

## Item 2: Restore Classroom-Safe Filtering

Source review item: P1-2.

Affected files:

- `src/App.tsx`
- `src/components/DeckSelectScreen.tsx`
- `src/components/DeckSelectScreen.test.tsx`
- `src/services/preferences.ts`
- `src/services/preferences.test.ts`
- `src/data/builtInDecks.ts`
- `README.md`

Implementation steps:

- [x] Add `classroomOnly` state in `App.tsx`, initialized with `loadClassroomOnly()`.
- [x] Persist toggle changes with `saveClassroomOnly()`.
- [x] Pass `classroomOnly` and `onClassroomOnlyChange` to `DeckSelectScreen`.
- [x] Render a checkbox or switch with accessible name `Classroom-safe decks only`.
- [x] Filter built-in deck cards, `Surprise Me`, and `Play Mixed Category` candidates through `deck.classroomSafe !== false` when enabled.
- [x] Keep custom decks visible when classroom-safe filtering is enabled.
- [x] Update README copy to match actual behavior.

Measurable acceptance:

- [x] `rg -n "loadClassroomOnly|saveClassroomOnly|classroomOnly" src/App.tsx` shows state initialization and persistence.
- [x] `rg -n "Classroom-safe decks only|classroomSafe" src/components/DeckSelectScreen.tsx` shows the UI control and filter logic.
- [x] `src/components/DeckSelectScreen.test.tsx` includes a test that enables the toggle and verifies at least one `classroomSafe: false` built-in deck is hidden.
- [x] `src/components/DeckSelectScreen.test.tsx` includes a test proving `Surprise Me` or mixed-category selection cannot receive a hidden built-in deck while the toggle is enabled.
- [x] `src/components/DeckSelectScreen.test.tsx` includes a test proving a custom deck remains visible while the classroom-safe toggle is enabled.
- [x] `src/services/preferences.test.ts` includes load/save coverage for `CLASSROOM_ONLY_KEY`.
- [x] `README.md` contains classroom-safe filtering copy that matches the implemented toggle label.
- [x] `npm test -- --run src/components/DeckSelectScreen.test.tsx src/services/preferences.test.ts` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 3: Add Bulk Card Deletion Protection

Source review item: P1-3.

Affected files:

- `src/components/DeckEditor.tsx`
- `src/components/DeckEditor.test.tsx`

Implementation steps:

- [x] Replace single-card-only undo state with a deletion undo model that supports one or many cards.
- [x] Store deleted cards with `deckId`, original indexes, and card payloads.
- [x] Update single-card delete and bulk delete to use the same undo path.
- [x] Show a notice with the exact deleted count.
- [x] Restore deleted cards in original order when Undo is clicked.
- [x] Clear stale undo state when switching decks or replacing the library.

Measurable acceptance:

- [x] `src/components/DeckEditor.test.tsx` includes a test that deletes one card and restores it with Undo.
- [x] `src/components/DeckEditor.test.tsx` includes a test that bulk-deletes at least two selected cards and restores both with Undo in their original order.
- [x] `src/components/DeckEditor.test.tsx` includes a test that attempting to delete every card leaves at least one card and shows `Keep at least one card in the deck.`
- [x] `src/components/DeckEditor.test.tsx` includes or preserves a test proving Undo does not restore into a different deck.
- [x] `rg -n "Deleted [^\\n]*cards|Undo" src/components/DeckEditor.tsx` shows user-visible batch undo copy.
- [x] `npm test -- --run src/components/DeckEditor.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 4: Show Recoverable Shared-Link Import Errors

Source review item: P2-4.

Affected files:

- `src/services/deckSharing.ts`
- `src/App.tsx`
- `src/App.test.tsx`
- `src/services/deckStorage.ts`

Implementation steps:

- [x] Replace `readSharedDeckFromLocation(): Deck | null` with a discriminated result.
- [x] Preserve specific deck import errors for malformed JSON, schema validation failure, and size-limit failure.
- [x] Replace shared-import `window.confirm` and `window.alert` with app-native UI.
- [x] Provide visible Import and Dismiss actions for valid shared decks.
- [x] Provide visible error copy for malformed or oversized shared deck links.
- [x] Clear `#deck=` after successful import or explicit dismissal.

Measurable acceptance:

- [x] `src/services/deckSharing.ts` exports a result type or function result with exact statuses `none`, `ok`, and `error`.
- [x] `rg -n "window\\.confirm|window\\.alert" src/App.tsx` returns no matches.
- [x] `src/App.test.tsx` includes a valid shared-link import test that verifies the imported deck reaches the editor or custom deck state.
- [x] `src/App.test.tsx` includes a malformed shared-link test that verifies visible error copy.
- [x] `src/App.test.tsx` includes an oversized shared-link test or direct service test that verifies the size-limit error is surfaced.
- [x] `src/App.test.tsx` includes a dismiss test proving the URL hash is cleared after explicit dismissal.
- [x] `npm test -- --run src/App.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 5: Surface PWA and Storage Status on Non-Game Screens

Source review item: P2-5.

Affected files:

- `src/App.tsx`
- `src/components/PwaBanner.tsx`
- `src/components/PwaBanner.test.tsx`
- `src/App.test.tsx`

Implementation steps:

- [x] Render `PwaBanner` from a single app-level location.
- [x] Include non-game screens: `home`, `decks`, `setup`, `editor`, `history`, `how-to-play`, `team-setup`, `team-turn`, `team-results`, and `motion-test`.
- [x] Exclude gameplay/pre-game screens: `game`, `countdown`, `forehead-setup`, and `landscape-gate`.
- [x] Preserve current PWA banner priority ordering.

Measurable acceptance:

- [x] `src/App.test.tsx` includes a test that a storage/offline/update/install banner appears on a non-home screen.
- [x] `src/App.test.tsx` includes a test that the banner is absent on the active `game` screen.
- [x] `src/components/PwaBanner.test.tsx` still verifies banner priority order.
- [x] `rg -n "<PwaBanner" src/App.tsx | wc -l` prints `1`.
- [x] `npm test -- --run src/components/PwaBanner.test.tsx src/App.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 6A: Validate Duplicate Team Display Names

Source review item: P2-8.

Affected files:

- `src/components/TeamSetupScreen.tsx`
- `src/services/teamSession.ts`
- `src/services/teamSession.test.ts`
- `src/App.test.tsx`

Implementation steps:

- [x] Trim names before validation.
- [x] Detect duplicate team names case-insensitively.
- [x] Show visible warning copy when duplicates exist.
- [x] Disable `Choose a Deck` until at least two non-blank unique names exist.
- [x] Preserve ID-based score calculation.

Measurable acceptance:

- [x] `src/App.test.tsx` or a new `TeamSetupScreen` test includes duplicate names such as `Red` and ` red ` and verifies `Choose a Deck` is disabled.
- [x] The same test verifies visible duplicate-name warning copy.
- [x] A test verifies two unique trimmed names enable `Choose a Deck`.
- [x] `src/services/teamSession.test.ts` preserves or adds a test proving duplicate display names do not merge scores at the service level.
- [x] `npm test -- --run src/services/teamSession.test.ts src/App.test.tsx` exits 0, or the command includes the new component test file if created.
- [x] `npm run typecheck` exits 0.

## Item 6B: Preserve Player Fallback and Rotation Behavior

Source review item: P2-8.

Why split: Duplicate team-name validation and player rotation are related but independently measurable.

Affected files:

- `src/services/teamSession.ts`
- `src/services/teamSession.test.ts`
- `src/components/TeamSetupScreen.tsx`

Implementation steps:

- [x] Keep current behavior where a team with no roster uses the team name as the active player.
- [x] Keep current behavior where optional players rotate per team turn.
- [x] Ensure UI validation does not strip valid comma-separated player names.

Measurable acceptance:

- [x] `src/services/teamSession.test.ts` includes a no-roster fallback test proving `getActivePlayer(session)` returns the team name.
- [x] `src/services/teamSession.test.ts` includes or preserves a multi-player rotation test.
- [x] A UI test verifies comma-separated players are accepted when team names are unique.
- [x] `npm test -- --run src/services/teamSession.test.ts` exits 0.

## Item 7: Harden Round-History Loading

Source review item: P2-9.

Affected files:

- `src/services/roundHistory.ts`
- `src/services/roundHistory.test.ts`
- `src/types.ts`

Implementation steps:

- [x] Add an internal validator for stored history card payloads.
- [x] Add an internal validator for stored outcome payloads.
- [x] Rebuild or drop malformed `outcomes`, `correctCards`, and `passedCards`.
- [x] Preserve team/player identifier stripping.
- [x] Rewrite sanitized history to LocalStorage when malformed or stale fields are removed.

Measurable acceptance:

- [x] `src/services/roundHistory.test.ts` includes a malformed `correctCards` or `passedCards` test with a non-string prompt and proves the malformed card is not returned.
- [x] `src/services/roundHistory.test.ts` includes a malformed `outcomes` test and proves invalid outcomes are not returned.
- [x] `src/services/roundHistory.test.ts` includes or preserves a legacy team/player-name sanitization test.
- [x] `src/services/roundHistory.test.ts` verifies LocalStorage is rewritten after malformed data is sanitized.
- [x] `npm test -- --run src/services/roundHistory.test.ts` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 8A: Make Deck Metadata Searchable

Source review item: P3-13.

Why split: Searchability and visual display are independently measurable and may be implemented separately.

Affected files:

- `src/types.ts`
- `src/data/builtInDecks.ts`
- `src/data/builtInDecks.test.ts`
- `src/components/DeckSelectScreen.tsx`
- `src/components/DeckSelectScreen.test.tsx`

Implementation steps:

- [x] Include `subject` and `ageRange` in deck search text.
- [x] Keep `tags` in search text.
- [x] Keep metadata optional for custom decks.

Measurable acceptance:

- [x] `src/components/DeckSelectScreen.test.tsx` includes a search test where a deck is found by `subject`.
- [x] `src/components/DeckSelectScreen.test.tsx` includes a search test where a deck is found by `ageRange`.
- [x] Existing tag-based search behavior still works.
- [x] `npm test -- --run src/components/DeckSelectScreen.test.tsx` exits 0.

## Item 8B: Display Compact Deck Metadata Labels

Source review item: P3-13.

Affected files:

- `src/components/DeckSelectScreen.tsx`
- `src/components/DeckSelectScreen.test.tsx`
- `src/styles/global.css`

Implementation steps:

- [x] Display `subject` and `ageRange` labels when present.
- [x] Display a `Classroom safe` label when `classroomSafe === true`.
- [x] Add CSS for metadata labels under a `.deck-card__metadata` selector using `display: flex`, `flex-wrap: wrap`, and `gap`.

Measurable acceptance:

- [x] `src/components/DeckSelectScreen.test.tsx` verifies an educational deck card renders its subject label.
- [x] `src/components/DeckSelectScreen.test.tsx` verifies an educational deck card renders its age-range label.
- [x] `src/components/DeckSelectScreen.test.tsx` verifies a classroom-safe deck renders `Classroom safe`.
- [x] `rg -n "\\.deck-card__metadata|display: flex|flex-wrap: wrap|gap:" src/styles/global.css` shows the metadata-label selector and all required layout properties.
- [x] `npm test -- --run src/components/DeckSelectScreen.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 9A: Add Playwright Tooling

Source review item: P2-7.

Why split: Tooling and actual smoke scenarios have different evidence.

Affected files:

- `package.json`
- `package-lock.json`
- `playwright.config.ts`
- `.gitignore`
- `.github/workflows/ci.yml`

Implementation steps:

- [x] Add Playwright test dependencies.
- [x] Add `test:e2e` script.
- [x] Omit `test:e2e:ui` from `package.json` and `README.md`.
- [x] Configure Playwright `webServer.command` to run a concrete npm command from `package.json`.
- [x] Add Playwright transient outputs to `.gitignore`.
- [x] Add CI execution for `npm run test:e2e`.

Measurable acceptance:

- [x] `package.json` contains `test:e2e`.
- [x] `playwright.config.ts` exists and defines `webServer`.
- [x] `.github/workflows/ci.yml` runs `npm run test:e2e`.
- [x] `.gitignore` contains ignore entries for `playwright-report/` and `test-results/`.
- [x] `rg -n "test:e2e:ui" package.json README.md` returns no matches.
- [x] `npm run test:e2e -- --list` exits 0 after browsers are installed.

## Item 9B: Add Browser Smoke Scenarios

Source review item: P2-7.

Affected files:

- new `tests/e2e/*.spec.ts`
- `README.md`

Implementation steps:

- [x] Add a quick-round smoke test.
- [x] Add a team-game handoff smoke test.
- [x] Add a custom-deck create/add-card smoke test.
- [x] Add valid shared-link import smoke coverage.
- [x] Add invalid shared-link error smoke coverage.
- [x] Add a mobile landscape viewport smoke test for the game screen.
- [x] Document the e2e command and browser install requirement in README.

Measurable acceptance:

- [x] `rg -n "Quick Round|Tilt Off|Correct|Round Complete" tests e2e` finds a quick-round test.
- [x] `rg -n "Team Game|Choose a Deck|turn" tests e2e` finds a team handoff test.
- [x] `rg -n "custom deck|New Deck|Add Card|Manage Decks" tests e2e` finds a custom-deck test.
- [x] `rg -n "#deck=|shared deck|Import" tests e2e` finds shared-link tests for valid and invalid cases.
- [x] `rg -n "viewport|landscape|390|844|mobile" tests e2e` finds viewport coverage.
- [x] `README.md` documents `npm run test:e2e`.
- [x] `npm run test:e2e` exits 0.

## Item 10A: Add Lint and Unused-Code Tooling

Source review item: P3-10.

Affected files:

- `package.json`
- `package-lock.json`
- `tsconfig.app.json`
- `eslint.config.js`
- `.github/workflows/ci.yml`

Implementation steps:

- [x] Add a `lint` script.
- [x] Add TypeScript/React/React Hooks lint coverage.
- [x] Add JSX accessibility lint coverage with an inspectable ESLint rule/plugin entry.
- [x] Add unused import/variable coverage.
- [x] Add lint to CI before build.

Measurable acceptance:

- [x] `package.json` contains a `lint` script.
- [x] `npm run lint` exits 0.
- [x] `.github/workflows/ci.yml` runs `npm run lint`.
- [x] ESLint config contains JSX accessibility coverage, verified with `rg -n "jsx-a11y|accessibility" .eslintrc* eslint.config.* package.json`.
- [x] ESLint config contains an unused-code rule name, verified with `rg -n "no-unused-vars|unused-imports|@typescript-eslint/no-unused-vars" .eslintrc* eslint.config.* package.json`.
- [x] `UPDATES.md` or PR notes record a negative lint check where a temporary unused local variable caused `npm run lint` to fail.
- [x] `npm run typecheck` exits 0 after lint tooling is added.

## Item 10B: Remove or Activate Dead Classroom-Only Helpers

Source review item: P3-10 and P1-2.

Why split: Dead-code cleanup is measurable only after the classroom-safe product decision is implemented.

Affected files:

- `src/services/preferences.ts`
- `src/services/preferences.test.ts`
- `src/App.tsx`
- `src/components/DeckSelectScreen.tsx`

Implementation steps:

- [x] If classroom-safe filtering is restored, ensure helpers are actively imported and used.
- [x] If classroom-safe filtering is removed, delete `CLASSROOM_ONLY_KEY`, `loadClassroomOnly`, and `saveClassroomOnly`.

Measurable acceptance:

- [x] Exactly one of these is true:
  - `rg -n "loadClassroomOnly|saveClassroomOnly" src/App.tsx src/components src/services/preferences.test.ts` shows active usage and tests.
  - `rg -n "CLASSROOM_ONLY_KEY|loadClassroomOnly|saveClassroomOnly" src` returns no matches.
- [x] `npm run lint` exits 0.
- [x] `npm test -- --run src/services/preferences.test.ts` exits 0.

## Item 11A: Extract `DeckEditor` State and Persistence

Source review item: P2-6.

Why split: Extracting state/persistence is measurable independently from extracting UI components.

Affected files:

- `src/components/DeckEditor.tsx`
- new `src/components/deck-editor/useDeckWorkshop.ts`
- `src/components/DeckEditor.test.tsx`

Implementation steps:

- [x] Move working deck state, selected deck state, deferred persistence, flush behavior, recovery state, error state, and delete undo state into a typed hook.
- [x] Keep `DeckEditor` public props unchanged.
- [x] Preserve deferred validation behavior with tests for blocked invalid edits and successful valid edits after persistence flush.

Measurable acceptance:

- [x] `src/components/deck-editor/useDeckWorkshop.ts` exists and exports a typed hook for deck workshop state.
- [x] `DeckEditor.tsx` imports and uses the hook.
- [x] `test "$(wc -l < src/components/DeckEditor.tsx)" -le 504` exits 0, proving at least 20% reduction from the 630-line baseline.
- [x] `npm test -- --run src/components/DeckEditor.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 11B: Extract `DeckEditor` Presentational Sections

Source review item: P2-6.

Affected files:

- `src/components/DeckEditor.tsx`
- new `src/components/deck-editor/*`
- `src/components/DeckEditor.test.tsx`

Implementation steps:

- [x] Extract starter/sidebar browsing.
- [x] Extract deck metadata/actions panel.
- [x] Extract card editor list and pagination.
- [x] Extract import panels.

Measurable acceptance:

- [x] At least four files exist under `src/components/deck-editor/`.
- [x] `rg -n "Import JSON|Import CSV|Import from link" src/components/DeckEditor.tsx` returns no matches.
- [x] `rg -n "Card [0-9]|card-row|starter" src/components/DeckEditor.tsx` returns no matches for extracted card-row and starter-sidebar JSX.
- [x] Existing DeckEditor tests pass without snapshot-only assertions.
- [x] `npm test -- --run src/components/DeckEditor.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 12A: Extract Pure App Flow Transitions

Source review item: P2-6.

Why split: Pure transition extraction and React integration are separate and measurable.

Affected files:

- `src/App.tsx`
- new `src/services/appFlow.ts`
- `src/App.test.tsx`
- new `src/services/appFlow.test.ts`

Implementation steps:

- [x] Move pure screen transition logic into a reducer exported from `src/services/appFlow.ts`.
- [x] Keep side effects such as motion permission, wake lock, fullscreen, audio, and LocalStorage outside pure transition logic.
- [x] Add focused unit tests for transition behavior in `src/services/appFlow.test.ts`.

Measurable acceptance:

- [x] `src/services/appFlow.ts` exists and exports a typed reducer.
- [x] Search evidence shows side-effect APIs are not called inside the pure reducer/helper: `rg -n "localStorage|navigator|document\\.|window\\.|primeAudio|roundDisplay|motion\\." src/services/appFlow.ts` returns no matches.
- [x] Tests cover quick-round start, landscape-gate cancel/resolve, round end, and team next-round transitions.
- [x] `npm test -- --run src/App.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 12B: Reduce `App.tsx` Coordination Load

Source review item: P2-6.

Affected files:

- `src/App.tsx`
- extracted flow/hook files

Implementation steps:

- [x] Replace ad hoc transition-heavy handlers with dispatches to named reducer events.
- [x] Keep storage-backed state in `App.tsx`.
- [x] Add or preserve App tests that prove home, deck selection, setup, game, results, history, editor, and team-flow screens still render from their primary user actions.

Measurable acceptance:

- [x] `test "$(wc -l < src/App.tsx)" -le 419` exits 0, proving at least 15% reduction from the 494-line baseline.
- [x] `npm test -- --run src/App.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.
- [x] `npm test -- --run` exits 0 after both App-flow items are complete.

## Item 13A: Add Accessible App-Native Confirmation Component

Source review item: P3-11.

Why split: Component creation can be measured before all call sites are migrated.

Affected files:

- new `src/components/ConfirmDialog.tsx`
- new `src/components/ConfirmDialog.test.tsx`
- `src/styles/global.css`

Implementation steps:

- [x] Create reusable confirmation component `src/components/ConfirmDialog.tsx`.
- [x] Implement accessible role/name semantics.
- [x] Manage initial focus, Escape handling, and focus restoration.
- [x] Add styles consistent with existing panels/modals.

Measurable acceptance:

- [x] `src/components/ConfirmDialog.test.tsx` verifies role `dialog` or `alertdialog` and accessible name.
- [x] `src/components/ConfirmDialog.test.tsx` verifies confirm and cancel callbacks.
- [x] `src/components/ConfirmDialog.test.tsx` verifies Escape dismisses when enabled.
- [x] `src/components/ConfirmDialog.test.tsx` verifies focus moves into the dialog and returns after close.
- [x] `npm test -- --run src/components/ConfirmDialog.test.tsx` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 13B: Remove Native Confirm/Alert Call Sites

Source review item: P3-11.

Affected files:

- `src/App.tsx`
- `src/components/DeckEditor.tsx`
- `src/components/HistoryScreen.tsx`
- confirmation component tests
- affected screen tests

Implementation steps:

- [x] Migrate shared-deck import confirmation and error display.
- [x] Migrate deck-delete confirmation.
- [x] Migrate clear-history confirmation.
- [x] Keep destructive actions guarded.

Measurable acceptance:

- [x] `rg -n "window\\.confirm|window\\.alert" src` returns no matches.
- [x] A test verifies canceling deck deletion leaves the deck intact.
- [x] A test verifies canceling clear history leaves history intact.
- [x] A test verifies dismissing shared import does not import the deck.
- [x] `npm test -- --run` exits 0.
- [x] `npm run typecheck` exits 0.

## Item 14A: Define Security Header Source of Truth

Source review item: P3-12.

Why split: Defining the source and enforcing generated/validated consumers are separate.

Affected files:

- new `config/security-headers.json`
- `scripts/verify-static.mjs`

Implementation steps:

- [x] Create a single machine-readable source for header names and exact values.
- [x] Include CSP, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options`, and `X-Frame-Options`.
- [x] Update verification code to read from that source.

Measurable acceptance:

- [x] A single source file exists and contains all five security headers.
- [x] `scripts/verify-static.mjs` imports or reads that source instead of duplicating all five expected header values inline.
- [x] `npm run verify:static` exits 0.

## Item 14B: Enforce Header Drift Detection Across Hosts

Source review item: P3-12.

Affected files:

- `deploy/nginx.conf`
- `public/_headers`
- `vercel.json`
- `scripts/verify-static.mjs`
- `scripts/verify-static.mjs`

Implementation steps:

- [x] Validate exact header values for static-host, Vercel, and Nginx consumers against `config/security-headers.json`.
- [x] Keep cache-policy checks separate from security-header checks.
- [x] Ensure drift in any header consumer fails `npm run verify:static`.

Measurable acceptance:

- [x] `npm run verify:static` validates exact values for `deploy/nginx.conf`, `dist/_headers`, and `vercel.json`.
- [x] Temporarily changing one header value in a local uncommitted edit causes `npm run verify:static` to fail; record this manual negative-check result in `UPDATES.md` or the implementation PR notes.
- [x] `npm run build` exits 0.
- [x] `npm run verify:static` exits 0 after reverting the scratch edit.

## Item 15: Final Documentation and Release Verification

Source review items: all.

Affected files:

- `README.md`
- `AGENTS.md`
- `UPDATES.md`
- `PLAN.md`
- `TILTED_CODE_REVIEW.md`

Implementation steps:

- [x] Update README for every user-facing or developer-command change.
- [x] Update AGENTS if common commands, repo conventions, or validation expectations change.
- [x] Add dated implementation notes to UPDATES.
- [x] Run the full local verification suite.
- [ ] Run production verification after deployment/proxy work.

Measurable acceptance:

- [x] `README.md` documents classroom-safe filtering, metadata labels/search, `npm run lint`, and `npm run test:e2e` if implemented.
- [x] `AGENTS.md` lists any new required common commands.
- [x] `UPDATES.md` has a dated entry listing changed files and command results.
- [x] `npm run lint` exits 0.
- [x] `npm run typecheck` exits 0.
- [x] `npm test -- --run` exits 0.
- [x] `npm run build` exits 0.
- [x] `npm run verify:static` exits 0.
- [x] `npm audit --omit=dev --audit-level=moderate` exits 0.
- [x] `npm audit` exits 0.
- [x] `docker compose config` exits 0.
- [x] `npm run verify:container` exits 0.
- [x] `npm run test:e2e` exits 0.
- [ ] `npm run audit:production` exits 0 after external production changes are complete.

## Coverage Matrix

| Review item | Measurable plan item |
| --- | --- |
| P1-1 `/sw.js` cache drift | Items 1A and 1B |
| P1-1 HSTS preload warning | Item 1C |
| P1-2 classroom-safe filtering | Item 2 |
| P1-3 bulk card deletion protection | Item 3 |
| P2-4 shared deck import errors | Item 4 |
| P2-5 PWA banner visibility | Item 5 |
| P2-6 large stateful components | Items 11A, 11B, 12A, and 12B |
| P2-7 browser smoke tests | Items 9A and 9B |
| P2-8 duplicate team names | Items 6A and 6B |
| P2-9 history card validation | Item 7 |
| P3-10 unused-code/style checks | Items 10A and 10B |
| P3-11 native dialogs | Items 13A and 13B |
| P3-12 security-header duplication | Items 14A and 14B |
| P3-13 deck metadata | Items 8A and 8B |
| Final docs/release proof | Item 15 |

## Suggested PR Sequence

1. Item 1A plus repository documentation updates.
2. Items 1B and 1C after production access is available.
3. Items 2, 8A, and 8B together because classroom-safe filtering and metadata overlap.
4. Item 3.
5. Item 4, or Items 13A and 13B first if the confirmation component should precede shared-import UI.
6. Items 5, 6A, 6B, and 7.
7. Items 9A and 9B.
8. Items 10A and 10B.
9. Items 11A and 11B.
10. Items 12A and 12B.
11. Items 14A and 14B.
12. Item 15.

## Completion Audit Checklist

Before claiming the plan is complete:

- [ ] Every measurable acceptance checkbox above is checked with direct evidence.
- [ ] Every command listed in Item 15 exits 0, including `npm run audit:production`.
- [x] `rg -n "window\\.confirm|window\\.alert" src` returns no matches.
- [x] `rg -n "CLASSROOM_ONLY_KEY|loadClassroomOnly|saveClassroomOnly" src` either shows active app usage and tests or no matches at all.
- [x] `TILTED_CODE_REVIEW.md`, `PLAN.md`, `README.md`, `AGENTS.md`, and `UPDATES.md` agree on supported features and validation commands.
- [ ] The final `UPDATES.md` entry records all substantive files changed and command results.
