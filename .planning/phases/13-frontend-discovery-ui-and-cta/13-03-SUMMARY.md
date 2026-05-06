---
phase: 13-frontend-discovery-ui-and-cta
plan: "03"
subsystem: ui
tags: [react, typescript, tailwind, routing, ai-discover, cta]

requires:
  - phase: 13-01
    provides: useAiDiscover hook, AiDiscoverResponse types
  - phase: 13-02
    provides: AiDiscoverPage component at pages/aiDiscover/AiDiscoverPage.tsx

provides:
  - AiDiscoverCta: global floating pill CTA button with auth gate, visible on all pages except /discover/ai
  - /discover/ai route: lazy-loaded AiDiscoverPage registered in App.tsx routing tree
  - AiDiscoverCta rendered globally in App.tsx layout inside SignInModalProvider

affects:
  - All pages (AiDiscoverCta visible everywhere except /discover/ai)
  - App.tsx routing tree (new /discover/ai route)

tech-stack:
  added: []
  patterns:
    - Direct (non-lazy) import for small always-present layout components (AiDiscoverCta)
    - pathname === "/discover/ai" guard to suppress CTA on target page (D-10)
    - openSignInModal with post-auth navigation callback for unauthenticated CTA tap (D-11)

key-files:
  created:
    - frontend/src/components/aiDiscover/AiDiscoverCta.tsx
  modified:
    - frontend/src/App.tsx

key-decisions:
  - "AiDiscoverCta imported directly (not lazy) — it is a small always-present global element, not page content; lazy loading adds unnecessary complexity"
  - "openSignInModal callback pattern: after sign-in, user is navigated to /discover/ai automatically via the pendingCallback in SignInModalContext"

requirements-completed: [ENTRY-01, ENTRY-02]

duration: 52s
completed: "2026-03-29"
---

# Phase 13 Plan 03: CTA and Route Wiring Summary

**Floating CTA pill button on all pages with auth gate, and /discover/ai route wired into App.tsx — completing ENTRY-01 and ENTRY-02.**

## Performance

- **Duration:** ~52s
- **Started:** 2026-03-29T13:57:02Z
- **Completed:** 2026-03-29T13:57:54Z (pre-checkpoint)
- **Tasks executed:** 2 of 3 (Task 3 is a human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- `AiDiscoverCta` floating pill button created: fixed-positioned above BottomNav on mobile (`bottom-20`), at `bottom-6` on desktop; `z-(--z-overlay)` (60) stacks above BottomNav (`z-(--z-sticky)` = 50)
- Auth gate: authenticated users navigate directly to `/discover/ai`; unauthenticated users see `SignInModal` with a post-auth navigation callback (user auto-navigates after signing in)
- Hidden on `/discover/ai` via `location.pathname` guard
- `AiDiscoverPage` lazy-loaded route registered at `/discover/ai` in App.tsx
- `AiDiscoverCta` rendered between `<BottomNav />` and `<Footer />` — inside `SignInModalProvider`, outside `<main>`, so `useSignInModal()` works and the button floats over all page content

## Task Commits

1. **Task 1: Create AiDiscoverCta floating button** - `239bb90` (feat)
2. **Task 2: Wire route and CTA into App.tsx** - `1cf206e` (feat)
3. **Task 3: Visual verification** - PENDING (human-verify checkpoint)

## Files Created/Modified

- `frontend/src/components/aiDiscover/AiDiscoverCta.tsx` - Floating pill CTA with auth gate, fadeIn animation, z-overlay positioning
- `frontend/src/App.tsx` - Added lazy AiDiscoverPage import, /discover/ai route, AiDiscoverCta render between BottomNav and Footer

## Decisions Made

- `AiDiscoverCta` is a direct import (not lazy) — it's a small, always-present global element that should be ready on every page load without code-split delay
- Post-auth navigation via `openSignInModal(() => navigate("/discover/ai"))` callback — uses existing `pendingCallback` mechanism in `SignInModalContext`

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. Both components are fully wired. The poster stub from Plan 02 (`posterPath=""`) still exists in `AiResultsGrid.tsx` — documented in 13-02-SUMMARY.md and out of scope for this plan.

## Self-Check: PASSED

- `frontend/src/components/aiDiscover/AiDiscoverCta.tsx` - FOUND
- `frontend/src/App.tsx` contains `lazy(() => import("./pages/aiDiscover/AiDiscoverPage"))` - FOUND
- `frontend/src/App.tsx` contains `path="/discover/ai"` - FOUND
- `frontend/src/App.tsx` contains `import AiDiscoverCta from "./components/aiDiscover/AiDiscoverCta"` - FOUND
- `frontend/src/App.tsx` contains `<AiDiscoverCta />` - FOUND
- Commit `239bb90` - FOUND
- Commit `1cf206e` - FOUND
- `npx tsc --noEmit` - PASSED (zero errors)

## Checkpoint Status

Plan paused at Task 3 (checkpoint:human-verify). Awaiting human visual verification of the complete AI Discovery feature.
