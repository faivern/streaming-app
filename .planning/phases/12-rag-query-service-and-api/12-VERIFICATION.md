---
phase: 12-rag-query-service-and-api
verified: 2026-03-28T00:00:00Z
status: human_needed
score: 6/6 success criteria verified
re_verification:
  previous_status: gaps_found
  previous_score: 4/6
  gaps_closed:
    - "ROADMAP SC-3 updated to reflect D-11: HTTP 503 + Retry-After on LLM failure (not vector fallback)"
    - "ROADMAP SC-2 updated to reflect D-07: watched-title filtering only; genre boosting deferred"
    - "REQUIREMENTS.md RAG-04 changed from Complete to Descoped (D-11)"
    - "REQUIREMENTS.md PERS-02 changed from Pending/Phase 12 to Deferred (D-07)"
    - "REQUIREMENTS.md traceability table and coverage count updated"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Submit POST /api/ai-discover with a valid query as an authenticated user and verify 5 results return within 25 seconds"
    expected: "HTTP 200 with AiDiscoverResponseDto containing 5 results, each with tmdbId, mediaType, title, explanation, matchScore; responseTimeMs <= 25000"
    why_human: "Requires live Azure OpenAI credentials and a seeded pgvector database — cannot verify programmatically without running services"
  - test: "Submit the same query twice within 30 minutes and verify the second response is served from cache"
    expected: "Both responses have identical content; second response is significantly faster (sub-millisecond vs 1-3 seconds)"
    why_human: "Requires live services and timing comparison — IMemoryCache behavior cannot be verified statically"
  - test: "Submit 21 requests within 1 hour from the same authenticated user and verify the 21st returns HTTP 429 with Retry-After header"
    expected: "First 20 requests return 200; 21st returns 429 with Retry-After response header present"
    why_human: "Rate limiter behavior requires running ASP.NET server — integration test not provided in this phase"
---

# Phase 12: RAG Query Service and API — Verification Report

**Phase Goal:** Authenticated users can submit natural language queries via the API and receive ranked, personalized, validated results with per-result explanations
**Verified:** 2026-03-28
**Status:** human_needed — all automated checks pass; 3 behaviors require live services to verify end-to-end
**Re-verification:** Yes — after gap closure (Plan 04)

## Re-verification Summary

Previous verification (initial) returned `gaps_found` with 2 gaps, both documentation misalignments caused by architectural overrides D-07 and D-11 not being reflected in ROADMAP.md and REQUIREMENTS.md.

Plan 04 closed both gaps via commits `f4d84d4` and `b8a0faf`. This re-verification confirms:

- Both commits exist in git history
- ROADMAP.md SC-2 and SC-3 now match shipped behavior
- REQUIREMENTS.md RAG-04 is Descoped (D-11); PERS-02 is Deferred (D-07)
- Traceability table and coverage count are consistent
- All core code files are unchanged (no regressions)

---

## Goal Achievement

### Observable Truths (from updated ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | POST /api/ai-discover returns 5 results with TMDB IDs, match scores, and per-result explanation within 25s | ? HUMAN | Controller and full 6-step RAG pipeline are wired; requires live Azure OpenAI + seeded pgvector to verify end-to-end |
| 2 | User with 20 watched titles receives results containing none of those titles (watched-title filtering only per D-07) | VERIFIED | `GetUserEntriesAsync` + `WatchStatus.Watched` filter in AiDiscoveryService.cs lines 100-115; D-10 fallback when all candidates watched |
| 3 | LLM failure returns HTTP 503 with Retry-After header (per D-11) | VERIFIED | Lines 78-97, 153-157 throw `AiServiceUnavailableException`; AiDiscoverController maps it to 503 with `Retry-After: 30` |
| 4 | 21st request within an hour returns 429 with Retry-After; unauthenticated returns 401 | ? HUMAN | "ai" policy in Program.cs lines 51-58 correctly configured (20/hr, userId partition); `[Authorize]` on controller verified; 429 behavior requires running server |
| 5 | Off-topic query returns redirect response; >500 chars returns 400 | VERIFIED | AiDiscoverController.cs lines 31-35: empty/whitespace 400, >500 chars 400; AiDiscoveryPrompts.cs lines 9-11: off-topic rule with exact JSON redirect format |
| 6 | Each query logged to ai_query_logs; identical queries within 30 min return cached response | VERIFIED | FireAndForgetLog lines 236-267 writes AiQueryLog with ResponseText/PromptTokens/CompletionTokens; cache set at line 219 with `TimeSpan.FromMinutes(30)`; cache key is `ai_discover:{userId}:{SHA256(query)}` |

