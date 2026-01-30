---
created: 2026-01-29T22:16
title: Auto-disable edit mode on navigation in MyLists
area: ui
files:
  - frontend/src/pages/myLists/MyListsPage.tsx
  - frontend/src/components/lists/content/ListHeader.tsx
  - frontend/src/components/lists/content/ListContent.tsx
  - frontend/src/components/lists/content/ListMediaCard.tsx
  - frontend/src/components/lists/content/ListGridView.tsx
---

## Problem

When a user enables edit mode in the MyLists page and then navigates to view another list or switches views, edit mode remains active. This can lead to accidental edits or removals if the user forgets to manually disable edit mode before navigating.

Edit mode should be scoped to the specific list instance where it was enabled — switching lists or views should automatically reset edit mode to disabled.

## Solution

1. Track which list ID has edit mode enabled (not just a boolean)
2. When the selected list changes (navigation), reset `isEditing` to `false`
3. Consider using a `useEffect` that watches the current list ID and resets edit mode when it changes
4. Alternatively, lift edit mode state to be keyed by list ID: `editingListId: string | null`
