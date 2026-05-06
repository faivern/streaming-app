# Phase 12: RAG Query Service and API - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the end-to-end RAG query pipeline as a backend service and API endpoint. A POST to `/api/ai-discover` accepts a natural language query from an authenticated user, embeds it via text-embedding-3-small, performs pgvector cosine similarity search, removes watched titles, sends candidates to GPT-4o-mini for ranking and explanation, validates output, caches the response, and logs the query. This phase delivers the backend pipeline only — no frontend UI, no floating CTA.

</domain>

<decisions>
## Implementation Decisions

### LLM System Prompt Design
- **D-01:** Casual cinephile tone for per-result explanations — friendly and enthusiastic, like a movie-buff friend recommending titles.
- **D-02:** Strict boundary on off-topic queries — direct message: "I can only help with movie and TV recommendations. Please try a different query." Returns empty results array. No playful pivots or food-to-film redirects.
- **D-03:** Strict grounding — LLM can ONLY recommend from the provided RAG candidates (10-20 vector-retrieved titles). Output validation catches any violations.
- **D-04:** User query passed verbatim to GPT-4o-mini — no pre-processing, cleaning, or rephrasing. Input validation (500 char max, non-empty) is the only pre-processing.
- **D-05:** Temperature 0.3 — focused and factual, per architecture spec.
- **D-06:** Structured JSON output format enforced via system prompt constraints.

### Personalization Strategy
- **D-07:** Watched-title exclusion only — no genre boosting, no cast boosting. Simplifies the pipeline while still providing meaningful personalization.
- **D-08:** Watched titles filtered BEFORE the LLM call — remove already-watched titles from the 20 vector candidates before passing to GPT-4o-mini. LLM sees only unwatched options.
- **D-09:** Watched title lookup via `MediaEntryService.GetUserEntriesAsync(userId)` → filter by `WatchStatus.Watched` → cross-reference TmdbIds against vector candidates.
- **D-10:** New users (no watch history) get raw LLM-ranked vector results — no preference prompts, no popular bias. Still useful, just not personalized.

### Fallback & Error Behavior
- **D-11:** Both embedding API and LLM failures return HTTP 503 with "AI service temporarily unavailable" message. No fallback to raw vector results. Overrides architecture doc RAG-04 — rationale: cleaner UX to say "unavailable" than to serve degraded results that confuse users.
- **D-12:** Embedding API failure includes Retry-After header with suggested retry interval.
- **D-13:** Partial LLM results returned as-is — if output validation drops hallucinated IDs and only 3 of 5 remain, return those 3. No backfilling from vector results.
- **D-14:** If LLM returns zero valid results after validation, return 503 (same as LLM failure).

### Caching Strategy
- **D-15:** IMemoryCache with 30-minute TTL — same pattern as existing TmdbService cache. Key format: `ai_discover:{userId}:{SHA256(query)}`.
- **D-16:** No cache invalidation on watch history changes — let TTL handle staleness naturally. Low impact, much simpler.
- **D-17:** Cache hit returns immediately without re-running pipeline.

### Rate Limiting
- **D-18:** Per-user rate limit partitioned by userId from auth claims (not IP). Separate "ai" policy: 20 requests per hour per user.
- **D-19:** 429 response includes Retry-After header with exact seconds until rate limit window resets. ASP.NET rate limiter supports this natively.

### Query Logging
- **D-20:** Full LLM response stored in `ai_query_logs` including explanation text — useful for debugging prompt quality and monitoring AI behavior.
- **D-21:** Token counts (prompt + completion) stored alongside response — Phase 10 verification gap identified missing `token_count` column; this phase addresses it with a migration adding `response_text` and refining token columns.
- **D-22:** Logging is fire-and-forget — does not block the response to the user.

### Claude's Discretion
- Vector search candidate count (architecture says 20; can adjust based on testing)
- Number of candidates passed to LLM after personalization filtering (architecture says top 10)
- Exact system prompt wording (tone direction given, wording is implementation detail)
- AiDiscoveryService internal class structure (single service or split into pipeline steps)
- DTO structure for the API response
- Whether to add the token count column via a new migration or modify existing ai_query_logs schema

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Design
- `ai-rag-feature/architecture.md` — Full system architecture: RAG pipeline steps (embed → search → personalize → LLM → validate → respond), guardrails architecture, database schema, response format
- `ai-rag-feature/design-spec.md` — Design specification for the AI discovery feature