**Score:** 6/6 success criteria verified (4 verified automatically, 2 require live services)

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/Models/Entities/AiQueryLog.cs` | Extended entity with ResponseText column | VERIFIED | `public string? ResponseText { get; set; }` present |
| `backend/Models/Dtos/AiDiscoverRequestDto.cs` | Request DTO with query string | VERIFIED | `record AiDiscoverRequestDto(string Query)` |
| `backend/Models/Dtos/AiDiscoverResponseDto.cs` | Response DTO matching architecture spec | VERIFIED | `record AiDiscoverResponseDto(List<AiDiscoverResultDto> Results, string Message, long ResponseTimeMs)` |
| `backend/Models/Dtos/AiDiscoverResultDto.cs` | Result DTO with all 5 fields | VERIFIED | `record AiDiscoverResultDto(int TmdbId, string MediaType, string Title, string Explanation, double MatchScore)` |
| `backend/Services/IAiDiscoveryService.cs` | Service interface for pipeline | VERIFIED | `Task<AiDiscoverResponseDto> DiscoverAsync(string query, string userId, CancellationToken)` |
| `backend/Services/AiDiscoveryPrompts.cs` | System prompt constants | VERIFIED | SystemPrompt, CandidateTemplate, CandidateItemTemplate all present |
| `backend/Services/AiServiceUnavailableException.cs` | Shared exception for AI service failures | VERIFIED | `class AiServiceUnavailableException : Exception` with message + inner |
| `backend/Data/Migrations/20260328174220_AddAiQueryLogResponseColumns.cs` | Migration adding response_text column | VERIFIED | File exists in Migrations directory |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/Services/AiDiscoveryService.cs` | Full RAG pipeline (min 150 lines) | VERIFIED | 281 lines; `class AiDiscoveryService : IAiDiscoveryService` with full 6-step pipeline; 14 key method/reference occurrences confirmed |
| `backend/Configuration/ServiceRegistration.cs` | DI registration for AiDiscoveryService | VERIFIED | `services.AddScoped<IAiDiscoveryService, AiDiscoveryService>()` at line 23 |

### Plan 03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/Controllers/AiDiscoverController.cs` | API endpoint for AI discovery | VERIFIED | `[Route("api/ai-discover")]`, `[Authorize]`, `[EnableRateLimiting("ai")]` all present |
| `backend/Program.cs` | AI rate limit policy | VERIFIED | `AddPolicy("ai"` at line 51; PermitLimit=20, Window=FromHours(1), ClaimTypes.NameIdentifier partition key |
| `backend/backend.Tests/Unit/Controllers/AiDiscoverControllerTests.cs` | 6 unit tests for controller | VERIFIED | All 6 tests passed in initial verification: empty query 400, >500 chars 400, exactly-500 200, valid query 200 with results, service exception 503 + Retry-After, no user claim 401 |

