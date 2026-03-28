# Cinelas

## What This Is

Cinelas is a movie and TV show discovery app. Users browse trending media, manage personal watchlists, track what they've watched, explore insights about their viewing habits, and discover new content through AI-powered natural language search. The app is fully responsive across all screen widths with native-feeling touch interactions.

## Core Value

Users can effortlessly discover movies and TV shows — whether browsing, searching, or describing what they're in the mood for in natural language.

## Requirements

### Validated

- ✓ Media discovery (trending, popular, upcoming, top-rated carousels) — existing
- ✓ Search (multi-search across movies and TV) — existing
- ✓ Movie and TV detail pages — existing
- ✓ Cast & crew pages with person detail — existing
- ✓ Genre browsing — existing
- ✓ Watch providers browsing — existing
- ✓ Google OAuth authentication — existing
- ✓ User lists (create, read, update, delete, add items) — existing
- ✓ Media entry tracking (watch status) — existing
- ✓ List insights and master insights dashboard — existing
- ✓ Collections browsing — existing
- ✓ Navigation adapts to mobile — persistent bottom nav bar (md: breakpoint), desktop top nav preserved — v1.1
- ✓ Carousels are touch-native — all 6 carousels on Embla with swipe gestures and viewport-relative sizing — v1.1
- ✓ Media detail page layouts at phone, tablet, and desktop — vertical stack on mobile, side-by-side on desktop — v1.1
- ✓ Filter / discover panels adapt to small screens — bottom sheet pattern with dvh-bounded max-height — v1.1
- ✓ Home page is fully responsive across all breakpoints — px-page token, consistent spacing — v1.1
- ✓ Credits, genre, collection, provider, and legal pages are responsive — audited and fixed — v1.1
- ✓ Lists and insights pages are responsive — FAB/nav conflict resolved, BentoGrid single-column on mobile — v1.1
- ✓ Typography, spacing, and tap targets feel right on phone (min 44px touch targets) — full sweep completed — v1.1
- ✓ No layout overflows or broken elements at 375px or 2560px — verified at 4 breakpoints — v1.1

### Active

<!-- v2.0 — AI-Powered Discovery -->
- [ ] Offline embedding pipeline seeding 10,000 TMDB titles into pgvector
- ✓ Backend RAG service: embed query → vector search → personalization → LLM ranking → output validation — Validated in Phase 12
- [ ] AI Discovery page (`/discover/ai`) with search input, quick prompt chips, AI explanation bubble, results grid
- [ ] Floating CTA button on all pages for logged-in users
- [ ] Personalization: filter watched titles, boost preferred genres/cast
- ✓ 3-layer guardrails: input validation, system prompt constraints, output validation — Validated in Phase 12
- ✓ Rate limiting (20 queries/hr per user) and query logging — Validated in Phase 12

### Out of Scope

- Multi-turn conversation / chat history — single-query design, follow-ups are independent queries
- Real-time streaming responses — full response returned at once
- User-uploaded content for search (images, audio) — text queries only
- Custom embedding model training — using Azure OpenAI text-embedding-3-small as-is
- Native mobile app (iOS/Android) — web-only
- v1.2 My Lists Mobile Revamp — deferred to future milestone

## Current Milestone: v2.0 AI-Powered Discovery

**Goal:** Add a RAG-powered AI discovery feature that lets users find movies and TV shows through natural language — solving "I don't know what to watch" and "What movie is that?" use cases.

**Target features:**
- Offline embedding pipeline: seed 10,000 TMDB titles into pgvector with text-embedding-3-small
- Backend RAG service: query embedding → vector search → personalization → GPT-4o-mini ranking → output validation
- AI Discovery page with natural language search, quick prompts, AI explanations, and 5-card results
- Floating CTA button on all pages ("Don't know what to watch?")
- Personalization: filter watched titles, boost preferred genres/cast from user history
- 3-layer guardrails (input validation, system prompt constraints, output validation)
- Observability: query logging, pipeline step timing, graceful degradation

## Context

- Tech stack: React 19, TypeScript, Tailwind CSS 4, Vite, React Query v5 (frontend); .NET 8, ASP.NET Core, EF Core 9, PostgreSQL 16 (backend)
- Existing `ITmdbService` with 6hr `IMemoryCache` — reused by embedding pipeline for TMDB detail/keyword/credit fetches
- Existing `BackgroundService` pattern from `TmdbRefreshBackgroundService` — model for embedding seed job
- Existing rate limiting infrastructure in `Program.cs` — add "ai" policy
- Existing `MediaCard` component — reuse for AI result rendering
- App is fully responsive as of v1.1
- Design spec, architecture, UI mockups, and implementation roadmap in `ai-rag-feature/`

## Constraints

- **AI Provider**: Azure OpenAI — text-embedding-3-small (embeddings) + GPT-4o-mini (chat)
- **Vector DB**: pgvector extension on existing PostgreSQL — no separate vector database
- **Auth**: AI Discovery is auth-gated — logged-in users only
- **Rate limit**: 20 queries/hour per authenticated user (partitioned by user ID from claims)
- **Cost**: Must stay under ~$5/month at 1000 queries/month
- **No new frontend packages**: Existing React/Tailwind/React Query stack covers all needs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phone-first breakpoints | Phone must be perfect; tablet and desktop treated together | ✓ Good — 375px was primary test target throughout; sm/md breakpoints handled tablet naturally |
| Bottom navigation on mobile | Native-feeling UX goal; matches how media apps (Netflix, etc.) work on mobile | ✓ Good — BottomNav with z-(--z-sticky) and NavLink end prop shipped in Phase 4 |
| Use existing carousel libraries | Embla + Splide already installed; avoid adding more carousel dependencies | ✓ Good — Splide removed entirely; Embla used for all 6 carousels; no new dependencies added |
| dvh over vh for all height constraints | iOS Safari toolbar clips vh-based heights when browser chrome is visible | ✓ Good — dvh is now canonical height unit across modals, carousel heroes, and bottom sheets |
| Headless UI Dialog for mobile menu scroll lock | document.body.style.overflow is silently ignored on iOS Safari | ✓ Good — Dialog position:fixed pattern works correctly on all tested iOS versions |
| px-page CSS utility token | Single responsive padding value for all page containers, eliminating 6-step stepped scale | ✓ Good — Adopted by MediaGrid + all 5 carousel wrappers; spacing consistent at all 4 breakpoints |
| mt-navbar-offset CSS token | Canonical navbar clearance — prevents content hiding under fixed navbar on any page | ✓ Good — Applied to 8+ pages; single source of truth for top offset |
| Semantic z-index tokens (z-(--z-*)) | Replaces integer literals that create unpredictable stacking | ✓ Good — Zero z-50/z-[100]/z-[9999] literals remain in codebase after Phase 9 |
| overscroll-contain on modal scroll containers | Prevents iOS momentum scroll bleed to background page | ✓ Good — Applied consistently to all Dialog scroll containers in Phases 5–7 |
| gap-closure verification loop | Re-verify after code changes to catch items missed in initial planning | ✓ Good — Caught carousel padding inconsistency and remaining z-50 literals in Phase 9 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after Phase 12 (RAG Query Service and API) completed*
