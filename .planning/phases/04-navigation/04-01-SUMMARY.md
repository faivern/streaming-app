---
phase: 04-navigation
plan: 01
subsystem: ui
tags: [react, react-router, tailwind, mobile, bottom-nav, css-tokens, navigation]

# Dependency graph
requires:
  - phase: 02-foundation
    provides: CSS token system (--navbar-height, :root tokens, @theme spacing tokens, @layer utilities pb-safe patterns)
provides:
  - BottomNav.tsx component with Home/My Lists/Profile tabs and active-state NavLink highlighting
  - --bottom-nav-height CSS token in :root and --spacing-bottom-nav-height in @theme
  - .pb-bottom-nav utility class with iOS safe-area inset support
  - App.tsx layout updated with BottomNav rendered and pb-bottom-nav md:pb-0 on main
  - MyListsPage FAB raised above bottom nav via calc(--bottom-nav-height + 1rem)
affects:
  - 04-navigation (all remaining plans — BottomNav is persistent chrome in layout)
  - Any future pages with fixed bottom UI elements (must clear --bottom-nav-height)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Bottom nav height driven by CSS variable --bottom-nav-height in :root, consumed by @theme spacing token and .pb-bottom-nav utility"
    - "NavLink end prop on / route prevents Home highlighting every page"
    - "md:hidden on BottomNav makes it visible only below tablet breakpoint"
    - "FAB positioning above bottom nav uses bottom-[calc(var(--bottom-nav-height)+1rem)] Tailwind JIT syntax"
    - "Toaster containerStyle uses CSS variable for bottom offset — resolves at runtime on mobile"

key-files:
  created:
    - frontend/src/components/layout/BottomNav.tsx
  modified:
    - frontend/src/index.css
    - frontend/src/App.tsx
    - frontend/src/pages/myLists/MyListsPage.tsx

key-decisions:
  - "BottomNav uses z-(--z-sticky) not z-(--z-dialog) — it is persistent chrome, not a temporary overlay"
  - "end prop required on NavLink to='/' — without it Home tab highlights on every route"
  - "pb-bottom-nav on <main> is single catch-all for content clearance — not per-page"
  - "MyListsPage FAB removes pb-safe from wrapper — bottom nav already manages safe-area inset, FAB only needs to clear nav height"

patterns-established:
  - "bottom-nav-height token pattern: --bottom-nav-height in :root, --spacing-bottom-nav-height in @theme, .pb-bottom-nav in @layer utilities"
  - "Fixed mobile chrome positioning: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom)) pattern for elements that must clear both nav and iOS home indicator"

requirements-completed: [NAV-01, NAV-03]

# Metrics
duration: 9min
completed: 2026-02-21
---

# Phase 4 Plan 1: Bottom Navigation Tab Bar Summary

**Persistent mobile tab bar (Home, My Lists, Profile) via NavLink active-state highlighting, CSS variable height token, and layout-level content clearance in App.tsx**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-21T11:44:25Z
- **Completed:** 2026-02-21T11:54:24Z
- **Tasks:** 3 of 3 completed (human verification approved)
- **Files modified:** 4

## Accomplishments
- BottomNav.tsx component with three tabs: Home (with `end` prop), My Lists, and auth-conditional Profile/Login
- CSS token system extended: `--bottom-nav-height` in `:root`, `--spacing-bottom-nav-height` in `@theme`, `.pb-bottom-nav` utility with iOS safe-area inset
- App.tsx layout updated: BottomNav rendered between `</main>` and `<Footer />`, `<main>` gets `pb-bottom-nav md:pb-0`, Toaster offset above nav on mobile
- MyListsPage FAB repositioned above bottom nav using `bottom-[calc(var(--bottom-nav-height)+1rem)]`, removing redundant `pb-safe`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add bottom-nav CSS tokens and create BottomNav component** - `94b878c` (feat)
2. **Task 2: Wire BottomNav into App.tsx layout and fix FAB offset in MyListsPage** - `2146116` (feat)
3. **Task 3: Visual verification of bottom nav and layout** - human-approved (no code commit)

**Plan metadata:** `a0e17ee` (docs: complete plan — awaiting final update)

## Files Created/Modified
- `frontend/src/components/layout/BottomNav.tsx` - Mobile bottom tab bar with NavLink active-state, auth-conditional profile tab, md:hidden, z-(--z-sticky)
- `frontend/src/index.css` - Added --bottom-nav-height to :root, --spacing-bottom-nav-height to @theme, .pb-bottom-nav to @layer utilities
- `frontend/src/App.tsx` - Imports and renders BottomNav, adds pb-bottom-nav md:pb-0 to main, offsets Toaster above bottom nav
- `frontend/src/pages/myLists/MyListsPage.tsx` - FAB uses bottom-[calc(var(--bottom-nav-height)+1rem)] instead of bottom-4

## Decisions Made
- `z-(--z-sticky)` (50) assigned to BottomNav — same layer as header. Consistent stacking: dialog/drawer layers (100-150) float above it as intended
- `end` prop on Home NavLink is mandatory — without it, `to="/"` would match every route and Home would always appear active
- Single `pb-bottom-nav md:pb-0` on `<main>` is the catch-all content clearance point — no per-page adjustments needed for standard pages
- FAB `pb-safe` removed because the bottom nav's own `pb-safe-or-4` already handles iOS home indicator — the FAB only needs to clear the nav bar height itself

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors exist across the codebase (unused imports, type mismatches in insights hooks, etc.) — none are in files modified by this plan. These are out-of-scope and logged for deferred resolution.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- BottomNav verified by human — all 6 visual checks passed (mobile visibility, active states, content clearance, FAB position, desktop hidden, auth state)
- Ready for Phase 4 Plan 2 (Navbar hamburger suppression on mobile, since BottomNav now owns mobile navigation)
- Pre-existing TypeScript errors in unrelated files should be addressed in a dedicated cleanup phase

---
*Phase: 04-navigation*
*Completed: 2026-02-21*
