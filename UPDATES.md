# Updates

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
