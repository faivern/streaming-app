---
phase: 09-global-polish
plan: 04
subsystem: ui
tags: [tailwind, z-index, tokens, css-custom-properties, headlessui]

# Dependency graph
requires:
  - phase: 09-global-polish
    provides: "09-01 established z-(--z-*) token syntax and swept 6 components; 09-03 established px-page token sweep pattern"
provides:
  - "Zero z-50 integer z-index literals remain anywhere in frontend/src/components/"
  - "All 7 lists/modals Dialog components use z-(--z-modal) token (value: 140)"
  - "MediaCard floating hover panel uses z-(--z-dropdown) token (value: 20)"
  - "TrendingCarousel overlay text uses z-(--z-overlay) token (value: 60)"
affects: [future-phases, component-authoring]

# Tech tracking
tech-stack:
  added: []
  patterns: ["z-(--z-modal) on all Headless UI Dialog root elements", "z-(--z-dropdown) for floating-ui anchored panels", "z-(--z-overlay) for absolute text overlays atop background images"]

key-files:
  created: []
  modified:
    - frontend/src/components/lists/modals/AddMediaModal.tsx
    - frontend/src/components/lists/modals/AddToListModal.tsx
    - frontend/src/components/lists/modals/MediaEntryModal.tsx
    - frontend/src/components/lists/modals/LimitReachedModal.tsx
    - frontend/src/components/lists/modals/CreateListModal.tsx
    - frontend/src/components/lists/modals/EditListModal.tsx
    - frontend/src/components/lists/modals/DeleteConfirmModal.tsx
    - frontend/src/components/media/cards/MediaCard.tsx
    - frontend/src/components/media/carousel/TrendingCarousel.tsx

key-decisions:
  - "All 7 lists/modals Dialog elements use z-(--z-modal) (140) — same token as DiscoverModal established in 09-01; ensures all modals stack identically above sticky navbar (--z-sticky: 50)"
  - "MediaCard floating hover panel uses z-(--z-dropdown) (20) — semantically correct for floating card tooltip; above base cards (--z-raised: 10), below sticky navbar"
  - "TrendingCarousel overlay text div uses z-(--z-overlay) (60) — semantically correct for absolute content overlaid on a background image; same token as MobileFilterDrawer established in 09-01"

patterns-established:
  - "z-(--z-modal): canonical token for all Headless UI Dialog root elements in the codebase"
  - "z-(--z-dropdown): canonical token for floating-ui anchored UI panels (tooltips, popovers)"
  - "z-(--z-overlay): canonical token for absolutely-positioned text/content overlaid on image backgrounds"

requirements-completed: [POL-04]

# Metrics
duration: 2min
completed: 2026-02-25
---

# Phase 9 Plan 04: Z-Index Token Sweep (lists/modals + MediaCard + TrendingCarousel) Summary

**Complete z-index token sweep: zero z-50 integer literals remain in frontend/src/components/ — all 9 remaining components now use canonical z-(--z-*) CSS custom property tokens**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-25T10:35:06Z
- **Completed:** 2026-02-25T10:36:34Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Replaced `z-50` with `z-(--z-modal)` on all 7 lists/modals Dialog root elements — each file's Dialog component now uses the canonical modal stacking token (value: 140) matching DiscoverModal established in 09-01
- Replaced `z-50` with `z-(--z-dropdown)` on MediaCard's floating hover panel — semantically correct for a floating-ui anchored card tooltip
- Replaced `z-50` with `z-(--z-overlay)` on TrendingCarousel's overlay text div — semantically correct for text content overlaid on a background image
- Zero `z-50` integer z-index literals remain anywhere in `frontend/src/components/` — the z-index token sweep is complete across the full component tree

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace z-50 with z-(--z-modal) on all 7 lists/modals Dialog components** - `2bc6ccb` (feat)
2. **Task 2: Replace z-50 with semantic tokens in MediaCard hover panel and TrendingCarousel overlay** - `3e88edf` (feat)

## Files Created/Modified

- `frontend/src/components/lists/modals/AddMediaModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/lists/modals/AddToListModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/lists/modals/MediaEntryModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/lists/modals/LimitReachedModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/lists/modals/CreateListModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/lists/modals/EditListModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/lists/modals/DeleteConfirmModal.tsx` - Dialog root: z-50 → z-(--z-modal)
- `frontend/src/components/media/cards/MediaCard.tsx` - Floating hover panel: z-50 → z-(--z-dropdown)
- `frontend/src/components/media/carousel/TrendingCarousel.tsx` - Overlay text div: z-50 → z-(--z-overlay)

## Decisions Made

- All 7 lists/modals Dialog elements use `z-(--z-modal)` (140) — same token as DiscoverModal established in 09-01; ensures all modals stack identically above sticky navbar (--z-sticky: 50)
- MediaCard floating hover panel uses `z-(--z-dropdown)` (20) — above base cards (--z-raised: 10), below sticky navbar (--z-sticky: 50); correct stacking layer for a floating card tooltip
- TrendingCarousel overlay text div uses `z-(--z-overlay)` (60) — semantically correct for absolutely-positioned content overlaid on a background image; same token used by MobileFilterDrawer

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

TypeScript typecheck reported pre-existing errors in unrelated files (unused imports, type mismatches in hooks). None of these errors are in the 9 modified files and none were introduced by the z-index token changes. Out of scope per deviation rules.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Z-index token sweep is complete across the entire `frontend/src/components/` directory — Gap 2 from 09-VERIFICATION.md is closed
- POL-04 requirement satisfied
- Phase 09-global-polish gap closure plans (09-03 and 09-04) are both complete

---
*Phase: 09-global-polish*
*Completed: 2026-02-25*

## Self-Check: PASSED

- All 9 modified files exist on disk
- Commit 2bc6ccb confirmed (Task 1: 7 modal files)
- Commit 3e88edf confirmed (Task 2: MediaCard + TrendingCarousel)
- SUMMARY.md exists at .planning/phases/09-global-polish/09-04-SUMMARY.md
