---
created: 2026-01-24T00:00
title: Carousel edge-to-edge layout on right side
area: ui
files:
  - frontend/src/pages/home/HomePage.tsx
---

## Problem

The carousels on the home page (genres, collections, upcoming, top10) are constrained by the page margins on both sides. The desired effect is for the right side of the carousels to extend all the way to the screen edge, creating a visual effect where the last card appears to be "pulled from" the right edge of the viewport.

Currently the carousels respect the home page container margins on both left and right sides, which limits the immersive scrolling experience.

## Solution

Modify carousel container styling to:
- Keep left margin aligned with page content
- Remove/override right margin so cards extend to viewport edge
- Apply to: genres, collections, upcoming, top10 carousels

Approach options:
- Use negative margin on carousel container to break out of parent padding on right side
- Or use CSS `calc(100vw - margin)` width approach
- Ensure horizontal scroll still works correctly with overflow-x
