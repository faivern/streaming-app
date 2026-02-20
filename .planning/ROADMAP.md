# Roadmap: Cinelas — Full Responsiveness

## Milestones

- [x] **v0.0 Mobile Responsiveness Stub** - Phase 0 (initial plan created, superseded by v1.0)
- [x] **v1.0 List Insights Dashboard** - Phase 1 (shipped 2026-02-17)
- [ ] **v1.1 Full Responsiveness** - Phases 2–9 (in progress)

## Phases

<details>
<summary>Phase 0–1 (Complete)</summary>

### Phase 0: Mobile Responsiveness (Stub)
**Goal**: Initial mobile responsiveness planning document
**Status**: Superseded by v1.1 Full Responsiveness milestone (Phases 2–9)
**Plans**: 1 legacy plan (`.planning/phases/00-mobile-responsiveness/PLAN.md`)

### Phase 1: List Insights Dashboard
**Goal**: Build a static insights dashboard that analyzes a user's lists and presents visual data through a bento grid layout with glassmorphism cards — two views: per-list insights at `/list/:id/insights` and master insights aggregating all lists
**Depends on**: Phase 0
**Status**: Complete (2026-02-17)
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Types, aggregators, formatters, and Recharts chart wrappers
- [x] 01-02-PLAN.md — BentoGrid layout, glassmorphism cards, all 7 metric card components, empty/loading states
- [x] 01-03-PLAN.md — Data-fetching hooks (useListInsights, useMasterInsights) with TMDB enrichment
- [x] 01-04-PLAN.md — Insights pages, routing, and entry points in lists UI

</details>

### v1.1 Full Responsiveness (In Progress)

**Milestone Goal:** Every page of Cinelas looks intentional and feels native at any screen width from 375px phones to 2560px+ desktops — nothing overflows, nothing is an afterthought.

## Summary Checklist

- [x] **Phase 2: Foundation** - Global CSS config, viewport meta, and z-index tokens that every subsequent phase depends on (completed 2026-02-20)
- [ ] **Phase 3: Carousels** - Migrate all six carousels to Embla with touch swipe; fix media card overflow and hover behavior
- [ ] **Phase 4: Navigation** - Add persistent bottom nav bar on mobile; fix iOS scroll lock in mobile menu
- [ ] **Phase 5: Modals and Filters** - Bottom-sheet pattern for all modals and overlays; filter panels functional at 375px
- [ ] **Phase 6: Media Detail Page** - Complete vertical-stack layout, chip wrap, and touch-target fixes on the detail page
- [ ] **Phase 7: Lists Page** - Resolve FAB/bottom-nav conflict; audit list item touch targets and column layout
- [ ] **Phase 8: Secondary Pages and Insights** - Audit and fix all remaining pages: credits, genre, collection, providers, legal, insights
- [ ] **Phase 9: Global Polish** - Typography sweep, CLS fixes, touch-target sweep, spacing consistency, and full device matrix test

## Phase Details

### Phase 2: Foundation
**Goal**: The global CSS shell is correct and iOS-safe — every subsequent phase can build on a reliable breakpoint system, viewport height, safe-area support, and z-index scale
**Depends on**: Phase 1
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06
**Success Criteria** (what must be TRUE):
  1. Custom breakpoints `3xl` and `4xl` apply correctly — a 1920px+ viewport receives `3xl:` prefixed styles (previously silently ignored in Tailwind CSS 4)
  2. The app shell fills the visible viewport on iOS Safari without content hiding behind the browser chrome (verifiable by loading on iPhone with Safari toolbar visible)
  3. Safe-area padding is applied to all fixed-bottom elements — content does not overlap the iPhone home indicator
  4. A consistent z-index token table exists in CSS `@theme` — no ad-hoc numeric z-values for new layers added in this milestone
  5. Navbar offset margins across pages are driven by a single CSS variable, not scattered `mt-20`/`mt-24` hardcodes
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Breakpoints in @theme, viewport-fit=cover, min-h-dvh replacement, z-index token table
- [ ] 02-02-PLAN.md — Safe-area pb-safe utilities on fixed-bottom elements, mt-navbar-offset token, Splide removal