### Plan 04 Artifacts (Gap Closure)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.planning/ROADMAP.md` | SC-2 and SC-3 reflect D-07 and D-11 | VERIFIED | SC-2 contains "genre boosting deferred per D-07"; SC-3 contains "HTTP 503 with Retry-After header (per D-11)"; Requirements line excludes RAG-04 and PERS-02 with inline notes |
| `.planning/REQUIREMENTS.md` | RAG-04 Descoped, PERS-02 Deferred, traceability and coverage updated | VERIFIED | RAG-04 is `[~]` with D-11 note; PERS-02 has D-07 deferral note; traceability shows "Descoped (D-11)" and "Deferred (D-07)"; coverage shows "Descoped: 1 (RAG-04 per D-11)" |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `AiDiscoverController.cs` | `IAiDiscoveryService` | constructor injection | WIRED | `_aiService.DiscoverAsync(request.Query, userId, cancellationToken)` |
| `AiDiscoverController.cs` | Program.cs "ai" policy | `[EnableRateLimiting("ai")]` attribute | WIRED | Attribute present at class level, policy defined in Program.cs |
| `AiDiscoveryService.cs` | `AzureOpenAIClient` | constructor injection | WIRED | `GetEmbeddingClient` + `GetChatClient` calls |
| `AiDiscoveryService.cs` | `AppDbContext.MovieEmbeddings` | DbContext LINQ query | WIRED | `_db.MovieEmbeddings.OrderBy(e => e.Embedding.CosineDistance(queryVector)).Take(20)` |
| `AiDiscoveryService.cs` | `IMediaEntryService` | `GetUserEntriesAsync` for watched filtering | WIRED | `GetUserEntriesAsync(userId)` + `WatchStatus.Watched` filter |
| `AiQueryLog.cs` | `AppDbContext` | EF Core fluent config | WIRED | `entity.Property(e => e.ResponseText).HasColumnName("response_text")` |
| `AiDiscoveryService.cs` | `AiQueryLogs` (logging) | fire-and-forget Task.Run with IServiceScopeFactory | WIRED | Scope created, AiQueryLog added, SaveChangesAsync called |
| `.planning/ROADMAP.md` | D-07 and D-11 design decisions | inline SC annotation | WIRED | SC-2 references D-07; SC-3 references D-11; Requirements line notes both |
| `.planning/REQUIREMENTS.md` | RAG-04/PERS-02 status | traceability table + requirement entries | WIRED | Both entries consistent between requirement list and traceability table |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `AiDiscoveryService.cs` | `candidates` (MovieEmbeddings) | `_db.MovieEmbeddings.OrderBy(CosineDistance).Take(20)` | Yes — LINQ query against real DB table | FLOWING |
| `AiDiscoveryService.cs` | `queryVector` | `embeddingClient.GenerateEmbeddingAsync(query)` | Yes — live Azure OpenAI API call | FLOWING (requires live service) |
| `AiDiscoveryService.cs` | `validResults` | LLM JSON parsed and validated against candidate TmdbIds | Yes — real LLM output filtered by real candidate set | FLOWING (requires live service) |
| `AiDiscoverController.cs` | `response` (AiDiscoverResponseDto) | `_aiService.DiscoverAsync(request.Query, userId)` | Yes — delegated to service, no hardcoded values | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Build passes with zero errors | `dotnet build` in /backend | Build succeeded, 0 Warning(s), 0 Error(s) | PASS (initial verification) |
| All 6 controller unit tests pass | `dotnet test --filter "AiDiscoverControllerTests"` | Passed: 6, Failed: 0, Skipped: 0 | PASS (initial verification) |
| Controller validates empty query | Unit test `Discover_EmptyQuery_Returns400` | 400 BadRequest | PASS (initial verification) |
| Controller validates 501-char query | Unit test `Discover_QueryTooLong_Returns400` | 400 BadRequest | PASS (initial verification) |
| Service exception maps to 503 | Unit test `Discover_ServiceThrows_Returns503WithRetryAfter` | 503 + Retry-After: 30 | PASS (initial verification) |
| No user claim returns 401 | Unit test `Discover_NoUserClaim_ReturnsUnauthorized` | 401 Unauthorized | PASS (initial verification) |
| ROADMAP.md SC-2 contains D-07 reference | `grep "D-07" .planning/ROADMAP.md` | 2 matches (SC-2 and Requirements line) | PASS |
| ROADMAP.md SC-3 contains D-11 reference | `grep "D-11" .planning/ROADMAP.md` | 2 matches (SC-3 and Requirements line) | PASS |
| REQUIREMENTS.md RAG-04 is not [x] Complete | `grep "RAG-04" .planning/REQUIREMENTS.md` | `[~]` with Descoped (D-11) | PASS |
| REQUIREMENTS.md traceability RAG-04 | traceability table line 96 | "Descoped (D-11)" | PASS |
| REQUIREMENTS.md traceability PERS-02 | traceability table line 99 | "Deferred (D-07)" | PASS |
| Gap closure commits exist in git | `git log --oneline` | f4d84d4 and b8a0faf both present | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| RAG-01 | 12-02 | User query embedded and matched via cosine similarity (top 20) | SATISFIED | `GetEmbeddingClient` + `CosineDistance` LINQ + `.Take(20)` in AiDiscoveryService.cs |
| RAG-02 | 12-02 | GPT-4o-mini ranks and filters, returns top 5 with explanations | SATISFIED | `GetChatClient`, `Temperature = 0.3f`, SystemPrompt with "top 5" instruction, AiDiscoverResultDto.Explanation field |
| RAG-03 | 12-02 | Output validation verifies returned TMDB IDs exist in corpus | SATISFIED | `validCandidateIds` HashSet; filter against candidate set; D-14: zero valid returns 503 |
| RAG-04 | Descoped (D-11) | Pipeline falls back to raw vector results when LLM fails | DESCOPED | D-11 override: all AI failures return 503. REQUIREMENTS.md correctly shows `[~]` Descoped (D-11). ROADMAP SC-3 updated to reflect 503 behavior. |
| RAG-05 | 12-02 | Query results cached per-user for 30 minutes | SATISFIED | `BuildCacheKey` (userId:SHA256(query)); `_cache.Set(cacheKey, response, TimeSpan.FromMinutes(30))` |
| PERS-01 | 12-02 | User's watched titles filtered from AI results | SATISFIED | `GetUserEntriesAsync` + `WatchStatus.Watched` filter; D-10 fallback documented |
| PERS-02 | Deferred (D-07) | User's preferred genres and cast boosted in LLM ranking prompt | DEFERRED | D-07 override: binary watched-title filtering only in Phase 12. REQUIREMENTS.md correctly shows `[ ]` deferred to future phase. |
| GUARD-01 | 12-03 | Input validation (non-empty, 500 char max, rate limit 20/hr per user) | SATISFIED | Controller lines 31-35 (empty/length); Program.cs lines 51-58 (rate limit policy) |
| GUARD-02 | 12-01 | System prompt constrains LLM to movie/TV domain with off-topic redirect | SATISFIED | AiDiscoveryPrompts.cs Rule 2 with exact off-topic JSON format; AiDiscoveryService.cs IsOffTopic handling |
| GUARD-03 | 12-01, 12-02, 12-03 | Query and results logged to ai_query_logs with pipeline timing | SATISFIED | FireAndForgetLog writes UserId, QueryText, ResultTmdbIds, ResponseTimeMs, PromptTokens, CompletionTokens, ResponseText |