### Phase Prerequisites
- `.planning/phases/10-db-and-infrastructure-foundation/10-CONTEXT.md` — Infrastructure decisions: pgvector, Azure OpenAI DI, schema design, AzureOpenAIOptions
- `.planning/phases/11-embedding-seed-pipeline/11-CONTEXT.md` — Embedding pipeline decisions: content text format, TMDB sourcing, batching strategy

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 12 requirements: RAG-01 through RAG-05, PERS-01, PERS-02, GUARD-01 through GUARD-03

### Codebase Maps
- `.planning/codebase/CONVENTIONS.md` — Coding conventions (naming, logging, service patterns)
- `.planning/codebase/ARCHITECTURE.md` — Layered architecture and service organization

### Key Source Files
- `backend/Configuration/ServiceRegistration.cs` — DI registration (AzureOpenAIClient, AzureOpenAIOptions already registered)
- `backend/Program.cs` — Rate limiter policies (standard, auth, mutation) — add "ai" policy here
- `backend/Services/IMediaEntryService.cs` — `GetUserEntriesAsync(userId)` for watched-title filtering
- `backend/Models/Entities/MediaEntry.cs` — MediaEntry entity with TmdbId, MediaType, WatchStatus
- `backend/Models/Entities/MovieEmbedding.cs` — MovieEmbedding entity for vector search
- `backend/Models/Entities/AiQueryLog.cs` — AiQueryLog entity (needs response_text and token columns)
- `backend/Data/AppDbContext.cs` — DbContext with MovieEmbedding and AiQueryLog configurations
- `backend/Controllers/HealthAiController.cs` — Existing /health/ai endpoint pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **AzureOpenAIClient (DI singleton)**: `GetEmbeddingClient()` for text-embedding-3-small, `GetChatClient()` for GPT-4o-mini. `AzureOpenAIOptions` holds deployment names.
- **IMediaEntryService**: `GetUserEntriesAsync(userId)` returns all user entries — filter by `WatchStatus.Watched` for personalization.
- **IMemoryCache**: Already used by `TmdbService` for 6hr TMDB cache — same pattern for 30-min AI query cache.
- **Rate limiter infrastructure**: 3 existing policies in `Program.cs` using `AddPolicy` + `FixedWindowRateLimiter`. Add "ai" policy with user-based partition key.
- **AppDbContext**: `MovieEmbeddings` and `AiQueryLogs` DbSets already configured from Phase 10 migration.

### Established Patterns
- **Controller pattern**: `[Authorize]`, `[EnableRateLimiting("policy")]`, `[HttpPost]` with DTO binding. Claim extraction via `User.FindFirstValue(ClaimTypes.NameIdentifier)`.
- **Service pattern**: Interface + implementation, registered in `ServiceRegistration.cs`, `async Task<T>` return types.
- **Error handling**: `GlobalExceptionFilter` catches unhandled exceptions. Controllers return `Ok()`, `BadRequest()`, `NotFound()`, `StatusCode(503)`.
- **Logging**: `ILogger<T>` with structured message templates.

### Integration Points
- **Program.cs**: Add "ai" rate limit policy (per-user, 20/hr)
- **ServiceRegistration.cs**: Register `IAiDiscoveryService` + implementation
- **New controller**: `AiDiscoverController` with POST endpoint
- **AppDbContext**: May need update if AiQueryLog schema changes
- **Migration**: New migration for response_text + token count columns on ai_query_logs

</code_context>

<specifics>
## Specific Ideas

- Architecture doc response format: `{ results: [{ tmdbId, mediaType, title, explanation, matchScore }], message, responseTimeMs }`
- RAG-04 (vector fallback) is intentionally NOT implemented per user decision — both embedding and LLM failures return 503
- PERS-02 (genre/cast boosting) simplified to exclusion-only — requirement satisfied by filtering watched titles (PERS-01)
- The `ai_query_logs` table from Phase 10 needs schema extension: add `response_text` (full LLM JSON response) and token count columns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 12-rag-query-service-and-api*
*Context gathered: 2026-03-28*
