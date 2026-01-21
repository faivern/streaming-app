---
created: 2026-01-21T23:03
title: Re-add left carousel button for TrendingCarousel
area: ui
files:
  - frontend/src/components/media/carousel/TrendingCarousel.tsx
---

## Problem

The TrendingCarousel is missing its left-side navigation button. Other carousels (CollectionCarousel, GenreCardList, Top10Carousel, UpcomingCarousel) have a conditional left button that appears when `page > 0`. The TrendingCarousel needs this same navigation pattern restored exclusively for itself.

## Solution

Add a left chevron button to TrendingCarousel, matching the pattern used in other carousel components:
- Conditionally render when `page > 0`
- Position: `absolute left-2 top-1/2 -translate-y-1/2`
- Click handler calls `prev()` function
- Style consistent with existing right button
