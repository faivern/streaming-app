---
created: 2026-01-20T23:11
title: Add Top 10 ranking numbers to carousel cards
area: ui
files:
  - frontend/src/components/media/carousel/Top10Carousel.tsx
---

## Problem

The Top 10 carousel cards need visual ranking indicators. Each card should display a large number (1-10) behind its left side showing its position in the ranking. The numbers should have an outline-only style by default, but on hover the number should peek out further to the left and fill with the blue gradient color used in the hero section for the "titles available" text.

## Solution

- Add positioned number elements behind each card in Top10Carousel
- Use CSS for outline-only text effect (text-stroke or similar)
- On hover, animate the number to translate left and fill with the hero blue gradient
- Reference hero section for exact gradient values
