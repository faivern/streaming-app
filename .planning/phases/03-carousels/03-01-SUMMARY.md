---
phase: 03-carousels
plan: 01
subsystem: ui
tags: [embla-carousel, react, tailwind, mobile, responsive, touch, carousel]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: iOS safe-area utilities and mt-navbar-offset token used by section padding
provides:
  - CollectionCarousel with Embla touch swipe and 2-up mobile layout at 375px
  - Top10Carousel with Embla touch swipe, 2-up mobile layout, and mediaType reset
  - GenreCardList with Embla touch swipe and 2-up mobile layout at 375px
affects: [03-carousels, home-page, genre-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useEmblaCarousel(loop:false, align:start, dragFree:false) as canonical carousel setup
    - Slide widths via flex-[0_0_calc(50%-12px)] responsive breakpoints instead of fixed w-lg
    - Arrow visibility via canScrollPrev/canScrollNext (no grayed-out state)
    - Dot indicators via scrollSnapList/selectedScrollSnap
    - Mobile touch via Embla native drag (no custom event handlers needed)
    - Card components use w-full to fill slide container (not hardcoded width)

key-files:
  created: []
  modified:
    - frontend/src/components/media/carousel/CollectionCarousel.tsx
    - frontend/src/components/media/carousel/Top10Carousel.tsx
    - frontend/src/components/media/carousel/GenreCardList.tsx
    - frontend/src/components/media/cards/CollectionCard.tsx
    - frontend/src/components/media/cards/GenreCard.tsx

key-decisions:
  - "Slide containers use flex-[0_0_calc(50%-12px)] breakpoint ladder — 2-up mobile, 3-up tablet, 4-up desktop for media cards, 5-up for genre cards"
  - "Arrow buttons use hidden lg:flex — touch is mobile UX, arrows are desktop UX"
  - "Arrows render conditionally (not disabled) so no grayed-out or semi-transparent state at boundaries"
  - "Card components (CollectionCard, GenreCard) updated to w-full — slide container dictates width, not the card"

patterns-established:
  - "Embla pattern: useEmblaCarousel + canScrollPrev/canScrollNext + scrollSnapList for all carousels"
  - "Mobile-first carousel: Embla handles touch natively, zero custom touch event code"
  - "Slide sizing: flex-[0_0_calc(N%-Xpx)] with gap-6 (24px) — N and X chosen so N + gap fills viewport exactly"

requirements-completed: [CAR-01, CAR-02, CAR-05, CAR-07]

# Metrics
duration: 3min
completed: 2026-02-21
---

# Phase 3 Plan 01: Carousels Embla Migration Summary

**CollectionCarousel, Top10Carousel, and GenreCardList rewritten to use Embla Carousel with native touch swipe and viewport-relative 2-up slide widths at 375px mobile**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-20T23:07:18Z
- **Completed:** 2026-02-21T00:10:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced custom page-translate scroll machinery (viewportRef, trackRef, ResizeObserver, measure, clampPage, applyTranslate) with Embla's useEmblaCarousel in all three components
- Slide containers now use flex-[0_0_calc(50%-12px)] ensuring exactly 2 cards visible at 375px mobile without overflow
- Touch swipe works natively on mobile via Embla — zero custom onTouchStart/onTouchMove event handlers
- Arrow buttons hidden on mobile (hidden lg:flex), always visible on desktop, disappear completely at first/last slide via conditional rendering
- Page dot indicators driven by scrollSnapList/selectedScrollSnap Embla APIs

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate CollectionCarousel and Top10Carousel to Embla** - `8baf4cb` (feat)
2. **Task 2: Migrate GenreCardList to Embla** - `5ea0ccd` (feat)

## Files Created/Modified
- `frontend/src/components/media/carousel/CollectionCarousel.tsx` - Rewritten with Embla, flex-basis slide widths, conditional arrows
- `frontend/src/components/media/carousel/Top10Carousel.tsx` - Rewritten with Embla, mediaType reset via scrollTo(0)
- `frontend/src/components/media/carousel/GenreCardList.tsx` - Rewritten with Embla, 5-up layout on lg desktop
- `frontend/src/components/media/cards/CollectionCard.tsx` - w-lg changed to w-full (fills slide container)
- `frontend/src/components/media/cards/GenreCard.tsx` - w-md changed to w-full (fills slide container)

## Decisions Made
- Slide width formula: `flex-[0_0_calc(50%-12px)]` with `gap-6` (24px gap) — 2 slides at 50% minus half the gap each = exactly fills viewport
- Arrow visibility: conditional rendering (`{prevBtnEnabled && <button>}`) rather than CSS opacity/disabled so no ghost/grayed state
- Card components updated to `w-full` — the slide container is the layout authority, not the card itself
- GenreCardList gets 5-up at `lg` breakpoint vs 4-up for media carousels (genre cards are square/smaller)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CollectionCard.tsx: w-lg changed to w-full**
- **Found during:** Task 1 (Migrate CollectionCarousel)
- **Issue:** CollectionCard Link had hardcoded `w-lg` — card would render at fixed ~512px width regardless of the flex-basis slide container, causing overflow or undersized card at mobile
- **Fix:** Changed `w-lg` to `w-full` on CollectionCard's Link element so the card fills its Embla slide container
- **Files modified:** frontend/src/components/media/cards/CollectionCard.tsx
- **Verification:** TypeScript typecheck passes, no new errors
- **Committed in:** 8baf4cb (Task 1 commit)

**2. [Rule 1 - Bug] GenreCard.tsx: w-md changed to w-full**
- **Found during:** Task 2 (Migrate GenreCardList)
- **Issue:** GenreCard Link had hardcoded `w-md` — card would render at fixed ~448px width rather than filling the responsive slide container
- **Fix:** Changed `w-md` to `w-full` on GenreCard's Link element
- **Files modified:** frontend/src/components/media/cards/GenreCard.tsx
- **Verification:** TypeScript typecheck passes, no new errors
- **Committed in:** 5ea0ccd (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes essential for correct layout — without them the cards would overflow their Embla slide containers on mobile. No scope creep.

## Issues Encountered
- Working tree contained pre-existing modifications to UpcomingCarousel.tsx and WatchProviderCarousel.tsx (already migrated to Embla by a prior session). These were not part of this plan and were committed separately as `feat(03-02)` without interference.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Three of the six carousels on the home page now use Embla with native touch swipe
- CollectionCard and GenreCard are now width-agnostic (w-full) — safe to use in any flex/grid layout
- TrendingCarousel, UpcomingCarousel, and WatchProviderCarousel were already migrated in prior session (03-02/03-03)
- Home page carousels fully mobile-swipeable after this plan

## Self-Check: PASSED

- FOUND: frontend/src/components/media/carousel/CollectionCarousel.tsx
- FOUND: frontend/src/components/media/carousel/Top10Carousel.tsx
- FOUND: frontend/src/components/media/carousel/GenreCardList.tsx
- FOUND: frontend/src/components/media/cards/CollectionCard.tsx
- FOUND: frontend/src/components/media/cards/GenreCard.tsx
- FOUND: .planning/phases/03-carousels/03-01-SUMMARY.md
- FOUND: commit 8baf4cb (feat(03-01): migrate CollectionCarousel and Top10Carousel to Embla)
- FOUND: commit 5ea0ccd (feat(03-01): migrate GenreCardList to Embla)

---
*Phase: 03-carousels*
*Completed: 2026-02-21*
