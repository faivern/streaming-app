---
phase: 05-modals-and-filters
plan: 03
subsystem: ui
tags: [react, typescript, mobile, touch-events, ios, headless-ui, tailwind]

# Dependency graph
requires:
  - phase: 05-01
    provides: dvh + overscroll-contain applied to modal Dialog.Panel elements
provides:
  - SearchBar with touchstart + mousedown click-outside handler (iOS tap-outside dismiss)
  - DiscoverModal search input with onFocus scrollIntoView for virtual keyboard avoidance
  - CreateListModal, EditListModal, DeleteConfirmModal drag handle bars for bottom-sheet affordance
affects:
  - Any phase touching SearchBar, DiscoverModal, or list modals

# Tech tracking
tech-stack:
  added: []
  patterns:
    - touchstart passive listener alongside mousedown in same useEffect for iOS touch-outside dismiss
    - onFocus + 300ms delayed scrollIntoView for virtual keyboard input visibility
    - sm:hidden drag handle bar as first child of Dialog.Panel for mobile bottom-sheet affordance

key-files:
  created: []
  modified:
    - frontend/src/components/layout/SearchBar.tsx
    - frontend/src/components/discover/DiscoverModal.tsx
    - frontend/src/components/lists/modals/CreateListModal.tsx
    - frontend/src/components/lists/modals/EditListModal.tsx
    - frontend/src/components/lists/modals/DeleteConfirmModal.tsx

key-decisions:
  - "touchstart { passive: true } added alongside mousedown in same useEffect — not a second useEffect; passive prevents blocking default scroll gesture"
  - "300ms delay on scrollIntoView matches iOS virtual keyboard animation duration; React 19 synthetic events do not need e.persist()"
  - "w-10 (not w-12 from MobileFilterDrawer) for drag handles — slightly more subtle appearance on smaller compact modals"
  - "sm:hidden on drag handle wrapper — handle only shown on mobile where bottom-sheet affordance applies"

patterns-established:
  - "Pattern: iOS touch-outside dismiss — register touchstart { passive: true } alongside mousedown on same handler; union type MouseEvent | TouchEvent"
  - "Pattern: Virtual keyboard avoidance — onFocus + 300ms setTimeout scrollIntoView({ block: 'nearest', behavior: 'smooth' }) on modal search inputs"
  - "Pattern: Bottom-sheet drag handle — flex justify-center pt-2 pb-1 sm:hidden wrapper with w-10 h-1 bg-gray-600 rounded-full pill as first Dialog.Panel child"

requirements-completed: [MOD-05, DISC-03]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 5 Plan 03: Mobile Touch Fixes Summary

**touchstart passive listener for iOS tap-outside SearchBar dismiss, scrollIntoView keyboard avoidance in DiscoverModal, and drag handle bars on three list modals**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-21T00:04:38Z
- **Completed:** 2026-02-21T00:06:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- SearchBar now handles iOS tap-outside correctly: `touchstart` (passive) registered alongside `mousedown` on the same `handleClickOutside` handler with a `MouseEvent | TouchEvent` union type
- DiscoverModal search input scrolls into view after 300ms on focus so it stays visible after the virtual keyboard animates in
- CreateListModal, EditListModal, and DeleteConfirmModal each have a drag handle bar (`w-10 h-1 bg-gray-600 rounded-full`) as the first child of Dialog.Panel, hidden on sm+ via `sm:hidden`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add touchstart to SearchBar click-outside and onFocus scrollIntoView to DiscoverModal** - `6d8a6e5` (feat)
2. **Task 2: Add drag handle bars to bottom-sheet list modals** - `55eeb38` (feat)

## Files Created/Modified

- `frontend/src/components/layout/SearchBar.tsx` - Extended handleClickOutside to `MouseEvent | TouchEvent`; added touchstart passive listener and cleanup in same useEffect as mousedown
- `frontend/src/components/discover/DiscoverModal.tsx` - Added onFocus handler with 300ms delayed scrollIntoView to the search query input
- `frontend/src/components/lists/modals/CreateListModal.tsx` - Added sm:hidden drag handle bar as first child of Dialog.Panel
- `frontend/src/components/lists/modals/EditListModal.tsx` - Added sm:hidden drag handle bar as first child of Dialog.Panel
- `frontend/src/components/lists/modals/DeleteConfirmModal.tsx` - Added sm:hidden drag handle bar as first child of Dialog.Panel

## Decisions Made

- `touchstart { passive: true }` added in the same useEffect as the existing `mousedown` listener — not a separate useEffect — to keep event registration and cleanup co-located
- Handler type widened to `MouseEvent | TouchEvent` union — TypeScript enforced
- 300ms delay on scrollIntoView matches the iOS virtual keyboard animation duration; no `e.persist()` needed in React 19
- Drag handle `w-10` (slightly narrower than MobileFilterDrawer's `w-12`) chosen for more subtle appearance on compact modals like DeleteConfirmModal
- `sm:hidden` ensures drag handles are invisible on desktop (centered modal, no bottom-sheet affordance needed)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in unrelated files were found during the typecheck run (BentoGrid, Navbar, hooks, etc.). These are out-of-scope per deviation rules and are not caused by the changes in this plan. They were present before this plan's changes and are not introduced by them.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 (Modals and Filters) is now complete — all 3 plans executed
- The v1.1 Full Responsiveness milestone is ready for Phase 6
- No blockers

---
*Phase: 05-modals-and-filters*
*Completed: 2026-02-21*
