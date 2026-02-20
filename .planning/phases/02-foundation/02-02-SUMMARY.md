---
phase: 02-foundation
plan: 02
subsystem: ui
tags: [tailwindcss, css, ios, safe-area, responsive, cleanup]

# Dependency graph
requires:
  - phase: 02-01
    provides: viewport-fit=cover in index.html (prerequisite for env(safe-area-inset-bottom) returning non-zero)
provides:
  - pb-safe and pb-safe-or-4 CSS utility classes (iOS safe-area padding)
  - mt-navbar-offset Tailwind utility driven by responsive --navbar-height CSS variable
  - Splide packages removed from node_modules
  - tailwind.config.js deleted (was silently ignored by TW4)
affects:
  - Phase 3 (carousels and component work — uses mt-navbar-offset on page containers)
  - Phase 4 (bottom nav — fixed-bottom elements will use pb-safe or pb-safe-or-4)
  - Phase 5 (modal patterns — MOD-02 scope, not touched here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fixed-bottom elements use pb-safe to clear iOS home indicator"
    - "All page top-margin offsets use mt-navbar-offset (single token, not scattered mt-20/24/28/32)"
    - "Navbar height controlled via --navbar-height CSS var in :root with responsive @media breakpoints"

key-files:
  created: []
  modified:
    - frontend/src/index.css
    - frontend/src/components/discover/MobileFilterDrawer.tsx
    - frontend/src/pages/myLists/MyListsPage.tsx
    - frontend/src/components/feedback/Error.tsx
    - frontend/src/pages/collectionPage/collectionPage.tsx
    - frontend/src/pages/genreDetailPage/GenreDetailPage.tsx
    - frontend/src/pages/home/HomePage.tsx
    - frontend/src/pages/providerPage/ProviderPage.tsx
    - frontend/src/pages/providersPage/ProvidersPage.tsx
    - frontend/src/pages/insights/MasterInsightsPage.tsx
    - frontend/src/pages/insights/ListInsightsPage.tsx

key-decisions:
  - "pb-safe uses env(safe-area-inset-bottom) directly (no minimum); pb-safe-or-4 uses max(1rem, env()) for cases needing minimum spacing"
  - "max-h-[85vh] changed to max-h-[85dvh] on MobileFilterDrawer only (other modal max-h patterns deferred to Phase 5 per MOD-02)"
  - "FAB z-index upgraded from z-40 to z-(--z-overlay) to align with z-index token system from Plan 02-01"
  - "TypeScript errors in build:strict are pre-existing (confirmed by stash test) — not introduced by this plan"

patterns-established:
  - "pb-safe: fixed-bottom element pattern for iOS safe area clearance"
  - "mt-navbar-offset: canonical page container top offset (single variable, responsive via :root)"

requirements-completed: [FOUND-04, FOUND-06]

# Metrics
duration: 4min
completed: 2026-02-20
---

# Phase 2 Plan 02: iOS Safety Layer and CSS Architecture Cleanup Summary

**pb-safe safe-area utilities, responsive mt-navbar-offset token replacing 13 scattered offsets, Splide uninstalled, dead tailwind.config.js deleted**

## Performance

- **Duration:** 4 min (245s)
- **Started:** 2026-02-20T18:46:19Z
- **Completed:** 2026-02-20T18:50:24Z
- **Tasks:** 3 of 3
- **Files modified:** 11 (plus package.json, package-lock.json)

## Accomplishments
- pb-safe and pb-safe-or-4 @layer utilities defined in index.css; applied to MobileFilterDrawer Dialog.Panel and MyListsPage FAB — fixed-bottom elements now clear the iOS home indicator
- mt-navbar-offset Tailwind utility wired to responsive --navbar-height CSS variable (5rem mobile, 6rem md, 7rem lg, 8rem xl); 13 hardcoded class patterns across 9 files replaced with single token
- @splidejs/react-splide and @splidejs/splide uninstalled (zero src imports confirmed); tailwind.config.js deleted (silently ignored since TW4 migration; all settings migrated in Plan 02-01)

## Task Commits

Each task was committed atomically:

1. **Task 1: Define safe-area utilities and apply to fixed-bottom elements** - `922cad9` (feat)
2. **Task 2: Replace navbar offset margins with mt-navbar-offset token** - `bc71d54` (feat)
3. **Task 3: Remove Splide dependency and delete tailwind.config.js** - `c61c422` (chore)

## Files Created/Modified
- `frontend/src/index.css` - Added pb-safe/@pb-safe-or-4 @layer utilities; --navbar-height :root var with responsive @media breakpoints; --spacing-navbar-offset updated to var(--navbar-height)
- `frontend/src/components/discover/MobileFilterDrawer.tsx` - max-h-[85vh] -> max-h-[85dvh], added pb-safe to Dialog.Panel
- `frontend/src/pages/myLists/MyListsPage.tsx` - FAB: z-40 -> z-(--z-overlay), added pb-safe; page container: mt-20 lg:mt-24 -> mt-navbar-offset
- `frontend/src/components/feedback/Error.tsx` - mt-20 md:mt-24 lg:mt-28 xl:mt-32 -> mt-navbar-offset
- `frontend/src/pages/collectionPage/collectionPage.tsx` - mt-20 -> mt-navbar-offset (loading state)
- `frontend/src/pages/genreDetailPage/GenreDetailPage.tsx` - mt-20 md:mt-24 lg:mt-28 xl:mt-32 -> mt-navbar-offset
- `frontend/src/pages/home/HomePage.tsx` - mt-20 md:mt-24 lg:mt-28 xl:mt-32 -> mt-navbar-offset
- `frontend/src/pages/providerPage/ProviderPage.tsx` - mt-20 md:mt-24 lg:mt-28 xl:mt-32 -> mt-navbar-offset
- `frontend/src/pages/providersPage/ProvidersPage.tsx` - mt-20 md:mt-24 lg:mt-28 xl:mt-32 -> mt-navbar-offset
- `frontend/src/pages/insights/MasterInsightsPage.tsx` - 3x mt-20 lg:mt-24 -> mt-navbar-offset
- `frontend/src/pages/insights/ListInsightsPage.tsx` - 3x mt-20 lg:mt-24 -> mt-navbar-offset
- `frontend/package.json` / `frontend/package-lock.json` - Splide packages removed

## Decisions Made
- pb-safe uses `env(safe-area-inset-bottom)` directly for the MobileFilterDrawer (the drawer's own flex layout provides internal spacing); pb-safe-or-4 with `max(1rem, env())` available for elements needing a minimum floor
- max-h-[85dvh] applied only to MobileFilterDrawer per the plan; other max-h-[90vh] modal patterns are Phase 5 scope (MOD-02)
- FAB z-index promoted from z-40 to z-(--z-overlay) (60) to use the canonical z-index token system established in Plan 02-01

## Deviations from Plan

None - plan executed exactly as written.

**Note on TypeScript errors:** `npm run build:strict` fails with pre-existing TypeScript errors (unused imports, type mismatches in unrelated files). Confirmed pre-existing by git stash test before changes. These are out-of-scope per deviation rules — logged to deferred-items for Phase cleanup consideration.

## Issues Encountered
- Pre-existing TypeScript errors prevented `build:strict` from exiting 0, but confirmed via git stash these errors existed before this plan's changes. No new errors were introduced. The Vite bundler itself would succeed (tsc -b is the failing step).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- iOS safety layer foundation complete: viewport-fit=cover (Plan 02-01) + pb-safe utility (this plan) are both in place
- mt-navbar-offset token is canonical — Phase 3+ page containers should use mt-navbar-offset, never mt-20/24/28/32
- Fixed-bottom elements (FABs, drawers) should use pb-safe or pb-safe-or-4 as established in this plan

---
*Phase: 02-foundation*
*Completed: 2026-02-20*

## Self-Check: PASSED

- index.css: FOUND
- MobileFilterDrawer.tsx: FOUND
- MyListsPage.tsx: FOUND
- tailwind.config.js: CONFIRMED DELETED
- SUMMARY.md: FOUND
- Commit 922cad9 (Task 1): FOUND
- Commit bc71d54 (Task 2): FOUND
- Commit c61c422 (Task 3): FOUND