### Phase 3: Carousels
**Goal**: Every carousel in the app is touch-native — users can swipe horizontally to browse content on a 375px phone without cards overflowing the viewport
**Depends on**: Phase 2
**Requirements**: CAR-01, CAR-02, CAR-03, CAR-04, CAR-05, CAR-06, CAR-07, CARD-01, CARD-02
**Success Criteria** (what must be TRUE):
  1. A user on a 375px phone can swipe left/right on any carousel (CollectionCarousel, Top10Carousel, UpcomingCarousel, WatchProviderCarousel, GenreCardList, TrendingCarousel) and cards snap correctly
  2. No carousel card overflows the horizontal viewport — hardcoded `w-lg`/`w-md` fixed widths are replaced with viewport-relative sizing
  3. Tapping a media card on a touch device navigates correctly without first showing the hover tooltip popup
  4. All media card tap targets (poster, title, action buttons) meet the 44px minimum on mobile
**Plans**: 3 plans

Plans:
- [ ] 03-01-PLAN.md — Migrate CollectionCarousel, Top10Carousel, and GenreCardList to Embla with viewport-relative slide widths
- [ ] 03-02-PLAN.md — Migrate UpcomingCarousel, WatchProviderCarousel, and TrendingCarousel to Embla; fix TrendingCarousel hero height (dvh)
- [x] 03-03-PLAN.md — Guard MediaCardModal to desktop-only (hidden lg:block); audit MediaCastCarousel and MediaCastCard touch targets

### Phase 4: Navigation
**Goal**: Mobile users navigate the app through a native-feeling bottom tab bar — the hamburger drawer is replaced as the primary mobile navigation pattern
**Depends on**: Phase 2
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. A persistent bottom navigation bar is visible on screens below the `md` breakpoint with correct active-state indicators for the current route
  2. The mobile menu (when opened) locks scroll correctly on iOS — the page behind does not scroll
  3. Both the top bar (desktop) and bottom bar (mobile) are present simultaneously and neither overlaps app content at any breakpoint
**Plans**: TBD

Plans:
- [ ] 04-01: Build BottomNav component with safe-area padding, z-index token, and React Router active state; hide at `lg:`
- [ ] 04-02: Migrate Navbar mobile drawer to Headless UI Dialog for correct iOS scroll lock

### Phase 5: Modals and Filters
**Goal**: All modals and filter panels behave as bottom sheets on mobile — no centered desktop overlays clip content on a 375px screen
**Depends on**: Phase 4
**Requirements**: MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, DISC-01, DISC-02, DISC-03
**Success Criteria** (what must be TRUE):
  1. MediaModal presents as a bottom sheet on mobile — it does not render as a centered overlay that clips off-screen at 375px
  2. All Headless UI Dialog modals (AddToListModal, CreateListModal, EditListModal, DeleteConfirmModal) use `max-h-[90dvh]` and do not overflow the visible viewport
  3. Scrolling inside any modal does not scroll the background page
  4. The filter/discover panel is fully usable at 375px — all inputs and dropdowns have at least 44px touch targets
  5. Searching on mobile does not cause a layout jump when the virtual keyboard appears
**Plans**: TBD

Plans:
- [ ] 05-01: Apply bottom-sheet pattern to MediaModal; update all Dialog.Panel instances to `max-h-[90dvh]`; add `overscroll-behavior: contain` to modal scroll areas
- [ ] 05-02: Audit and fix filter/discover panel (DISC-01–03): touch targets, full-screen takeover, search keyboard avoidance
- [ ] 05-03: Fix click-outside handlers to respond to touch events (MOD-05); add drag handle bars to list modals

### Phase 6: Media Detail Page
**Goal**: The media detail page is fully usable on a 375px phone — content stacks vertically, chips and badges wrap correctly, and the cast row is swipeable
**Depends on**: Phase 3
**Requirements**: DETAIL-01, DETAIL-02, DETAIL-03
**Success Criteria** (what must be TRUE):
  1. On a 375px phone, the poster and hero backdrop stack vertically — they do not render side-by-side
  2. Genre chips, rating badges, and action buttons wrap to additional lines rather than overflowing the viewport edge
  3. The cast row is horizontally swipeable on mobile without cards clipping the viewport edge
