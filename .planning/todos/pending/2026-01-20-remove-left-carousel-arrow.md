---
created: 2026-01-20T00:04
title: Remove left side carousel arrow instead of blocking
area: ui
files: []
---

## Problem

The left side carousel arrow is currently being blocked/disabled when at the start position. Instead, it should be completely removed from the DOM or hidden entirely for cleaner UX.

## Solution

TBD - modify carousel component to conditionally render the left arrow only when there are previous items to scroll to, rather than showing a disabled state.
