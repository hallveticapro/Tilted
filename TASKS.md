# TASKS.md

## Project

- Project name: Tilted
- Production URL: https://tilted.mrhallsclass.com
- App type: classroom web app
- Intended users: infer from the repository, README, route structure, UI copy, and prior project context available to Codex
- Deployment environment: infer from the repository; if Docker, GHCR, Unraid, compose, reverse proxy, or other self-hosted deployment files exist, audit and document them

## Source of Truth

Codex may have prior context from building this app, but do not rely on memory alone.

Build the audit from repository evidence.

Before writing audit files, read:

1. `README.md`, if it exists
2. existing `AGENTS.md`, if it exists
3. existing `UPDATES.md`, if it exists
4. existing `TASKS.md`
5. package/build/test config
6. app source code
7. server/API code, if present
8. Docker, compose, deployment, and GitHub Actions files, if present
9. public/static/PWA files, if present
10. prior audit or planning files, if present

If prior Codex context conflicts with repository evidence, trust the repository and document the mismatch.

## Main Objective

Perform a full repository audit for Tilted and create durable project documentation for future development.

Required deliverables:

1. `AGENTS.md`
2. `AUDIT-[CURRENT-DATE].md`
3. `UPDATES.md`

Determine the current date with:

```bash
date +%F
```

Use the actual date in the audit filename.

Example:

```text
AUDIT-2026-06-04.md
```

Do not create a file literally named `AUDIT-[CURRENT-DATE].md`.

## Audit Rules

This is an audit and documentation pass, not an implementation pass.

Do not:

- rewrite the app
- make broad refactors
- silently fix findings
- delete code unless it is clearly unused documentation junk
- add new dependencies unless absolutely necessary
- expose secrets, tokens, `.env` values, credentials, API keys, private keys, or sensitive configuration
- invent project behavior that is not supported by the repo

You may make small documentation-only changes required by this task.

If you notice a tiny typo in documentation, you may fix it, but do not make app-code changes unless absolutely necessary to complete the audit.

Document confirmed issues separately from hypotheses.

Use file paths, function names, component names, scripts, or config names as evidence whenever possible.

## Repository Discovery

Inspect the repo deeply.

Review files and areas such as:

- `README.md`
- `AGENTS.md`
- `UPDATES.md`
- `package.json`
- lockfiles
- TypeScript config
- Vite/Next/Astro/Svelte/Nuxt or other framework config
- ESLint/Prettier configs
- Tailwind/PostCSS configs
- test configs
- app routes/pages/components
- hooks/state management
- server/API routes
- auth/session code, if present
- database/storage code, if present
- browser storage usage
- import/export features, if present
- classroom/game/student-facing workflows, if present
- public/static assets
- PWA/service worker files, if present
- Dockerfile
- `.dockerignore`
- compose files
- GitHub Actions workflows
- deployment docs
- environment variable usage

Determine:

- project purpose
- package manager
- tech stack
- framework
- routing approach
- frontend architecture
- backend/API architecture, if any
- persistence/storage model
- environment variables
- build/test/lint commands
- deployment model
- Docker/GHCR status, if applicable
- reverse proxy or domain assumptions, if applicable
- classroom/privacy/security boundaries
- major user flows
- likely fragility points

## Validation Commands

Run the safest available verification commands discovered from the repo.

Prefer scripts from `package.json`.

Possible commands, only when appropriate:

```bash
npm run lint
npm run check
npm run typecheck
npm test
npm run test
npm run build
npm run validate
npm audit --omit=dev --audit-level=moderate
npm audit
```

Use the actual package manager based on lockfiles and package metadata.

If Docker exists, verify as much as possible:

```bash
docker build -t tilted-audit-verify .
docker compose config
docker compose build
```

If a local server or health endpoint exists, smoke test it.

If GitHub CLI is available and authenticated, inspect workflows:

```bash
gh workflow list
gh run list --limit 5
```

If commands fail, document:

- command
- result
- important output summary
- whether the failure appears pre-existing
- whether it blocks audit confidence

Do not hide failures.

## Security and Privacy Audit

Check for:

- secrets accidentally committed
- unsafe environment variable exposure
- use of `.env` values in client code
- XSS risks
- unsafe HTML rendering
- unsafe markdown rendering
- unsafe URL parsing
- unsafe import/export behavior
- unvalidated user input
- unsafe API routes
- overly broad CORS
- missing auth where needed
- insecure cookies/sessions, if applicable
- insecure localStorage/sessionStorage usage
- sensitive data in URLs
- excessive logging
- analytics/tracking
- student/classroom data exposure
- third-party scripts
- missing or weak security headers
- missing CSP
- dependency vulnerabilities
- deployment misconfiguration

If the app is student-facing or classroom-facing, pay special attention to:

- student names or identifiers
- classroom data
- teacher controls exposed to students
- projected display safety
- accidental sharing of private data
- whether student-facing views hide sensitive teacher-only information
- whether public URLs expose anything private

## Maintainability and Architecture Audit

Evaluate:

- project organization
- component boundaries
- naming consistency
- state management
- data model clarity
- separation of domain logic from UI
- duplication
- complexity hotspots
- error handling
- loading/empty/error states
- TypeScript strictness
- use of `any`
- validation strategy
- testability
- accessibility patterns
- responsive/mobile behavior
- comments/docs quality
- whether future agents can safely modify the code

Document fragile areas even if they currently work.

## Accessibility and Classroom UX Audit

Audit practical classroom usability.

Check for:

- keyboard accessibility
- focus states
- touch target sizes
- color contrast
- readable text on projector/smartboard
- reduced-motion support
- screen reader labels
- understandable errors
- reset/undo safety
- accidental destructive actions
- mobile/tablet usability
- Chromebook compatibility
- student misuse risk if projected
- teacher workflow clarity
- offline or poor-network behavior, if relevant

