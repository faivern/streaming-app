# Roadmap: Cinelas — AI-Powered Discovery

## Milestones

- [x] **v0.0 Mobile Responsiveness Stub** — Phase 0 (initial plan created, superseded by v1.1)
- [x] **v1.0 List Insights Dashboard** — Phase 1 (shipped 2026-02-17)
- [x] **v1.1 Full Responsiveness** — Phases 2–9 (shipped 2026-02-25)
- [ ] **v2.0 AI-Powered Discovery** — Phases 10–13 (in progress)

## Phases

<details>
<summary>✅ v0.0 + v1.0 (Phases 0–1) — SHIPPED</summary>

### Phase 0: Mobile Responsiveness (Stub)
**Goal**: Initial mobile responsiveness planning document
**Status**: Superseded by v1.1 Full Responsiveness milestone (Phases 2–9)

### Phase 1: List Insights Dashboard
**Goal**: Build a static insights dashboard that analyzes a user's lists and presents visual data through a bento grid layout with glassmorphism cards
**Status**: Complete (2026-02-17)
**Plans**: 4 plans
- [x] 01-01 — Types, aggregators, formatters, and Recharts chart wrappers
- [x] 01-02 — BentoGrid layout, glassmorphism cards, all 7 metric card components
- [x] 01-03 — Data-fetching hooks (useListInsights, useMasterInsights)
- [x] 01-04 — Insights pages, routing, and entry points in lists UI

</details>

<details>
<summary>✅ v1.1 Full Responsiveness (Phases 2–9) — SHIPPED 2026-02-25</summary>

- [x] Phase 2: Foundation (2/2 plans) — completed 2026-02-20
- [x] Phase 3: Carousels (3/3 plans) — completed 2026-02-20
- [x] Phase 4: Navigation (2/2 plans) — completed 2026-02-21
- [x] Phase 5: Modals and Filters (3/3 plans) — completed 2026-02-21
- [x] Phase 6: Media Detail Page (3/3 plans) — completed 2026-02-21
- [x] Phase 7: Lists Page (2/2 plans) — completed 2026-02-21
- [x] Phase 8: Secondary Pages and Insights (4/4 plans) — completed 2026-02-22
- [x] Phase 9: Global Polish (4/4 plans) — completed 2026-02-25

Full phase details: `.planning/milestones/v1.1-ROADMAP.md`

</details>

### v2.0 AI-Powered Discovery (Phases 10–13)

- [ ] **Phase 10: DB and Infrastructure Foundation** — pgvector enabled, schema migrated, Azure OpenAI SDK wired into DI
- [x] **Phase 11: Embedding Seed Pipeline** — 10,000 TMDB titles embedded and queryable in pgvector (completed 2026-03-26)
- [x] **Phase 12: RAG Query Service and API** — end-to-end query pipeline live: embed → search → personalize → rank → validate → respond (completed 2026-03-28)
- [ ] **Phase 13: Frontend Discovery UI and CTA** — AI Discovery page and floating CTA shipped and hardened

## Phase Details

### Phase 10: DB and Infrastructure Foundation
**Goal**: The database and backend can store and query vector embeddings; Azure OpenAI SDK is available to all services
**Depends on**: Nothing (first phase of v2.0)
**Requirements**: INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. `docker compose up` starts without errors using the pgvector Docker image; `SELECT extversion FROM pg_extension WHERE extname = 'vector'` returns a result
  2. EF Core migrations apply cleanly; `movie_embeddings` and `ai_query_logs` tables exist in the database with correct column types
  3. HNSW index is present on the embedding column; `EXPLAIN ANALYZE` on a vector similarity query shows index usage rather than a sequential scan
  4. `AzureOpenAIClient` resolves from the DI container in a test endpoint; Azure OpenAI environment variables are documented in `.env.example`
**Plans**: 2 plans
- [x] 10-01-PLAN.md — pgvector Docker image, entity models, EF Core migration with HNSW index
- [ ] 10-02-PLAN.md — Azure OpenAI DI registration, /health/ai endpoint, unit tests

### Phase 11: Embedding Seed Pipeline
**Goal**: 15,000 TMDB titles (10,000 movies + 5,000 TV) are embedded and stored in pgvector; the pipeline is observable, restartable, and alignment-verified
**Depends on**: Phase 10
**Requirements**: INFRA-01, INFRA-04
**Success Criteria** (what must be TRUE):
  1. After startup, `movie_embeddings` table reaches 10,000 rows without manual intervention
  2. Stopping and restarting the backend mid-seed resumes from the checkpoint rather than restarting from zero
  3. A spot-check query ("Bill Murray time loop comedy") returns Groundhog Day in the top 5 cosine similarity results, confirming alignment and content text quality
  4. The pipeline handles Azure OpenAI 429 rate limit responses with exponential backoff and continues without crashing
