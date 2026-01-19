---
created: 2026-01-20T00:50
title: Add upcoming movies/series carousel
area: ui
files:
  - frontend/src/components/
  - frontend/src/pages/
---

## Problem

The home page needs an "Upcoming" carousel that displays upcoming movies or TV series depending on which media type is currently selected at the top of the page. This should follow the same design patterns and component structure as the existing carousels (Popular, Trending, etc.).

## Solution

- Add API endpoint call for upcoming movies/series (TMDB has `/movie/upcoming` and `/tv/on_the_air` or similar)
- Create carousel component following existing carousel patterns
- Toggle between movie/series data based on current media type selection
- Reuse existing carousel styling and card components
