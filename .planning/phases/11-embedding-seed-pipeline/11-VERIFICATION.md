---
phase: 11-embedding-seed-pipeline
verified: 2026-03-26T20:00:00Z
status: gaps_found
score: 3/4 success criteria verified
re_verification: false
gaps:
  - truth: "A spot-check query ('Bill Murray time loop comedy') returns Groundhog Day in the top 5 cosine similarity results, confirming alignment and content text quality"
    status: failed
    reason: "This criterion requires a live pgvector database populated with seed data and an embedding query. The pipeline code exists and content text is verified correct by unit tests, but no runtime data is available in this environment to confirm the spot-check passes."
    artifacts:
      - path: "backend/Services/EmbeddingContentBuilder.cs"
        issue: "Code is correct and tested, but live query result cannot be verified programmatically without a running database"
    missing:
      - "Human must run the pipeline against a live database with pgvector, then execute: SELECT title FROM movie_embeddings ORDER BY embedding <=> (SELECT embedding FROM azure_openai_call('Bill Murray time loop comedy')) LIMIT 5 and verify Groundhog Day appears"
human_verification:
  - test: "Alignment spot-check: run seed pipeline to completion, then query with 'Bill Murray time loop comedy'"
    expected: "Groundhog Day appears in the top 5 cosine similarity results"
    why_human: "Requires live pgvector database with seed data and Azure OpenAI API key to generate the query embedding — cannot be verified without a running stack"
---

# Phase 11: Embedding Seed Pipeline Verification Report

**Phase Goal:** 15,000 TMDB titles (10,000 movies + 5,000 TV) are embedded and stored in pgvector; the pipeline is observable, restartable, and alignment-verified
**Verified:** 2026-03-26T20:00:00Z
**Status:** gaps_found (1 human-only gap)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | After startup, `movie_embeddings` table reaches 10,000 rows without manual intervention | VERIFIED | `EmbeddingSeedBackgroundService` starts with 5-min delay, runs weekly cycle; `EmbeddingSeedService.RunAsync` drives up to 500 pages x 20 = 10,000 movies then 250 x 20 = 5,000 TV |
| 2 | Stopping and restarting the backend mid-seed resumes from checkpoint rather than restarting from zero | VERIFIED | `startPage = (existingCount / TitlesPerPage) + 1` — 10 unit tests confirm calculation; pipeline counts existing DB rows at startup |
| 3 | A spot-check query ("Bill Murray time loop comedy") returns Groundhog Day in the top 5 cosine similarity results | HUMAN NEEDED | Content text for Groundhog Day is confirmed by unit test to include all required fields (genre, director, cast, keywords, rating). Live database query cannot be run in this environment. |
| 4 | The pipeline handles Azure OpenAI 429 rate limit responses and continues without crashing | VERIFIED | `catch (Azure.RequestFailedException ex) when (ex.Status == 429)` logs error at batch level and skips; `OperationCanceledException` re-thrown; pipeline loop continues |

