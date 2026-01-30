---
created: 2026-01-29T22:07
title: Remove re-roll button from DiscoveryModal
area: ui
files:
  - frontend/src/components/discover/DiscoverModal.tsx:180,482-486
---

## Problem

The DiscoveryModal component contains a "Re-roll" button and associated `handleReroll` function that should be removed. This is a UI cleanup task to simplify the discovery modal interface.

## Solution

1. Remove the `handleReroll` function (around line 180)
2. Remove the Re-roll button JSX (around lines 482-486)
3. Remove any related state or dependencies if they become unused after removing the re-roll functionality
