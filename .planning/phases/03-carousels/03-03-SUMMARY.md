---
phase: 03-carousels
plan: 03
subsystem: ui
tags: [react, tailwind, mobile, touch, carousel, typescript]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: Tailwind CSS 4 breakpoint tokens and responsive utility classes
provides:
  - MediaCard with hidden lg:block guard on hover modal (no popup on touch devices)
  - MediaCastCarousel with scroll-smooth and scrollbar-none on mobile
  - MediaCastCard with full-card Link tap target (circle + name + character text)
affects: [03-carousels, any phase using MediaCard or MediaCastCarousel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "hidden lg:block wrapper pattern for desktop-only floating UI elements"
    - "scrollbar-none lg:scrollbar for mobile-clean / desktop-visible scrollbar toggle"
    - "Expand Link to wrap full card content for larger touch tap targets"

key-files:
  created: []
  modified:
    - frontend/src/components/media/cards/MediaCard.tsx
    - frontend/src/components/media/carousel/MediaCastCarousel.tsx
    - frontend/src/components/media/cards/MediaCastCard.tsx

key-decisions:
  - "Use hidden lg:block on MediaCardModal wrapper — no pointer event suppression needed; CSS visibility guard is sufficient and minimal"
  - "No Embla migration for MediaCastCarousel — native overflow-x-auto works well on iOS/Android touch; confirmed adequate per CONTEXT.md"
  - "scrollbar-none lg:scrollbar pattern removes browser scrollbar on mobile without affecting desktop visibility"

patterns-established:
  - "hidden lg:block: canonical pattern for desktop-only floating UI — applies to any hover popup/tooltip that should not appear on touch devices"
  - "Expand Link wrapping: for card-style components, Link should wrap entire card content not just the primary image element"

requirements-completed: [CARD-01, CARD-02]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 3 Plan 3: Mobile Touch Fixes for MediaCard and Cast Carousel Summary

**MediaCard hover popup guarded to desktop-only via hidden lg:block; cast carousel scroll polished with scroll-smooth and hidden mobile scrollbar; cast card full-area tap target via expanded Link wrapper**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-20T23:07:19Z
- **Completed:** 2026-02-20T23:08:24Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- MediaCardModal is now hidden below lg breakpoint (1024px) — tap on mobile navigates directly without showing the hover popup
- MediaCastCarousel gains scroll-smooth momentum and hides the browser scrollbar on mobile (scrollbar-none lg:scrollbar)
- MediaCastCard Link now wraps the full card area (profile image + name + character text) — entire 120px card is tappable on mobile

## Task Commits

Each task was committed atomically:

1. **Task 1: Guard MediaCardModal to desktop-only in MediaCard** - `cd874df` (fix)
2. **Task 2: Audit MediaCastCarousel and MediaCastCard touch targets** - `8c6c613` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `frontend/src/components/media/cards/MediaCard.tsx` - Added `hidden lg:block` to floating modal wrapper div (line 145)
- `frontend/src/components/media/carousel/MediaCastCarousel.tsx` - Added `scroll-smooth scrollbar-none lg:scrollbar`, removed plain `scrollbar` class
- `frontend/src/components/media/cards/MediaCastCard.tsx` - Expanded Link to wrap full card (circle + name + character); extracted profileImage to avoid duplication

## Decisions Made
- Used `hidden lg:block` CSS guard rather than pointer event suppression — simpler, no JS logic changes needed, covers all touch device scenarios
- Did not migrate MediaCastCarousel to Embla — native `overflow-x-auto` confirmed adequate for mobile horizontal scroll per plan context
- `scrollbar-none lg:scrollbar` uses tailwind-scrollbar plugin (v4.0.2 already installed) — no new dependencies

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None — pre-existing TypeScript errors in unrelated files (BentoGrid.tsx, TrendingCarousel.tsx, etc.) confirmed unchanged before and after execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three touch UX fixes are complete: MediaCard modal guard, cast carousel scroll quality, cast card tap target expansion
- Phase 03-carousels plans 1 and 2 (if any) should be checked for remaining carousel work
- No blockers for subsequent carousel or layout phases

---
*Phase: 03-carousels*
*Completed: 2026-02-21*

## Self-Check: PASSED

- FOUND: frontend/src/components/media/cards/MediaCard.tsx
- FOUND: frontend/src/components/media/carousel/MediaCastCarousel.tsx
- FOUND: frontend/src/components/media/cards/MediaCastCard.tsx
- FOUND: .planning/phases/03-carousels/03-03-SUMMARY.md
- FOUND commit: cd874df (Task 1 — guard MediaCardModal)
- FOUND commit: 8c6c613 (Task 2 — cast carousel + card touch UX)
