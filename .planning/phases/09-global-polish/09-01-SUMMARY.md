---
phase: 09-global-polish
plan: 01
subsystem: ui
tags: [react, tailwindcss, responsive, touch-targets, cls, z-index, mobile]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: z-index CSS custom property token table (--z-sticky, --z-drawer, etc.) and px-page utility

provides:
  - px-page utility token in @layer utilities with responsive md: override
  - Standardized page-level horizontal padding across MediaGrid and legal pages
  - 44px touch targets on Navbar hamburger and close buttons
  - Tappable BottomNav profile link for logged-in users (Link to /lists)
  - 44px WatchProviders Listbox.Option rows (py-3)
  - CLS prevention via aspect-video on Backdrop img and aspect-[3/1] on EnhancedTitle/Logo img
  - Canonical z-(--z-*) tokens in Navbar, UserModal, SearchBar, MediaSimilarCard, DiscoverModal, MobileFilterDrawer

affects: [09-02-device-matrix-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "px-page utility: canonical horizontal page padding token, px-4 mobile / px-8 md+, replaces ad-hoc stepped scale"
    - "z-(--z-*) syntax: all z-index values reference CSS custom properties from :root token table"
    - "aspect-video / aspect-[3/1] on img: intrinsic aspect-ratio fallback prevents CLS before image loads"

key-files:
  created: []
  modified:
    - frontend/src/index.css
    - frontend/src/components/media/grid/MediaGrid.tsx
    - frontend/src/pages/detailPage/MediaDetailPage.tsx
    - frontend/src/pages/legal/PrivacyPolicy.tsx
    - frontend/src/pages/legal/TermsOfService.tsx
    - frontend/src/components/layout/Navbar.tsx
    - frontend/src/components/layout/BottomNav.tsx
    - frontend/src/components/media/WatchProviders.tsx
    - frontend/src/components/layout/UserModal.tsx
    - frontend/src/components/layout/SearchBar.tsx
    - frontend/src/components/media/cards/MediaSimilarCard.tsx
    - frontend/src/components/discover/DiscoverModal.tsx
    - frontend/src/components/discover/MobileFilterDrawer.tsx
    - frontend/src/components/media/shared/Backdrop.tsx
    - frontend/src/components/media/shared/EnhancedTitle.tsx

key-decisions:
  - "px-page utility registered in @layer utilities with media query override outside the layer block — Tailwind 4 @layer utilities cannot contain @media, responsive override lives outside"
  - "aspect-video on Backdrop img is additive — call-site className with explicit h-* overrides aspect-ratio when both height and aspect-ratio are present; CLS prevented without breaking existing usages"
  - "aspect-[3/1] on Logo img is additive — max-h-16 w-auto call-site classes continue to work; intrinsic ratio only applies before load"
  - "DiscoverModal z-50 -> z-(--z-modal) not z-(--z-dialog) — modal backdrop uses modal layer (140), dialog panel uses dialog layer (150)"

patterns-established:
  - "px-page: use this token on all page-level container wrappers instead of px-4 md:px-8 or stepped scale variants"
  - "z-(--z-*): never use z-50, z-[100], z-[9999] — always reference the CSS custom property table from tokens.css"
  - "CLS prevention: add aspect-ratio to all img elements that don't have explicit height set at the component level"

requirements-completed: [POL-01, POL-02, POL-03, POL-04]

# Metrics
duration: 2min
completed: 2026-02-25
---

# Phase 9 Plan 01: Global Polish — Spacing, Touch Targets, CLS, Z-index Summary

**px-page token, 44px touch targets, CLS-safe aspect-ratio on Backdrop/Logo, and z-index integer literals replaced with canonical z-(--z-*) tokens across 9 components**

## Performance

- **Duration:** 2 min (continuation — prior session completed Task 1)
- **Started:** 2026-02-25T09:55:17Z
- **Completed:** 2026-02-25T09:57:38Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments
- Added `px-page` utility token to `index.css` @layer utilities (px-4 mobile, px-8 md+) and applied it to MediaGrid, legal pages; MediaDetailPage loading state gets `mt-navbar-offset`
- Sweep of 8 components replaced all z-index integer/bracket literals (z-50, z-[100], z-[9999], z-[60]) with canonical z-(--z-*) tokens; Navbar hamburger and close buttons upgraded from p-2 to p-3; BottomNav profile changed from dead div to `<Link to="/lists">`; WatchProviders Listbox.Option rows upgraded from py-2 to py-3
- Backdrop.tsx img gets `aspect-video` fallback; EnhancedTitle/Logo img gets `aspect-[3/1]` fallback — both prevent CLS layout shift before image load

## Task Commits

Each task was committed atomically:

1. **Task 1: Add px-page token and fix spacing outliers** - `0aa7ba8` (feat)
2. **Task 2: Touch target sweep and z-index token adoption** - `4b29bf4` (feat)
3. **Task 3: CLS fixes for Backdrop and EnhancedTitle images** - `2b7cbcc` (feat)

## Files Created/Modified
- `frontend/src/index.css` - Added .px-page utility class and responsive md: media query override
- `frontend/src/components/media/grid/MediaGrid.tsx` - Replaced 6-step stepped padding scale with px-page on both return paths
- `frontend/src/pages/detailPage/MediaDetailPage.tsx` - Loading state gets mt-navbar-offset; inner WatchProviders/Watch Trailer wrappers deduplicated padding
- `frontend/src/pages/legal/PrivacyPolicy.tsx` - article element: px-6 -> px-page
- `frontend/src/pages/legal/TermsOfService.tsx` - article element: px-6 -> px-page (already applied in prior session)
- `frontend/src/components/layout/Navbar.tsx` - Hamburger p-2->p-3, close p-2->p-3; z-50->z-(--z-sticky), z-[100]->z-(--z-drawer)
- `frontend/src/components/layout/BottomNav.tsx` - Profile section: dead div -> Link to="/lists" with hover; Link imported
- `frontend/src/components/media/WatchProviders.tsx` - Listbox.Option py-2 -> py-3
- `frontend/src/components/layout/UserModal.tsx` - Panel z-50 -> z-(--z-dropdown), Listbox.Options z-50 -> z-(--z-dropdown)
- `frontend/src/components/layout/SearchBar.tsx` - z-[100]->z-(--z-searchbar), z-[110]->z-(--z-searchbar), z-[60]->z-(--z-overlay), z-[70]->z-(--z-drawer)
- `frontend/src/components/media/cards/MediaSimilarCard.tsx` - Hover z-[9999] -> z-(--z-dialog)
- `frontend/src/components/discover/DiscoverModal.tsx` - Dialog z-50 -> z-(--z-modal)
- `frontend/src/components/discover/MobileFilterDrawer.tsx` - Dialog z-[60] -> z-(--z-overlay)
- `frontend/src/components/media/shared/Backdrop.tsx` - img gets aspect-video as intrinsic 16:9 fallback
- `frontend/src/components/media/shared/EnhancedTitle.tsx` - img gets aspect-[3/1] as intrinsic 3:1 logo fallback

## Decisions Made
- `px-page` registered in `@layer utilities` with responsive override via `@media` block outside the layer — Tailwind 4 `@layer utilities` cannot contain `@media` directives directly
- `aspect-video` and `aspect-[3/1]` are additive class-string prefixes; call-site className values (h-*, max-h-*) continue to take effect when height is also specified
- DiscoverModal uses `z-(--z-modal)` (value: 140) not `z-(--z-dialog)` (value: 150) — modal backdrop/wrapper sits below the dialog panel layer

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors (`noUnusedLocals`, type mismatches) in unrelated files were detected by `npm run typecheck` but are out of scope per deviation rule scope boundary. They exist in files not touched by this plan. Logged to deferred items.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All POL-01 through POL-04 requirements satisfied
- Ready for 09-02 device matrix visual verification (human review at 375px, 768px, 1280px)
- Pre-existing TypeScript errors in unrelated files remain; recommend addressing before v1.1 release

---
*Phase: 09-global-polish*
*Completed: 2026-02-25*
