# Requirements: Cinelas — Full Responsiveness

**Defined:** 2026-02-20
**Core Value:** Every page of Cinelas looks intentional and feels native at any screen width — nothing overflows, nothing is an afterthought.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Global CSS defines `3xl` and `4xl` custom breakpoints in `@theme` (currently silently ignored in Tailwind CSS 4)
- [x] **FOUND-02**: All full-height containers use `min-h-dvh` instead of `min-h-screen` / `100vh` (fixes iOS Safari toolbar clipping)
- [x] **FOUND-03**: `index.html` viewport meta includes `viewport-fit=cover` for notch/safe-area support
- [x] **FOUND-04**: All bottom-edge fixed elements apply `env(safe-area-inset-bottom)` padding
- [x] **FOUND-05**: A z-index token table is defined (replacing 9+ ad-hoc values) before bottom nav is added
- [x] **FOUND-06**: Hardcoded `mt-20`/`mt-24` navbar offsets are replaced with a consistent layout spacing variable

### Navigation

- [x] **NAV-01**: A persistent bottom navigation bar replaces the current mobile nav on screens below `md`
- [x] **NAV-02**: Mobile menu scroll-lock uses Headless UI Dialog (not `document.body.style.overflow`) to work on iOS
- [x] **NAV-03**: All pages render correctly with both top-bar (desktop) and bottom-bar (mobile) navigation present

### Carousels

- [x] **CAR-01**: `CollectionCarousel` migrated to Embla with touch swipe and viewport-relative slide widths
- [x] **CAR-02**: `Top10Carousel` migrated to Embla with touch swipe and viewport-relative slide widths
- [x] **CAR-03**: `UpcomingCarousel` migrated to Embla with touch swipe and viewport-relative slide widths
- [x] **CAR-04**: `WatchProviderCarousel` migrated to Embla with touch swipe
- [x] **CAR-05**: `GenreCardList` migrated to Embla or CSS scroll-snap with touch swipe
- [x] **CAR-06**: `TrendingCarousel` hero has touch swipe and uses `svh`/`dvh` for height
- [x] **CAR-07**: No carousel card overflows a 375px viewport (hardcoded `w-lg`/`w-md` widths removed)

### Media Cards & Hover Interactions

- [x] **CARD-01**: `MediaCard` hover tooltip (`MediaCardModal`) is hidden on touch devices (`hidden lg:block`) — no accidental API calls or navigation on tap
- [x] **CARD-02**: All media card tap targets meet ≥44px minimum (covers poster, title, and action buttons)

### Modals & Overlays

- [x] **MOD-01**: `MediaModal` (media detail overlay) presents as a bottom sheet on mobile, not a centered desktop overlay
- [x] **MOD-02**: `AddToListModal` and all Headless UI Dialog instances use `max-h-[90dvh]` not `max-h-[90vh]`
- [x] **MOD-03**: `MobileFilterDrawer` bottom-sheet pattern applied consistently to all filter/discover modals
- [x] **MOD-04**: Modal scroll areas use `overscroll-behavior: contain` to prevent background page scroll
- [x] **MOD-05**: Click-outside handlers on all modals/dropdowns respond to touch events (not mouse-only)

### Media Detail Page

- [x] **DETAIL-01**: Media detail page layout stacks vertically on mobile (poster + hero stacked, not side-by-side)
- [x] **DETAIL-02**: Genre chips, rating badges, and action buttons wrap correctly on 375px without overflow
- [x] **DETAIL-03**: Cast row is horizontally scrollable on mobile with touch swipe

### Discover & Filters

- [x] **DISC-01**: Filter panel is fully usable on 375px (full-screen takeover or bottom drawer pattern)
- [x] **DISC-02**: Filter/sort dropdowns have ≥44px touch targets
- [x] **DISC-03**: Search input autofocus on mobile avoids layout jump (uses `visualViewport` or `dvh` scroll positioning)

### Lists Page

- [x] **LIST-01**: Lists page sidebar/drawer works correctly on mobile
- [x] **LIST-02**: FAB (floating action button) does not conflict with bottom navigation bar
- [x] **LIST-03**: List item cards are readable and tappable at 375px

### Insights Page

- [x] **INS-01**: BentoGrid insight cards adapt to single-column layout on mobile
- [x] **INS-02**: Recharts `ResponsiveContainer` charts render correctly at mobile widths
- [x] **INS-03**: Insight page typography is readable at 375px