**Plans**: 3 plans
- [ ] 11-01-PLAN.md — TMDB model extensions, seed fetch methods, EmbeddingContentBuilder with unit tests
- [ ] 11-02-PLAN.md — EmbeddingSeedService pipeline logic, BackgroundService, DI registration, unit tests
- [x] 11-03-PLAN.md — /health/seed endpoint with SeedStatusDto and unit tests

### Phase 12: RAG Query Service and API
**Goal**: Authenticated users can submit natural language queries via the API and receive ranked, personalized, validated results with per-result explanations
**Depends on**: Phase 11
**Requirements**: RAG-01, RAG-02, RAG-03, RAG-05, PERS-01, GUARD-01, GUARD-02, GUARD-03 (RAG-04 descoped per D-11; PERS-02 deferred per D-07)
**Success Criteria** (what must be TRUE):
  1. A POST to `/api/ai-discover` with a natural language query returns 5 results with TMDB IDs, match scores, and per-result explanation text within 25 seconds
  2. A user with 20 watched titles receives results that contain none of those titles (genre boosting deferred per D-07 — watched-title filtering only in Phase 12)
  3. When the LLM call fails or returns malformed JSON, the endpoint returns HTTP 503 with Retry-After header (per D-11 — clean unavailability signal preferred over degraded vector-only results)
  4. The 21st request within an hour from the same user returns HTTP 429 with a `Retry-After` header; unauthenticated requests return 401
  5. Queries with off-topic input ("how do I cook pasta") receive a friendly redirect response rather than movie results; input exceeding 500 characters is rejected with 400
  6. Each query is logged to `ai_query_logs` with pipeline step timing; repeated identical queries by the same user within 30 minutes return a cached response
**Plans**: 3 plans
- [x] 12-01-PLAN.md — Schema migration, DTOs, IAiDiscoveryService interface, system prompt constants
- [x] 12-02-PLAN.md — AiDiscoveryService RAG pipeline implementation and DI registration
- [x] 12-03-PLAN.md — AiDiscoverController, "ai" rate limit policy, unit tests

### Phase 13: Frontend Discovery UI and CTA
**Goal**: Users can discover movies and TV shows through natural language on the AI Discovery page and reach it from any page via the floating CTA
**Depends on**: Phase 12
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, ENTRY-01, ENTRY-02
**Success Criteria** (what must be TRUE):
  1. Navigating to `/discover/ai` shows an idle state with a search input, 5 quick-prompt chips, and corpus scope disclosure; tapping a chip auto-submits the query without typing
  2. While a query is processing, 5 pulsing skeleton cards appear and the submit button is disabled; results replace the skeletons within 25 seconds
  3. Results appear as a 5-card MediaCard grid with a match score badge overlay and an AI explanation bubble summarizing why the results match the query
  4. Quick-action refinement buttons ("More like these", "TV shows instead", "Something darker") generate new independent queries without clearing the input
  5. All error states display distinct messages: 503 shows a service-unavailable message, 429 shows a rate-limit message with countdown, 400 shows an input-error message, empty results show a no-results message
  6. A floating CTA button ("Don't know what to watch?") is visible on every page for logged-in users, positioned above the bottom navigation bar on mobile; unauthenticated users see an auth gate with a value explanation rather than a blank login demand
**Plans**: 3 plans
Plans:
- [x] 13-01-PLAN.md — TypeScript types, API service, and useAiDiscover mutation hook
- [ ] 13-02-PLAN.md — AI Discovery page and all child components (search input, quick prompts, explanation, results grid, quick actions)
- [ ] 13-03-PLAN.md — Floating CTA button, route wiring in App.tsx, human verification
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 2. Foundation | v1.1 | 2/2 | Complete | 2026-02-20 |
| 3. Carousels | v1.1 | 3/3 | Complete | 2026-02-20 |
| 4. Navigation | v1.1 | 2/2 | Complete | 2026-02-21 |
| 5. Modals and Filters | v1.1 | 3/3 | Complete | 2026-02-21 |
| 6. Media Detail Page | v1.1 | 3/3 | Complete | 2026-02-21 |
| 7. Lists Page | v1.1 | 2/2 | Complete | 2026-02-21 |
| 8. Secondary Pages | v1.1 | 4/4 | Complete | 2026-02-22 |
| 9. Global Polish | v1.1 | 4/4 | Complete | 2026-02-25 |
| 10. DB and Infrastructure Foundation | v2.0 | 1/2 | In Progress|  |
| 11. Embedding Seed Pipeline | v2.0 | 1/3 | Complete    | 2026-03-26 |
| 12. RAG Query Service and API | v2.0 | 4/4 | Complete    | 2026-03-28 |
| 13. Frontend Discovery UI and CTA | v2.0 | 1/3 | In Progress|  |