## Functionality Opportunity Analysis

Suggest improved functionality the app may be missing.

Do not implement suggestions during this audit.

For each suggestion, include:

- suggestion title
- problem it solves
- user value
- rough complexity: Low, Medium, or High
- privacy/security considerations
- recommended priority: Immediate, Next, or Later
- product/design decisions needed

Only suggest features grounded in the actual app.

Favor features that:

- reduce teacher workload
- improve classroom usability
- prevent data loss
- improve privacy/security
- improve accessibility
- improve reliability
- improve deployment/maintenance

Avoid fantasy enterprise bloat.

## Documentation Requirements

### AGENTS.md

Create or update `AGENTS.md`.

It should be concise, specific, and useful for future coding agents.

Include:

```md
# AGENTS.md

## Project Overview

## Tech Stack

## Repository Map

## Common Commands

## Environment Variables

## Development Conventions

## Testing and Validation

## Security and Privacy Notes

## Accessibility and Classroom UX Notes

## Deployment Notes

## Functionality Planning Notes

## Known Risks and Follow-Up Items

## Instructions for Future Agents
```

Requirements:

- do not duplicate the README unnecessarily
- do not include secrets
- mark commands as verified only if actually run
- document unknowns honestly
- keep future-agent instructions practical

### AUDIT-[CURRENT-DATE].md

Create a dated audit file at the repository root.

Use this structure:

```md
# Audit Report - [CURRENT-DATE]

## Project

- Name: Tilted
- Production URL: https://tilted.mrhallsclass.com
- Repository:
- Audit date: [CURRENT-DATE]
- Auditor: Codex
- Scope:

## Executive Summary

## What I Reviewed

## Validation Results

| Command | Result | Notes |
| ------- | ------ | ----- |

## Architecture Overview

## Strengths

## Findings

### Critical

### High

### Medium

### Low

## Functionality Opportunities

### Immediate Functionality Opportunities

### Next Functionality Opportunities

### Later Functionality Opportunities

## Dependency and Tooling Notes

## Accessibility Review

## Performance Review

## Security and Privacy Review

## Deployment Review

## Recommended Roadmap

### Immediate

### Next

### Later

## Suggested Future Tests

## Open Questions

## Final Notes
```

For findings, use IDs:

- `CRIT-001`
- `HIGH-001`
- `MED-001`
- `LOW-001`

For functionality suggestions, use IDs:

- `FUNC-001`
- `FUNC-002`
- `FUNC-003`

Each finding should include:

- severity
- category
- location
- evidence
- impact
- recommendation
- suggested priority

### UPDATES.md

Create or update `UPDATES.md`.

If it exists, append a dated entry. Do not erase previous entries.

Use:

```md
# Updates

## [CURRENT-DATE] - Initial repository audit and agent documentation

### Summary

### Files Created

### Files Updated

### Commands Run

| Command | Result | Notes |
| ------- | ------ | ----- |

### Changes Made

### Findings Documented But Not Fixed

### Functionality Ideas Documented

### Follow-Up Needed
```

Be factual. Do not include huge logs.

## Markdown Reference Organization

If the repo already contains historical audit files, old prompt briefs, old planning docs, or other markdown files that are clearly reference material, organize them into a `references/` folder.

Keep these files at root:

- `README.md`
- `AGENTS.md`
- `TASKS.md`
- `UPDATES.md`

Move only markdown files that are clearly historical/reference material, such as:

- old `AUDIT-*.md`
- old `POST_IMPLEMENTATION_AUDIT-*.md`
- old Codex prompt briefs
- old planning notes
- old implementation notes that are no longer active root docs

After moving files:

- update links/references if needed
- mention the `references/` folder in `AGENTS.md`
- document moves in `UPDATES.md`

Do not move files blindly if a tool or convention expects them at root.

## Replit / Scaffold Cleanup Check

Search for stale Replit or starter-template references.

Use:

```bash
rg -n "replit|\.replit|replit\.nix|starter|template|scaffold" . --glob '!node_modules/**' --glob '!.git/**' --glob '!dist/**'
```

If `rg` is unavailable, use `grep`.

Do not automatically delete files during this audit unless clearly safe.

Document:

- active stale references
- historical references
- unused config files
- recommended cleanup

## Docker, GHCR, and Deployment Review

If Docker, GHCR, compose, Unraid, or self-hosted deployment files exist, audit them.

Check:

- Dockerfile correctness
- `.dockerignore`
- compose files
- ports
- environment variables by name only
- volumes
- restart policies
- health checks
- non-root runtime user
- production build path
- GHCR workflow
- multi-arch builds, if configured
- reverse proxy/HTTPS assumptions
- Unraid compatibility, if relevant

Document what passed and what needs follow-up.

Do not invent a GHCR workflow unless the audit recommends it later.

## Git Requirements

Before changes:

```bash
git status --short --branch
git branch --show-current
git remote -v
```

Do not overwrite unrelated uncommitted work.

Commit documentation changes after completing the audit if appropriate.

Suggested commit message:

```bash
git commit -m "Add Tilted audit and agent documentation"
```

Push only if remote/auth are available and it is safe.

Do not force push.

Document commit and push status in `UPDATES.md`.

## Final Response

When finished, summarize:

1. files created
2. files updated
3. commands run and results
4. findings count by severity
5. functionality suggestions count
6. README/AGENTS/UPDATES status
7. references folder changes, if any
8. Docker/GHCR/deployment verification result
9. git commit created
10. whether push succeeded
11. top recommended next actions
12. audit limitations