### Secondary Pages

- [x] **SEC-01**: Credits page (cast/crew) is responsive — grid adapts from multi-column to 2-column on mobile
- [x] **SEC-02**: Genre detail page is responsive
- [x] **SEC-03**: Collection page is responsive
- [x] **SEC-04**: Provider and providers list pages are responsive
- [x] **SEC-05**: Legal pages (Privacy Policy, Terms of Service) are readable on mobile
- [x] **SEC-06**: Person detail page is responsive

### Global Polish

- [ ] **POL-01**: Zero horizontal overflow at 375px on all pages (no `overflow-x: hidden` hacks — fix root causes)
- [ ] **POL-02**: All interactive elements (buttons, links, icon buttons) have ≥44px touch targets
- [ ] **POL-03**: All full-screen images use explicit `width`/`height` or `aspect-ratio` to prevent CLS
- [ ] **POL-04**: Horizontal spacing is consistent across all pages at each breakpoint
- [ ] **POL-05**: App is visually tested at 375px, 768px, 1440px, and 2560px widths

## v2 Requirements

### Advanced Mobile Interactions

- **ADV-01**: Swipe-to-dismiss gesture on bottom-sheet modals
- **ADV-02**: Long-press context menu on media cards (add to list, mark watched)
- **ADV-03**: Pull-to-refresh on discovery feeds
- **ADV-04**: Haptic feedback on key interactions (progressive enhancement)
- **ADV-05**: Sticky category tab row on home page

## Out of Scope

| Feature | Reason |
|---------|--------|
| New features or UI components | Scope is responsiveness only — no new product features |
| Backend changes | All work is frontend (Tailwind, component layout, CSS) |
| Native mobile app (iOS/Android) | Web-only |
| Splide carousel usage | Embla is already the right choice — Splide is unused dead weight |
| `@tailwindcss/container-queries` plugin | Tailwind CSS 4 has native container query support — plugin not needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 2 | Complete |
| FOUND-02 | Phase 2 | Complete |
| FOUND-03 | Phase 2 | Complete |
| FOUND-04 | Phase 2 | Complete |
| FOUND-05 | Phase 2 | Complete |
| FOUND-06 | Phase 2 | Complete |
| NAV-01 | Phase 4 | Complete |
| NAV-02 | Phase 4 | Complete |
| NAV-03 | Phase 4 | Complete |
| CAR-01 | Phase 3 | Complete |
| CAR-02 | Phase 3 | Complete |
| CAR-03 | Phase 3 | Complete |
| CAR-04 | Phase 3 | Complete |
| CAR-05 | Phase 3 | Complete |
| CAR-06 | Phase 3 | Complete |
| CAR-07 | Phase 3 | Complete |
| CARD-01 | Phase 3 | Complete |
| CARD-02 | Phase 3 | Complete |
| MOD-01 | Phase 5 | Complete |
| MOD-02 | Phase 5 | Complete |
| MOD-03 | Phase 5 | Complete |
| MOD-04 | Phase 5 | Complete |
| MOD-05 | Phase 5 | Complete |
| DETAIL-01 | Phase 6 | Complete |
| DETAIL-02 | Phase 6 | Complete |
| DETAIL-03 | Phase 6 | Complete |
| DISC-01 | Phase 5 | Complete |
| DISC-02 | Phase 5 | Complete |
| DISC-03 | Phase 5 | Complete |
| LIST-01 | Phase 7 | Complete |
| LIST-02 | Phase 7 | Complete |
| LIST-03 | Phase 7 | Complete |
| INS-01 | Phase 8 | Complete |
| INS-02 | Phase 8 | Complete |
| INS-03 | Phase 8 | Complete |
| SEC-01 | Phase 8 | Complete |
| SEC-02 | Phase 8 | Complete |
| SEC-03 | Phase 8 | Complete |
| SEC-04 | Phase 8 | Complete |
| SEC-05 | Phase 8 | Complete |
| SEC-06 | Phase 8 | Complete |
| POL-01 | Phase 9 | Pending |
| POL-02 | Phase 9 | Pending |
| POL-03 | Phase 9 | Pending |
| POL-04 | Phase 9 | Pending |
| POL-05 | Phase 9 | Pending |

**Coverage:**
- v1 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 — traceability updated after roadmap creation (Phases 2–9)*
