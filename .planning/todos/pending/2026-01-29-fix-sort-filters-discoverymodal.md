---
created: 2026-01-29T22:08
title: Fix sort filters in DiscoverModal
area: ui
files:
  - frontend/src/components/discover/filters/SortByDropdown.tsx
  - frontend/src/components/discover/DiscoverModal.tsx
  - frontend/src/hooks/sorting/useSortByBayesian.ts
---

## Problem

Two issues with sorting in the DiscoverModal:

1. **Release date order is faulty** — The sort by filter for release date order isn't working correctly (specific bug behavior TBD during implementation)

2. **Rating sort should use Bayesian** — The rating sort should leverage the existing `useSortByBayesian` hook for fairer rating ordering, rather than raw average ratings (which unfairly favors items with few high ratings over consistently good items with many ratings)

## Solution

1. Debug and fix the release date sorting logic in `SortByDropdown.tsx` or the underlying discover hook
2. Integrate the existing `useSortByBayesian.ts` hook into the DiscoverModal's rating sort option
3. The Bayesian sorting infrastructure already exists in `frontend/src/hooks/sorting/` — reuse it rather than reimplementing
