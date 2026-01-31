---
created: 2026-01-31T12:45
title: Make DiscoverModal cards clickable to open AddToListModal
area: ui
files:
  - frontend/src/components/discover/DiscoverModal.tsx
---

## Problem

Currently, list cards inside the DiscoverModal have a simple "+ Add" button that adds media directly. Users want more control when adding media:
- Select tracking status (watched, watching, want to watch)
- Add review and rating
- Add to multiple different lists at once

The current flow is too limited and doesn't leverage the existing AddToListModal functionality.

Additionally, the media type badge ("movie"/"TV") is redundant since media type must be pre-selected in the filter and can't be "both" anymore.

## Solution

1. **Make entire card clickable** — Remove the "+ Add" button overlay, make the card itself clickable
2. **Open AddToListModal on click** — When a card is clicked, prompt the AddToListModal with that media item pre-populated
3. **Update card UI:**
   - Keep RatingPill badge (show on hover)
   - Keep title name and release year
   - Remove media type badge ("movie"/"TV") — redundant with pre-selected filter
4. **AddToListModal integration** — User can then select tracking status, add review, rate, and add to multiple lists
