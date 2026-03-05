# Mobile UX Overhaul: MediaDetailPage

**Date:** 2026-03-05
**Scope:** Mobile only (below `md: 768px`). Desktop layout is completely untouched.

## Goal

Restructure the MediaDetailPage for a mobile-first discovery flow: trailer first, then compact info + actions, then supporting content. No changes to desktop.

## Current Mobile Flow

1. Hero backdrop (40dvh full-width image)
2. BackLink
3. MediaDetailHeader (full-width poster up to 360px + actions + title/meta/overview/details)
4. WatchProviders
5. Mobile trailer (with heading)
6. MediaCastCarousel
7. MediaGridSimilar

### Problems

- Hero backdrop + large poster = ~80% viewport is images before any actionable content
- Action buttons are buried below the poster, below the fold
- Trailer appears at position 5, too far down for a discovery-focused UX
- No mobile-first feel; layout is desktop-adapted rather than mobile-native

## New Mobile Flow

```
1. Trailer (full-width, aspect-video, no extra heading)
2. Poster (left, ~40%) + Title/Meta/Actions (right)  -- horizontal row
3. Overview (3-line clamp + expand)
4. Details (collapsible)
5. Where to Watch
6. Cast carousel (horizontal scroll)
7. Similar media (horizontal scroll)
```

### Wireframe

```
+---------------------------+
|      Trailer Player       |
|     (aspect-video)        |
+---------------------------+
| +-------+ Title Movie     |
| |Poster | rating/runtime  |
| | ~40%  | 2024            |
| +-------+ [Watch][Add]   |
|           [Share]         |
|                           |
| Overview text here...     |
+---------------------------+
| > Details (collapsed)     |
+---------------------------+
| Where to Watch            |
+---------------------------+
| Cast & Crew -------->>    |
+---------------------------+
| You May Like ------->>    |
+---------------------------+
```

## Component Changes

### MediaDetailPage.tsx

- Remove hero backdrop on mobile (delete the `md:hidden` backdrop div)
- Reorder sections using Tailwind `order-*` classes (mobile only)
- Trailer: order-1 (remove "Watch Trailer" heading on mobile)
- MediaDetailHeader: order-2
- WatchProviders: order-4
- Details moves inside header flow
- Cast carousel: order-5
- Similar media: order-6

### MediaDetailHeader.tsx (mobile only)

- Switch to horizontal layout: `flex-row` on mobile
- Poster: ~40% width on left (`w-2/5 max-w-[160px]`)
- Title + meta chips + actions: stacked on the right
- Desktop: unchanged (`flex-col md:flex-row` stays as-is)

### MediaPosterActions.tsx (mobile only)

- Compact buttons: `py-4` -> `py-2` on mobile, smaller text
- Keep 3-column grid, tighter gaps
- Desktop: unchanged

### No Changes To

- All desktop layout (grid, sidebar, trailer position, poster size)
- Child component internals (hooks, data fetching, state)
- WatchProviders, MediaCastCarousel, MediaGridSimilar internals
- MediaDetails collapse behavior
- MediaDetailVideo logic

## Fallback: No Trailer Available

MediaDetailVideo already handles this — shows backdrop image or poster as fallback. No additional work needed.

## Trade-offs

| Decision | Pro | Con |
|----------|-----|-----|
| Trailer as hero | Immediate engagement | Black box if no trailer (handled by fallback) |
| Side-by-side poster+info | Saves vertical space, modern feel | Poster is smaller |
| Compact action buttons | More content above fold | Slightly smaller tap targets |
| Remove hero backdrop | Eliminates redundant image | Less cinematic feel (trailer compensates) |
