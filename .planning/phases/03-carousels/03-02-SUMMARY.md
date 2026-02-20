---
phase: 03-carousels
plan: 02
subsystem: ui
tags: [react, embla-carousel, carousel, mobile, ios, dvh, viewport]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: iOS safe-area utilities and mt-navbar-offset token

provides:
  - Embla-powered UpcomingCarousel with 2-card responsive slide widths
  - Embla-powered WatchProviderCarousel with dragFree free-scroll logo scanning
  - Embla-powered TrendingCarousel with loop, autoplay, and dvh hero height

affects: [03-carousels, home-page, media-detail-page]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Embla slide width via flex-[0_0_calc(N%-gap)] min-w-0 shrink-0 instead of fixed w-lg"
    - "canScrollPrev/canScrollNext gates boundary-aware arrow buttons"
    - "dragFree: true for logo row carousels (no snap points); dragFree: false for poster carousels"
    - "dvh instead of vh for hero heights that must fill the iOS Safari dynamic viewport"

key-files:
  created: []
  modified:
    - frontend/src/components/media/carousel/UpcomingCarousel.tsx
    - frontend/src/components/media/carousel/WatchProviderCarousel.tsx
    - frontend/src/components/media/carousel/TrendingCarousel.tsx

key-decisions:
  - "TrendingCarousel uses loop: true to preserve existing wrap-around behavior"
  - "WatchProviderCarousel uses dragFree: true — logo rows scan better without snap points"
  - "UpcomingCarousel shows scroll-snap dots only when snap count is <= 10 (reasonable dot count)"
  - "TrendingCarousel autoplay implemented with window.setInterval + emblaApi.scrollNext (no separate plugin needed)"
  - "dvh viewport unit replaces vh in TrendingCarousel hero to fix iOS Safari toolbar clipping"

patterns-established:
  - "Embla migration pattern: remove viewportRef/trackRef/measure/ResizeObserver/page state; replace with emblaRef/emblaApi from useEmblaCarousel"
  - "Arrow buttons use hidden lg:flex on mobile-primary carousels; TrendingCarousel arrows always visible (hero context)"

requirements-completed: [CAR-03, CAR-04, CAR-06, CAR-07]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 3 Plan 02: Carousels (Upcoming, WatchProvider, Trending) Summary

**Three carousels migrated from custom page-translate to Embla Carousel; TrendingCarousel hero height fixed from vh to dvh for iOS Safari compatibility**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-20T23:07:31Z
- **Completed:** 2026-02-20T23:10:34Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- UpcomingCarousel and WatchProviderCarousel migrated to Embla with responsive flex-basis slide widths (no hardcoded w-lg)
- WatchProviderCarousel uses dragFree: true enabling free-scroll logo scanning; UpcomingCarousel uses snap behavior
- TrendingCarousel migrated to Embla with loop: true, 6-second autoplay via emblaApi.scrollNext(), and dvh hero heights

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate UpcomingCarousel and WatchProviderCarousel to Embla** - `051d931` (feat)
2. **Task 2: Migrate TrendingCarousel to Embla and fix dvh height** - `18db26a` (feat)

**Plan metadata:** TBD (docs: complete plan)

## Files Created/Modified
- `frontend/src/components/media/carousel/UpcomingCarousel.tsx` - Migrated to useEmblaCarousel; slides use flex-[0_0_calc(50%-12px)] at mobile scaling to 25% at lg; arrows hidden on mobile
- `frontend/src/components/media/carousel/WatchProviderCarousel.tsx` - Migrated to useEmblaCarousel with dragFree: true; 4 logos at 375px, 5 at tablet, 8+ at desktop; page-dot indicators removed
- `frontend/src/components/media/carousel/TrendingCarousel.tsx` - Migrated to useEmblaCarousel loop: true; hero heights use dvh (60/65/75/78 at xs/md/lg/xl); autoplay via window.setInterval + emblaApi.scrollNext

## Decisions Made
- TrendingCarousel uses loop: true (preserves original wrap-around behavior; no boundary arrows needed)
- dvh replaces vh in all four hero height responsive variants — fixes iOS Safari clipping when browser toolbar is visible
- WatchProviderCarousel removes page-dot indicators (17 providers produce too many dots; free-scroll doesn't use snap points)
- UpcomingCarousel shows scroll-snap dots only when snap count is <= 10 (reasonable number for the dot UI)
- Autoplay implemented inline with window.setInterval + emblaApi.scrollNext — no embla-carousel-autoplay plugin needed

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- UpcomingCarousel, WatchProviderCarousel, and TrendingCarousel all use Embla and support native touch swipe on mobile
- Phase 03 plan 03-01 (CollectionCarousel, Top10Carousel, GenreCardList) has uncommitted in-progress work visible in working tree — those files need to be committed as part of plan 03-01 execution
- All carousel Embla patterns established and consistent across plans 03-01 and 03-02

## Self-Check: PASSED

- FOUND: frontend/src/components/media/carousel/UpcomingCarousel.tsx
- FOUND: frontend/src/components/media/carousel/WatchProviderCarousel.tsx
- FOUND: frontend/src/components/media/carousel/TrendingCarousel.tsx
- FOUND: .planning/phases/03-carousels/03-02-SUMMARY.md
- FOUND commit: 051d931 (Task 1)
- FOUND commit: 18db26a (Task 2)
- FOUND commit: e47d1e6 (metadata)

---
*Phase: 03-carousels*
*Completed: 2026-02-20*
