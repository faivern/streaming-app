---
created: 2026-01-21T23:05
title: Redesign carousel nav buttons with full-height hitbox
area: ui
files:
  - frontend/src/components/media/carousel/Top10Carousel.tsx
  - frontend/src/components/media/carousel/GenreCardList.tsx
  - frontend/src/components/media/carousel/CollectionCarousel.tsx
  - frontend/src/components/media/carousel/UpcomingCarousel.tsx
---

## Problem

Current carousel navigation buttons are small circular buttons that require precise mouse targeting. Users have to aim carefully at the small circle to navigate between pages. This is a poor UX pattern - the clickable area should be larger and easier to hit.

Applies to: Top10Carousel, GenreCardList, CollectionCarousel, UpcomingCarousel (NOT TrendingCarousel which has its own design).

## Solution

Replace the small circular buttons with full-height rectangular nav buttons:
- Cover the entire vertical space of the carousel alignment
- Use a shadowy/smudged semi-transparent background (gradient or blur)
- Cards behind should still be partially visible through the button
- Keep just the arrow icon centered vertically
- Much larger hit target = easier navigation without precise aiming
- Consider a gradient fade (e.g., `bg-gradient-to-r from-black/60 to-transparent` for left button)
