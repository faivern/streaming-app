---
created: 2026-01-20T00:51
title: Add top 10 rated movies/series carousel
area: ui
files:
  - frontend/src/components/
  - frontend/src/pages/
---

## Problem

The home page needs a "Top 10 Rated" carousel that displays the highest-rated movies or TV series depending on which media type is currently selected at the top of the page. This should follow the same design patterns and component structure as the existing carousels (Popular, Trending, etc.).

## Solution

- Add API endpoint call for top rated movies/series (TMDB has `/movie/top_rated` and `/tv/top_rated`)
- Create carousel component following existing carousel patterns
- Toggle between movie/series data based on current media type selection
- Reuse existing carousel styling and card components
- Consider adding rank badges (1-10) to visually distinguish this carousel