**Plans**: TBD

Plans:
- [ ] 06-01: Fix MediaMetaChips flex-wrap, MediaPosterActions touch targets, MediaDetails cast/keyword overflow; verify MediaDetailVideo at 375px; audit Poster.tsx and Backdrop.tsx for CLS

### Phase 7: Lists Page
**Goal**: The lists page is fully usable on mobile — the FAB does not conflict with the bottom nav, and list items are readable and tappable at 375px
**Depends on**: Phase 4
**Requirements**: LIST-01, LIST-02, LIST-03
**Success Criteria** (what must be TRUE):
  1. The create-list action is accessible on mobile without being hidden by or conflicting with the bottom navigation bar
  2. List item cards are readable and tappable at 375px — text is legible and tap targets meet 44px
  3. The lists sidebar/drawer opens and closes correctly on mobile
**Plans**: TBD

Plans:
- [ ] 07-01: Resolve FAB/bottom-nav conflict; audit ListGridView column count, ListRowItem touch targets, ListHeader layout; add overscroll containment to list scroll containers

### Phase 8: Secondary Pages and Insights
**Goal**: Every remaining page in the app is functional and readable at 375px — no pages are left with unaudited desktop-only layouts
**Depends on**: Phase 2
**Requirements**: INS-01, INS-02, INS-03, SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):
  1. The insights dashboard renders in a single-column layout on mobile — BentoGrid cards stack vertically and are readable
  2. Recharts charts on the insights page render correctly at mobile widths without overflow or clipping
  3. The credits page grid collapses to 2-column on mobile and cast/crew tabs have adequate touch targets
  4. Genre, collection, provider, and person detail pages display their hero sections and content correctly at 375px
  5. Legal pages (Privacy Policy, Terms of Service) are readable at 375px with no horizontal overflow
**Plans**: TBD

Plans:
- [ ] 08-01: Insights page audit — BentoGrid single-column, Recharts ResponsiveContainer, typography at 375px
- [ ] 08-02: Credits page and person detail page audit — grid collapse, tab touch targets
- [ ] 08-03: Genre, collection, provider, and legal pages audit — hero sections and content layout at 375px

### Phase 9: Global Polish
**Goal**: The entire app is visually consistent and pixel-clean across all breakpoints — zero horizontal overflow at root causes, consistent spacing, correct CLS behavior, and full touch-target compliance on every page
**Depends on**: Phases 2–8
**Requirements**: POL-01, POL-02, POL-03, POL-04, POL-05
**Success Criteria** (what must be TRUE):
  1. No page produces horizontal scrolling at 375px — root causes are fixed, not masked with `overflow-x: hidden`
  2. Every interactive element (button, link, icon button) meets the 44px minimum touch target on all pages
  3. Full-screen images have explicit `aspect-ratio` or `width`/`height` attributes — no layout shift on image load
  4. Horizontal page padding is consistent at each breakpoint across all pages
  5. The app is manually verified at 375px, 768px, 1440px, and 2560px widths — all breakpoints render without broken elements
**Plans**: TBD

Plans:
- [ ] 09-01: Typography and touch-target sweep across all pages; spacing consistency pass with standardized page padding variable
- [ ] 09-02: Image CLS audit (Poster.tsx, Backdrop.tsx), skeleton state sizing audit, full device matrix test

## Progress

**Execution Order:**
2 → 3 → 4 → 5 → 6 → 7 → 8 → 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 2. Foundation | 2/2 | Complete    | 2026-02-20 |
| 3. Carousels | 1/3 | In Progress|  |
| 4. Navigation | 0/2 | Not started | - |
| 5. Modals and Filters | 0/3 | Not started | - |
| 6. Media Detail Page | 0/1 | Not started | - |
| 7. Lists Page | 0/1 | Not started | - |
| 8. Secondary Pages and Insights | 0/3 | Not started | - |
| 9. Global Polish | 0/2 | Not started | - |
