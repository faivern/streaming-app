---
created: 2026-01-29T22:09
title: Remove Add All to List button from DiscoverModal
area: ui
files:
  - frontend/src/components/discover/DiscoverModal.tsx:171,495-500
---

## Problem

The DiscoverModal component contains an "Add All to List" button and associated `handleAddAll` function that should be removed. This is a UI cleanup task to simplify the discovery modal interface.

## Solution

1. Remove the `handleAddAll` function (around line 171)
2. Remove the "Add All to List" button JSX (around lines 495-500)
3. Remove any related state, imports, or dependencies that become unused after removing the functionality