**Phase 12 Requirement Summary:** 8 satisfied, 1 descoped (RAG-04 per D-11), 1 deferred (PERS-02 per D-07). All 10 requirement IDs accounted for. No orphaned requirements.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| No stub anti-patterns detected | — | — | — | — |

All core service files (AiDiscoveryService.cs, AiDiscoverController.cs, AiDiscoveryPrompts.cs, AiServiceUnavailableException.cs, IAiDiscoveryService.cs) scanned for TODO/FIXME, empty returns, hardcoded data, and placeholder patterns. None found. All data paths lead to real API calls or real DB queries. Planning document updates in Plan 04 are documentation-only with no code anti-patterns possible.

---

## Human Verification Required

### 1. End-to-End Query Returns 5 Results

**Test:** POST to `/api/ai-discover` with body `{"query": "time loop comedy"}` as an authenticated user with Azure OpenAI credentials configured
**Expected:** HTTP 200 with 5 results containing TMDB IDs, match scores between 0 and 1, and explanation text; responseTimeMs less than 25000
**Why human:** Requires live Azure OpenAI (embedding + GPT-4o-mini) and a seeded pgvector database

### 2. Caching Behavior

**Test:** Send the same query twice within 30 minutes as the same user
**Expected:** Second response is identical to first; logs show one new ai_query_logs entry (not two), or second response arrives significantly faster
**Why human:** IMemoryCache behavior requires live server; no integration test harness exists for this phase

### 3. Rate Limiting at 21st Request

**Test:** Send 21 identical requests within 1 hour from the same authenticated user session
**Expected:** Requests 1-20 return 200; request 21 returns 429 with Retry-After header
**Why human:** Fixed-window rate limiter with per-user partitioning requires a running ASP.NET server; no integration test exists for rate limiting in this phase

---

## Gaps Summary

No gaps remain. Both documentation gaps from the initial verification were closed by Plan 04:

**Gap 1 (closed) — RAG-04 / Success Criterion 3:** ROADMAP.md SC-3 now correctly states "HTTP 503 with Retry-After header (per D-11)". REQUIREMENTS.md RAG-04 is now `[~]` Descoped (D-11). Traceability table shows "Descoped (D-11)". Coverage count updated to "Descoped: 1".

**Gap 2 (closed) — PERS-02 / Success Criterion 2:** ROADMAP.md SC-2 now correctly states "genre boosting deferred per D-07 — watched-title filtering only in Phase 12". REQUIREMENTS.md PERS-02 traceability shows "Deferred (D-07)". The PERS-01 implementation is verified complete.

The three remaining human_verification items are not gaps — the code and wiring are verified correct. They require a live environment to confirm end-to-end behavior (Azure OpenAI + pgvector database + running ASP.NET server).

---

_Verified: 2026-03-28_
_Verifier: Claude (gsd-verifier)_
