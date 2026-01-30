---
created: 2026-01-29T22:08
title: Add infinite scroll to DiscoverModal
area: ui
files:
  - frontend/src/components/discover/DiscoverModal.tsx
  - frontend/src/hooks/genres/useInfiniteDiscoverGenre.ts
---

## Problem

The DiscoverModal component needs infinite scrolling functionality. The codebase already has infinite scroll patterns in place (e.g., `useInfiniteDiscoverGenre.ts`) that can be leveraged or adapted for the modal.

## Solution

1. Implement or adapt existing infinite scroll hook pattern for the DiscoverModal
2. Add scroll event listener or intersection observer to trigger fetching more results
3. Update the API hook (likely `useAdvancedDiscover`) to support pagination/infinite queries using React Query's `useInfiniteQuery`
4. Handle loading states and append new results to the existing list
