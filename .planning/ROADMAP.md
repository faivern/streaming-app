# Roadmap

## Current Milestone: v1.0

### Phase 0: Mobile Responsiveness
- **Goal:** Make the entire Cinelas UI responsive across mobile, tablet, and desktop breakpoints.
- **Depends on:** Nothing
- **Status:** Plan ready for execution
- **Plans:** `.planning/phases/00-mobile-responsiveness/`

### Phase 1: List Insights Dashboard (Spotify Wrapped Style)
- **Goal:** Build a static insights dashboard that analyzes a user's lists (movies + TV combined) and presents visual data through a bento grid layout with glassmorphism cards. Two views: per-list insights at /list/:id/insights and master insights aggregating all lists. Metrics include total watched count, genre distribution donut, top 5 genres, rating comparison (user vs TMDB), top actors/directors profile cards, most active month, and release year decade breakdown.
- **Depends on:** Phase 0
- **Status:** Planned
- **Plans:** 4 plans
  - [ ] 01-01-PLAN.md — Types, aggregators, formatters, and Recharts chart wrappers
  - [ ] 01-02-PLAN.md — BentoGrid layout, glassmorphism cards, all 7 metric card components, empty/loading states
  - [ ] 01-03-PLAN.md — Data-fetching hooks (useListInsights, useMasterInsights) with TMDB enrichment
  - [ ] 01-04-PLAN.md — Insights pages, routing, and entry points in lists UI
