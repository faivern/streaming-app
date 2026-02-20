# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Every page of Cinelas looks intentional and feels native at any screen width — nothing overflows, nothing is an afterthought.
**Current focus:** Phase 3 — Carousels (v1.1 Full Responsiveness milestone)

## Current Position

Phase: 3 of 9 (Carousels)
Plan: 3 of 3 in current phase
Status: Plan complete
Last activity: 2026-02-21 — Completed Plan 03-03 (MediaCard hover popup guard, cast carousel scroll polish, cast card full-area tap target)

Progress: [███░░░░░░░] 18% (v1.1 milestone)

## Performance Metrics

**Velocity (prior milestone v1.0):**
- Total plans completed: 4
- Average duration: 135 sec
- Total execution time: 539 sec (8m 59s)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 1 (Insights) | 4 | 539s | 135s |
| Phase 2 (Foundation) | 2 | ~520s | ~260s |
| Phase 3 (Carousels) | 3 | ~125s | ~42s |

**Recent Trend:**
- Last 4 plans: 159s, 155s, 95s, 130s, 245s, ~65s (03-03)
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Phone-first breakpoints — phone must be perfect; tablet and desktop treated together
- [Roadmap]: Bottom navigation on mobile — native-feeling UX goal (not hamburger drawer)
- [Roadmap]: Use Embla Carousel for all 6 carousels — already installed, no new dependencies
- [02-01]: @theme breakpoints use rem not px — Tailwind 4 sorts breakpoints numerically; mixing units causes wrong sort order
- [02-01]: Z-index tokens in :root not @theme — @theme has no --z-* namespace; use z-(--z-*) syntax in TSX class attributes
- [Phase 02-02]: pb-safe uses env(safe-area-inset-bottom) directly; pb-safe-or-4 uses max(1rem,env()) for minimum floor
- [Phase 02-02]: mt-navbar-offset is canonical page top offset — all pages must use this, never hardcoded mt-20/24/28/32
- [Phase 02-02]: Fixed-bottom elements use pb-safe or pb-safe-or-4 to clear iOS home indicator
- [03-03]: hidden lg:block is canonical pattern for desktop-only floating UI — CSS guard is sufficient; no pointer event suppression needed
- [03-03]: No Embla migration for MediaCastCarousel — native overflow-x-auto confirmed adequate for iOS/Android touch scroll
- [03-03]: scrollbar-none lg:scrollbar removes mobile scrollbar while retaining desktop scrollbar using tailwind-scrollbar plugin

### Pending Todos

5 pending todos in `.planning/todos/pending/`

### Blockers/Concerns

- [Phase 4]: Bottom nav exact destinations (Home, Discover, My Lists, Profile) — confirm routing structure and auth state at planning time (low risk)
- [Phase 2]: RESOLVED — viewport-fit=cover was NOT present and has been added in Plan 02-01
- [Phase 3]: Confirm whether `embla-carousel-autoplay` package is installed (TrendingCarousel autoplay may require it)

## Session Continuity

Last session: 2026-02-21
Stopped at: Completed 03-03-PLAN.md — MediaCard hover popup guarded to desktop-only, cast carousel scroll polished, cast card full-area tap target expanded. Plan 03-03 complete.
Resume file: None