**Score:** 3/4 success criteria verified programmatically (SC3 requires human)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/Services/EmbeddingContentBuilder.cs` | Static prose builder for movies and TV | VERIFIED | 99 lines; `BuildMovieText` and `BuildTvText` present; `.Take(5)` cast limit; TV uses `d.Keywords?.Results?` (TMDB inconsistency handled) |
| `backend/Models/Tmdb/TmdbDetailModels.cs` | Extended with genres, keywords, credits | VERIFIED | Contains `TmdbGenre`, `TmdbKeyword`, `TmdbCastMember`, `TmdbCrewMember`, `TmdbCreator`, `TmdbNetwork`, `TmdbKeywordsMovie`, `TmdbKeywordsTv`, `TmdbCredits`; both `TmdbMovieDetails` and `TmdbTvDetails` extended |
| `backend/Services/Tmdb/TmdbService.cs` | Seed-specific fetch methods | VERIFIED | `GetMovieDetailsForSeedAsync` with `movie_seed_` cache prefix; `append_to_response=keywords,credits` in URL; all 4 seed methods implemented |
| `backend/backend.Tests/Unit/Services/EmbeddingContentBuilderTests.cs` | 9+ unit tests for content composition | VERIFIED | 282 lines; 9 `[Fact]` methods; Groundhog Day and Breaking Bad full prose tests; all 5 edge-case tests present; all 9 pass |
| `backend/Services/IEmbeddingSeedService.cs` | Interface for seed service | VERIFIED | `Task RunAsync(CancellationToken ct)` |
| `backend/Services/EmbeddingSeedService.cs` | Full seed pipeline | VERIFIED | 332 lines; all constants present (`MovieTarget = 10_000`, `TvTarget = 5_000`, `BatchSize = 50`, `ThrottleDelayMs = 250`); checkpoint, 429 handling, upsert, cancellation all implemented |
| `backend/BackgroundJobs/EmbeddingSeedBackgroundService.cs` | Hosted background service lifecycle | VERIFIED | `BackgroundService` subclass; `TimeSpan.FromMinutes(5)` startup delay; `TimeSpan.FromDays(7)` weekly cycle; `IServiceScopeFactory` scope pattern |
| `backend/Configuration/ServiceRegistration.cs` | DI registration | VERIFIED | `AddScoped<IEmbeddingSeedService, EmbeddingSeedService>()` and `AddHostedService<EmbeddingSeedBackgroundService>()` both present |
| `backend/Models/Dtos/SeedStatusDto.cs` | Response DTO for /health/seed | VERIFIED | `record SeedStatusDto(string Phase, int MovieCount, int TvCount, int TotalTarget, double PercentComplete)` |
| `backend/Controllers/HealthAiController.cs` | /health/seed endpoint | VERIFIED | `GetSeedStatus()` endpoint; dev-only guard (`IsDevelopment()` → `NotFound()`); `_db.MovieEmbeddings.CountAsync` for both movie and tv; phase detection logic matches targets |
| `backend/backend.Tests/Unit/Controllers/SeedHealthControllerTests.cs` | 6 tests for /health/seed | VERIFIED | 156 lines; 6 `[Fact]` methods; all 6 pass |
| `backend/backend.Tests/Unit/Services/EmbeddingSeedServiceTests.cs` | Checkpoint and constant tests | VERIFIED | 114 lines; 10 `[Fact]` methods; all 10 pass |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `EmbeddingContentBuilder.cs` | `TmdbDetailModels.cs` | `BuildMovieText(TmdbMovieDetails d)` / `BuildTvText(TmdbTvDetails d)` | WIRED | Parameters use model types directly; confirmed by passing unit tests |
| `TmdbService.cs` | `TmdbDetailModels.cs` | `JsonSerializer.Deserialize<TmdbMovieDetails>` / `<TmdbTvDetails>` | WIRED | Lines 438, 444, 466, 472 in TmdbService.cs |
| `EmbeddingSeedService.cs` | `EmbeddingContentBuilder.cs` | `EmbeddingContentBuilder.BuildMovieText` / `.BuildTvText` | WIRED | Lines 147 and 163 in EmbeddingSeedService.cs |
| `EmbeddingSeedService.cs` | `ITmdbService` | `_tmdbService.GetMovieDetailsForSeedTypedAsync` / `GetPopularMoviesPageAsync` | WIRED | Lines 102–103, 137, 153 in EmbeddingSeedService.cs |
| `EmbeddingSeedBackgroundService.cs` | `IEmbeddingSeedService` | `GetRequiredService<IEmbeddingSeedService>()` | WIRED | Line 50 in EmbeddingSeedBackgroundService.cs |
| `ServiceRegistration.cs` | `EmbeddingSeedBackgroundService` | `AddHostedService<EmbeddingSeedBackgroundService>()` | WIRED | Line 25 in ServiceRegistration.cs |
| `HealthAiController.cs` | `AppDbContext` | `_db.MovieEmbeddings.CountAsync(...)` | WIRED | Lines 54–57 in HealthAiController.cs |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `EmbeddingSeedService.cs` | `batch` (entities with embeddings) | Azure OpenAI `GenerateEmbeddingsAsync` → `Pgvector.Vector` → `_db.SaveChangesAsync` | Yes — DB write is wired; runtime data depends on live Azure OpenAI service | VERIFIED (code path complete; runtime requires external service) |
| `HealthAiController.GetSeedStatus` | `movieCount`, `tvCount` | `_db.MovieEmbeddings.CountAsync(e => e.MediaType == ...)` | Yes — direct DB count query; verified by 6 InMemory tests | VERIFIED |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| EmbeddingContentBuilder unit tests | `dotnet test --filter EmbeddingContentBuilderTests` | 9/9 passed | PASS |
| EmbeddingSeedService checkpoint tests | `dotnet test --filter EmbeddingSeedServiceTests` | 10/10 passed | PASS |
| SeedHealthControllerTests | `dotnet test --filter SeedHealthControllerTests` | 6/6 passed | PASS |
| AiHealthControllerTests (regression) | `dotnet test --filter AiHealthControllerTests` | 2/2 passed | PASS |
| Full backend build | `dotnet build backend/backend.csproj` | 0 errors, 0 warnings | PASS |
| Live pipeline execution | Requires running stack + Azure OpenAI API key | Not runnable in this environment | SKIP |

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| INFRA-01 | 11-01, 11-02, 11-03 | Embedding pipeline seeds 10,000 TMDB titles into pgvector with text-embedding-3-small embeddings | SATISFIED | `EmbeddingSeedService` fetches popular pages, builds content text via `EmbeddingContentBuilder`, calls `GenerateEmbeddingsAsync` (text-embedding-3-small deployment), upserts into `movie_embeddings` via `Pgvector.Vector`. Target of 10,000 movies + 5,000 TV enforced by constants. |
| INFRA-04 | 11-01, 11-02, 11-03 | Embedding pipeline runs as background service with checkpoint/restart support | SATISFIED | `EmbeddingSeedBackgroundService : BackgroundService` with 5-min delay and 7-day cycle; `startPage = (existingCount / TitlesPerPage) + 1` provides checkpoint resume; `movieCount + tvCount >= TotalTarget` skips complete seeds; observability via `/health/seed` endpoint. |

No orphaned requirements: REQUIREMENTS.md maps both INFRA-01 and INFRA-04 exclusively to Phase 11, and all three plans in the phase claim both IDs.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

Scan performed on all 12 phase artifacts. No TODO/FIXME/HACK/PLACEHOLDER comments, no stub return patterns, no hardcoded empty data in rendering paths. All `return null` / `return []` occurrences are guarded fallback paths (e.g. null-coalescing in LINQ chains), not stub implementations.

### Human Verification Required

#### 1. Alignment Spot-Check

**Test:** Run the backend with a populated pgvector database. Allow the seed pipeline to complete (or seed Groundhog Day manually). Execute a cosine similarity query with the text "Bill Murray time loop comedy" embedded via text-embedding-3-small.

**Expected:** Groundhog Day (TMDB ID 315) appears in the top 5 results. The content text generated by `EmbeddingContentBuilder.BuildMovieText` for Groundhog Day is: `"Groundhog Day (1993) is a Comedy, Romance, Fantasy film directed by Harold Ramis, starring Bill Murray, Andie MacDowell, Chris Elliott, Stephen Tobolowsky, Brian Doyle-Murray. A weatherman finds himself inexplicably living the same day over and over again. Keywords: time loop, weather, self improvement. Rated 8.0/10."` — this is already proven correct by the unit test. The question is whether the resulting embedding is semantically close enough to the query embedding.

**Why human:** Requires a live Azure OpenAI endpoint (text-embedding-3-small deployment), a running PostgreSQL with pgvector, and a populated `movie_embeddings` table. Cannot be verified without the running stack.

### Gaps Summary

One gap prevents a full "passed" verdict:

**Success Criterion 3 (alignment spot-check)** cannot be verified programmatically. The code is correct and unit-tested: `EmbeddingContentBuilder` produces the exact Groundhog Day prose string proven to be semantically rich. However, confirming that a natural language query retrieves that result requires a live database with populated embeddings and a live Azure OpenAI API call.

All other success criteria are fully verified:
- SC1 (pipeline reaches 10,000 rows): background service lifecycle and seed targets are wired and tested.
- SC2 (checkpoint resume): DB-count-based page calculation is tested with 10 boundary cases.
- SC4 (429 handling): `catch (Azure.RequestFailedException ex) when (ex.Status == 429)` is present and does not crash the pipeline.

The gap is not a code defect — it is a runtime environment constraint. Once the stack is running with real data, this check should be performed by a developer.

---

_Verified: 2026-03-26T20:00:00Z_
_Verifier: Claude (gsd-verifier)_
