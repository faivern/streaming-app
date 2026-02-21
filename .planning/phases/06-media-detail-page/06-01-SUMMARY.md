---
phase: 06-media-detail-page
plan: 01
subsystem: ui
tags: [react, typescript, tailwind, dvh, mobile-first, media-detail]

# Dependency graph
requires:
  - phase: 05-modals-and-filters
    provides: dvh established as canonical unit, overscroll-contain patterns
provides:
  - Full-bleed h-[40dvh] backdrop hero section at top of MediaDetailPage
  - Overview expand/collapse toggle (line-clamp-3 + sm:line-clamp-none) in MediaDetailHeader
  - Keywords collapse toggle (sm:hidden button, sm:block div) in MediaDetails
  - MediaDetailVideo repositioned below WatchProviders in labeled "Watch Trailer" section
  - Elimination of nested <main> element — MediaDetailHeader root changed to <section>
affects:
  - 06-02 (poster actions, cast row — shares MediaDetailPage structure)
  - 06-03 (further detail page enhancements)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "sm:line-clamp-none overrides line-clamp-3 on desktop — no JS window.innerWidth needed"
    - "sm:hidden button + sm:block content wrapper — toggle visible on mobile only, content always on desktop"
    - "h-[40dvh] full-bleed hero — established dvh pattern from phase 3/5 applied to page-level hero"
    - "bg-gradient-to-t from-[hsl(224,37%,12%)] — Blizzard theme background token for gradient fade"

key-files:
  created: []
  modified:
    - frontend/src/pages/detailPage/MediaDetailPage.tsx
    - frontend/src/components/media/detail/MediaDetailHeader.tsx
    - frontend/src/components/media/detail/MediaDetails.tsx

key-decisions:
  - "MediaDetailHeader root changed from <main> to <section> — fixes nested <main> HTML validity error"
  - "sm:line-clamp-none is canonical pattern for mobile-only truncation — overrides line-clamp-3 at sm+ breakpoint without JS"
  - "MediaDetailVideo moved below WatchProviders — trailer widget now at logical position after watch options, not top of page"
  - "Keywords collapse uses hidden/block conditional class on wrapper, sm:block always visible — single toggle state drives mobile only"
  - "h-[40dvh] in hero section — consistent with established dvh pattern from Phase 3 (TrendingCarousel) and Phase 5"

patterns-established:
  - "Mobile collapse pattern: sm:hidden toggle button + sm:block wrapper div — drives content visibility on mobile only"
  - "Overview truncation: line-clamp-3 + sm:line-clamp-none on <p> + sm:hidden toggle button — no JS breakpoint detection"

requirements-completed: [DETAIL-01, DETAIL-02]

# Metrics
duration: 3min
completed: 2026-02-21
---

# Phase 6 Plan 01: Media Detail Page — Mobile-First Layout Summary

**Full-bleed h-[40dvh] backdrop hero, repositioned trailer widget, overview line-clamp expand toggle, and keywords collapse toggle for mobile-first media detail page layout**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-21T00:05:60Z
- **Completed:** 2026-02-21T00:08:48Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Full-bleed backdrop hero section (`h-[40dvh]`) with Blizzard gradient fade at page top
- MediaDetailHeader root changed to `<section>` — eliminates nested `<main>` HTML validity issue
- Overview text truncates to 3 lines on mobile with a `sm:hidden` Show more/Show less toggle; full text always shown on sm+ via `sm:line-clamp-none`
- Keywords row in MediaDetails collapses behind a `sm:hidden` toggle button on mobile; always visible on desktop via `sm:block`
- MediaDetailVideo repositioned from top of page to labeled "Watch Trailer" section below WatchProviders

## Task Commits

Each task was committed atomically:

1. **Task 1: Restructure MediaDetailPage with full-bleed backdrop hero and repositioned trailer** - `31288fa` (feat)
2. **Task 2: Refactor MediaDetailHeader — remove nested main, add overview expand toggle** - `ff55692` (feat)
3. **Task 3: Add keywords collapse toggle on mobile to MediaDetails** - `7f0425a` (feat)

## Files Created/Modified

- `frontend/src/pages/detailPage/MediaDetailPage.tsx` - Full-bleed backdrop hero section added, MediaDetailVideo moved to labeled section below WatchProviders, separator div removed
- `frontend/src/components/media/detail/MediaDetailHeader.tsx` - Root changed to `<section>`, `useState` added for overview expand, `line-clamp-3 sm:line-clamp-none` with `sm:hidden` toggle button
- `frontend/src/components/media/detail/MediaDetails.tsx` - `useState` added for keywords expand, `sm:hidden` toggle button wraps Keywords DetailRow with `sm:block` wrapper

## Decisions Made

- `sm:line-clamp-none` overrides `line-clamp-3` at sm+ breakpoint — avoids `window.innerWidth` JS check (SSR-unfriendly). Single conditional class with `overviewExpanded` drives mobile behavior only.
- Keywords collapse uses `hidden/block` on wrapper div with `sm:block` always visible — same `sm:hidden` toggle button pattern, consistent with overview toggle approach.
- `h-[40dvh]` for hero — dvh is canonical unit established in Phase 3 (TrendingCarousel) and Phase 5 (modal max-h). Not `vh`.
- Gradient color `hsl(224,37%,12%)` matches Blizzard `--background` token hardcoded value — ensures seamless fade into page background.
- MediaDetailVideo kept in place internally (it still shows its own backdrop fallback in the Watch Trailer section) — no suppression of internal display needed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in `Credit[]` vs `CastMember[]`/`CrewMember[]` type mismatch in MediaDetailHeader (line numbers shifted from 111-112 to 121-122 due to added state). These errors existed before this plan's changes and are out of scope per deviation rules.

Pre-existing ESLint `react-hooks/rules-of-hooks` warnings in MediaDetailPage (hooks called after early return guard) — existed before changes, not introduced by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Full-bleed backdrop hero and vertical stack layout established — 06-02 poster actions and cast row can build on this structure
- `sm:hidden` collapse pattern is established and reusable for any future collapsible rows on mobile
- No blockers

## Self-Check: PASSED

- FOUND: frontend/src/pages/detailPage/MediaDetailPage.tsx
- FOUND: frontend/src/components/media/detail/MediaDetailHeader.tsx
- FOUND: frontend/src/components/media/detail/MediaDetails.tsx
- FOUND: .planning/phases/06-media-detail-page/06-01-SUMMARY.md
- FOUND commit: 31288fa (Task 1)
- FOUND commit: ff55692 (Task 2)
- FOUND commit: 7f0425a (Task 3)

---
*Phase: 06-media-detail-page*
*Completed: 2026-02-21*
