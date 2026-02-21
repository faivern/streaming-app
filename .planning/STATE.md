# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Every page of Cinelas looks intentional and feels native at any screen width — nothing overflows, nothing is an afterthought.
**Current focus:** Phase 4 — Navigation (v1.1 Full Responsiveness milestone)

## Current Position

Phase: 4 of 9 (Navigation)
Plan: 2 of 2 in current phase — COMPLETE
Status: Phase complete
Last activity: 2026-02-21 — Completed Plan 04-02 (Navbar mobile drawer migrated to Headless UI Dialog — iOS scroll lock via position:fixed, Escape key, backdrop click, and focus trap handled by Dialog internally). Human visual verification approved.

Progress: [████░░░░░░] 26% (v1.1 milestone)

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
| Phase 3 (Carousels) | 3 | ~313s | ~104s |
| Phase 4 (Navigation) | 2 | ~1194s | ~597s |

**Recent Trend:**
- Last 4 plans: 159s, 155s, 95s, 130s, 245s, ~65s (03-03), ~188s (03-01)
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
- [03-01]: Slide containers use flex-[0_0_calc(50%-12px)] with gap-6 — 2-up at 375px mobile for CollectionCarousel, Top10Carousel, GenreCardList
- [03-01]: Card components (CollectionCard, GenreCard) updated to w-full — slide container is layout authority, not the card
- [03-01]: Arrow buttons render conditionally (not disabled) so no grayed-out state at slide boundaries
- [03-02]: TrendingCarousel uses loop: true — Embla wraps around seamlessly, no custom modulo arithmetic needed
- [03-02]: WatchProviderCarousel uses dragFree: true — logo rows scan better without snap points; arrows still work with scrollNext/scrollPrev
- [03-02]: dvh replaces vh in TrendingCarousel hero heights — fixes iOS Safari clipping when browser toolbar is visible
- [03-02]: TrendingCarousel autoplay uses window.setInterval + emblaApi.scrollNext inline — no embla-carousel-autoplay plugin required
- [03-03]: hidden lg:block is canonical pattern for desktop-only floating UI — CSS guard is sufficient; no pointer event suppression needed
- [03-03]: No Embla migration for MediaCastCarousel — native overflow-x-auto confirmed adequate for iOS/Android touch scroll
- [03-03]: scrollbar-none lg:scrollbar removes mobile scrollbar while retaining desktop scrollbar using tailwind-scrollbar plugin
- [04-01]: BottomNav uses z-(--z-sticky) not z-(--z-dialog) — persistent chrome shares header stacking layer, not temporary overlay layer
- [04-01]: end prop required on NavLink to="/" — without it Home tab highlights active on every route
- [04-01]: pb-bottom-nav on <main> in App.tsx is single catch-all content clearance — no per-page adjustments needed for standard pages
- [04-01]: MyListsPage FAB removes pb-safe — bottom nav pb-safe-or-4 already clears iOS home indicator; FAB only needs to clear nav height
- [04-02]: Headless UI Dialog uses position:fixed for scroll lock — correct iOS Safari strategy vs document.body.style.overflow which is silently ignored
- [04-02]: Dialog v1 API enforced (Transition.Root, Transition.Child, Dialog.Panel) — matches all 11 existing Dialog usages; mixing v1/v2 APIs causes TypeScript errors
- [04-02]: Dialog handles Escape key and backdrop click via onClose — no manual event listeners needed in components

### Pending Todos

5 pending todos in `.planning/todos/pending/`

### Blockers/Concerns

- [Phase 4]: Bottom nav exact destinations (Home, Discover, My Lists, Profile) — confirm routing structure and auth state at planning time (low risk)
- [Phase 2]: RESOLVED — viewport-fit=cover was NOT present and has been added in Plan 02-01
- [Phase 3]: RESOLVED — embla-carousel-autoplay not needed; TrendingCarousel autoplay implemented inline with window.setInterval

## Session Continuity

Last session: 2026-02-21
Stopped at: Completed 04-02-PLAN.md — Navbar mobile drawer migrated to Headless UI Dialog. Phase 04 (Navigation) all plans complete.
Resume file: None
