---
phase: 08-secondary-pages-and-insights
plan: 03
subsystem: ui
tags: [tailwind, mobile, responsive, overflow, navbar-offset, touch-targets, z-index]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: mt-navbar-offset token, z-(--z-dropdown) token, pb-safe tokens
  - phase: 05-modals-and-filters
    provides: py-3 touch target pattern, overscroll-contain pattern
  - phase: 06-media-detail-page
    provides: line-clamp-3 sm:line-clamp-none responsive truncation pattern
provides:
  - GenreDetailPage hero badge row wraps at 375px (flex-wrap on stat badge div)
  - CollectionPage content clears fixed navbar (mt-navbar-offset replaces mt-10)
  - HeroCollection overlay bounded to section width (left-0 right-0), overview line-clamped on mobile
  - ProvidersPage 2-column grid at mobile (grid-cols-2 base), cards fill columns via w-full aspect-square
  - RegionSelector uses z-(--z-dropdown) token and py-3 touch targets on option rows
  - Legal pages (PrivacyPolicy, TermsOfService) content clears fixed navbar (mt-navbar-offset)
affects: [future-secondary-pages, provider-detail-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "w-full aspect-square: card fills grid column width; grid is layout authority not the card"
    - "mt-navbar-offset: canonical page top offset — applied to collectionPage success render and legal pages"
    - "z-(--z-dropdown): token replaces raw z-20 in RegionSelector dropdown"
    - "flex-wrap on badge rows: prevents horizontal overflow of inline badge groups at narrow widths"
    - "line-clamp-3 sm:line-clamp-none: responsive text truncation (established Phase 6, applied to HeroCollection)"

key-files:
  created: []
  modified:
    - frontend/src/pages/genreDetailPage/GenreDetailPage.tsx
    - frontend/src/pages/collectionPage/collectionPage.tsx
    - frontend/src/components/media/hero/HeroCollection.tsx
    - frontend/src/pages/providersPage/ProvidersPage.tsx
    - frontend/src/components/media/cards/WatchProviderCard.tsx
    - frontend/src/components/media/RegionSelector.tsx
    - frontend/src/pages/legal/PrivacyPolicy.tsx
    - frontend/src/pages/legal/TermsOfService.tsx

key-decisions:
  - "HeroCollection overlay changed from absolute left-4 max-w-xl to absolute left-0 right-0 — panel bounded to section, not floating with fixed max-width that overflows 375px"
  - "WatchProviderCard uses w-full aspect-square instead of fixed w-28 h-28 — grid column width drives card dimensions; fixed pixel sizes break responsive grids"
  - "ProvidersPage base column count reduced from grid-cols-3 to grid-cols-2 — 3 columns at 375px gives ~103px per card, too narrow; 2 columns gives ~163px"

patterns-established:
  - "w-full aspect-square: correct approach for any card in a responsive grid — let the grid be the layout authority"
  - "HeroCollection full-width overlay pattern: absolute bottom-0 left-0 right-0 with gradient background"

requirements-completed: [SEC-02, SEC-03, SEC-04, SEC-05]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 8 Plan 03: Secondary Pages Mobile Layout Fixes Summary

**8 targeted Tailwind class fixes across genre, collection, provider, and legal pages eliminating all 375px horizontal overflow and navbar-obscured content issues (SEC-02 through SEC-05)**

## Performance

- **Duration:** 2 min (109 seconds)
- **Started:** 2026-02-21T00:12:27Z
- **Completed:** 2026-02-21T00:14:16Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- SEC-02 satisfied: GenreDetailPage hero stat badge row wraps at 375px instead of overflowing horizontally
- SEC-03 satisfied: CollectionPage content clears fixed navbar (mt-navbar-offset), HeroCollection overlay bounded to section width with overview clamped on mobile
- SEC-04 satisfied: ProvidersPage 2-column grid at 375px with fluid WatchProviderCards, RegionSelector z-index token and 44px touch targets on option rows
- SEC-05 satisfied: Both legal pages (PrivacyPolicy, TermsOfService) push content below fixed navbar via mt-navbar-offset

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix GenreDetailPage hero badge row, CollectionPage navbar offset, and HeroCollection full-width overlay** - `a032257` (fix)
2. **Task 2: Fix ProvidersPage grid, WatchProviderCard size, RegionSelector z-index token and touch targets, and legal pages navbar offset** - `2f28313` (fix)

## Files Created/Modified
- `frontend/src/pages/genreDetailPage/GenreDetailPage.tsx` - Added flex-wrap to hero stat badge row div
- `frontend/src/pages/collectionPage/collectionPage.tsx` - Replaced mt-10 with mt-navbar-offset on success render div
- `frontend/src/components/media/hero/HeroCollection.tsx` - Full-width overlay (bottom-0 left-0 right-0), smaller h1 on mobile, line-clamp-3 on overview paragraph
- `frontend/src/pages/providersPage/ProvidersPage.tsx` - grid-cols-2 base (was grid-cols-3), gap-4 at mobile, 2xl:grid-cols-8 at XL
- `frontend/src/components/media/cards/WatchProviderCard.tsx` - w-full aspect-square replacing w-28 h-28; max-w-full on provider name paragraph
- `frontend/src/components/media/RegionSelector.tsx` - z-(--z-dropdown) token replacing z-20; py-3 on Listbox.Option rows
- `frontend/src/pages/legal/PrivacyPolicy.tsx` - mt-navbar-offset on main, py-8 replacing py-16 on article
- `frontend/src/pages/legal/TermsOfService.tsx` - mt-navbar-offset on main, py-8 replacing py-16 on article

## Decisions Made
- HeroCollection overlay changed from `absolute left-4 max-w-xl` to `absolute left-0 right-0` — the panel was floating with a fixed 576px max-width that overflows a 375px viewport; bounding it to section edges (left-0 right-0) is the correct architectural fix
- WatchProviderCard changed from fixed `w-28 h-28` to `w-full aspect-square` — grid columns drive card width; fixed pixel sizes ignore the responsive grid and overflow their columns
- ProvidersPage base columns reduced from 3 to 2 — at 375px with px-4 padding, 3 columns gives ~103px per card (too narrow for logos); 2 columns gives ~163px (adequate)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Linter notification appeared after first GenreDetailPage edit, but the change was already successfully applied (linter notification was informational only, not a revert).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four secondary page requirements (SEC-02, SEC-03, SEC-04, SEC-05) satisfied
- Phase 8 plan 03 complete — ready for any remaining Phase 8 plans or Phase 9

---
*Phase: 08-secondary-pages-and-insights*
*Completed: 2026-02-21*
