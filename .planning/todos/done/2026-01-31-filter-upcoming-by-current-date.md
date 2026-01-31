---
created: 2026-01-31T14:22
title: Filter upcoming endpoint by current date
area: api
files:
  - backend/Services/TmdbService.cs:79-89
  - backend/Controllers/MoviesController.cs
  - frontend/src/hooks/upcoming/useUpcomingMedia.ts
---

## Problem

The upcoming movies/TV endpoint returns items from TMDB's `/movie/upcoming` and `/tv/on_the_air` endpoints without validating release dates against the current date. This can result in "upcoming" content that has already been released, compromising data integrity.

Additionally, the TV endpoint uses `on_the_air` (currently airing) rather than truly upcoming shows.

## Solution

Add a date-filtering service layer that:
1. Fetches results from TMDB as usual
2. Parses `release_date` (movies) or `first_air_date` (TV)
3. Filters out items where the date is older than today
4. Returns only genuinely upcoming content

Consider using TMDB's discover endpoint with `primary_release_date.gte` / `first_air_date.gte` parameters instead of the `/upcoming` endpoint for more precise control.
