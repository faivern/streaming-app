---
phase: 02-foundation
plan: 01
subsystem: ui
tags: [tailwind, css, viewport, breakpoints, z-index, dvh, ios-safari]

# Dependency graph
requires: []
provides:
  - 3xl (1920px) and 4xl (2560px) Tailwind 4 breakpoints via --breakpoint-* in @theme
  - viewport-fit=cover in index.html viewport meta (prerequisite for safe-area-inset in Plan 02-02)
  - 10-token z-index scale in :root (--z-base through --z-toast)
  - --spacing-navbar-offset placeholder token in @theme
  - All min-h-screen replaced with min-h-dvh across frontend/src/
affects: [03-carousels, 04-bottom-nav, 05-modals, 02-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tailwind 4 @theme for breakpoints — use --breakpoint-* syntax, NOT tailwind.config.js screens (silently ignored in TW4)"
    - "Z-index as :root CSS custom properties, consumed with z-(--z-*) syntax in class attributes"
    - "min-h-dvh instead of min-h-screen for iOS Safari dynamic viewport compatibility"

key-files:
  created: []
  modified:
    - frontend/index.html
    - frontend/src/index.css
    - frontend/src/App.tsx
    - frontend/src/pages/creditsPage/creditsPage.tsx
    - frontend/src/pages/myLists/MyListsPage.tsx
    - frontend/src/pages/legal/PrivacyPolicy.tsx
    - frontend/src/pages/legal/TermsOfService.tsx

key-decisions:
  - "Use rem for breakpoints in @theme (120rem/160rem not 1920px/2560px) — Tailwind 4 sorts breakpoints by value and mixing px/rem causes incorrect sort order"
  - "Z-index tokens go in :root, NOT @theme — @theme has no --z-* namespace and would not generate z- utilities"
  - "Pre-existing TypeScript errors in unrelated files are out of scope and not fixed per deviation rules"

patterns-established:
  - "3xl:/4xl: prefix usage: --breakpoint-3xl: 120rem in @theme generates the 3xl: responsive prefix"
  - "Z-index usage: z-(--z-sticky) syntax in TSX class attributes consumes :root custom properties"

requirements-completed: [FOUND-01, FOUND-02, FOUND-03, FOUND-05]

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 2 Plan 01: CSS Foundation Summary

**Global CSS foundation with 3xl/4xl breakpoints, 10-token z-index scale, viewport-fit=cover, and min-h-dvh replacing min-h-screen across all 5 affected files**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T18:42:46Z
- **Completed:** 2026-02-20T18:44:56Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Added `--breakpoint-3xl: 120rem` and `--breakpoint-4xl: 160rem` to @theme block — Phase 3 carousels can now use the `3xl:` and `4xl:` responsive prefixes
- Added 10-token z-index scale to :root (`--z-base` through `--z-toast`) — Phase 4 bottom nav and Phase 5 modals can use canonical stacking layers
- Fixed viewport meta to include `viewport-fit=cover` — prerequisite for `env(safe-area-inset-bottom)` returning non-zero values in Plan 02-02
- Replaced all 8 occurrences of `min-h-screen` with `min-h-dvh` across 5 files — iOS Safari toolbar no longer clips content

## Task Commits

Each task was committed atomically:

1. **Task 1: Add 3xl/4xl breakpoints and z-index token table to CSS; fix viewport meta** - `01a3128` (feat)
2. **Task 2: Replace min-h-screen with min-h-dvh across all 5 affected files** - `afc9283` (feat)

## Files Created/Modified

- `frontend/index.html` - Added viewport-fit=cover to viewport meta tag
- `frontend/src/index.css` - Added --breakpoint-3xl/4xl and --spacing-navbar-offset to @theme; added 10-token :root z-index scale
- `frontend/src/App.tsx` - Root container min-h-screen -> min-h-dvh
- `frontend/src/pages/creditsPage/creditsPage.tsx` - 4 occurrences replaced
- `frontend/src/pages/myLists/MyListsPage.tsx` - 2 occurrences replaced
- `frontend/src/pages/legal/PrivacyPolicy.tsx` - 1 occurrence replaced
- `frontend/src/pages/legal/TermsOfService.tsx` - 1 occurrence replaced

## Decisions Made

- Use rem (not px) for @theme breakpoints. Tailwind 4 sorts breakpoints numerically, and mixing px/rem units causes incorrect sort order where 120rem (1920px) would sort before small px values. rem avoids this.
- Z-index tokens belong in `:root` not `@theme`. Tailwind 4's @theme has no `--z-*` namespace; tokens there would not generate z- utilities. Using :root and consuming them with `z-(--z-sticky)` syntax is the correct approach.
- Pre-existing TypeScript errors across the codebase (unused imports, type mismatches in unrelated files) are out of scope per deviation Rule SCOPE BOUNDARY — not fixed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript typecheck (`npm run typecheck`) exits with pre-existing errors in unrelated files (unused imports, type mismatches in carousel, insights, and detail components). These are NOT caused by this plan's changes and are explicitly out of scope per deviation rules. They will be logged to deferred-items if needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 3xl/4xl breakpoint prefixes are now active. Phase 3 carousel plans can use `3xl:grid-cols-N` syntax.
- Z-index tokens are in place. Phase 4 bottom nav can assign itself `z-(--z-sticky)` or a new token without guessing magic numbers.
- viewport-fit=cover is set. Plan 02-02 can use `env(safe-area-inset-bottom)` and receive non-zero values on iPhone with iOS Safari.
- No blockers for Plan 02-02.

## Self-Check: PASSED

All files confirmed present. All task commits verified in git history.

---
*Phase: 02-foundation*
*Completed: 2026-02-20*
