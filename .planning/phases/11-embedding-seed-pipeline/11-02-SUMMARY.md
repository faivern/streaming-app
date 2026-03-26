---
phase: 11-embedding-seed-pipeline
plan: "02"
subsystem: infra
tags: [azure-openai, pgvector, background-service, embeddings, dotnet, ef-core]

# Dependency graph
requires:
  - phase: 11-01
    provides: EmbeddingContentBuilder (BuildMovieText/BuildTvText), ITmdbService seed methods (GetMovieDetailsForSeedTypedAsync, GetPopularMoviesPageAsync), TmdbMovieDetails/TmdbTvDetails models
  - phase: 10-01
    provides: MovieEmbedding entity, AppDbContext with movie_embeddings table
  - phase: 10-02
    provides: AzureOpenAIClient and AzureOpenAIOptions DI registration in ServiceRegistration.cs

provides:
  - IEmbeddingSeedService interface (RunAsync contract)
  - EmbeddingSeedService scoped pipeline: TMDB popular pages fetch -> detail with keywords+credits -> EmbeddingContentBuilder text -> Azure OpenAI batch embedding -> pgvector upsert
  - EmbeddingSeedBackgroundService hosted service with 5-min startup delay and weekly refresh cycle
  - DI registration: AddScoped<IEmbeddingSeedService> + AddHostedService<EmbeddingSeedBackgroundService>
  - EmbeddingSeedServiceTests: 10 unit tests for checkpoint page calculation and seed constant correctness

affects: [12-rag-query-pipeline, 13-ai-discovery-frontend]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Checkpoint resume: startPage = (existingCount / titlesPerPage) + 1 from DB row counts"
    - "Skip-when-complete guard: if (movieCount + tvCount >= TotalTarget) return immediately"
    - "Batch embedding: GenerateEmbeddingsAsync(inputs) for 50 titles per Azure OpenAI call"
    - "429 handling: catch Azure.RequestFailedException when ex.Status == 429 — log, skip, no crash"
    - "Scoped service via IServiceScopeFactory in BackgroundService (same pattern as TmdbRefreshBackgroundService)"

key-files:
  created:
    - backend/Services/IEmbeddingSeedService.cs
    - backend/Services/EmbeddingSeedService.cs
    - backend/BackgroundJobs/EmbeddingSeedBackgroundService.cs
    - backend/backend.Tests/Unit/Services/EmbeddingSeedServiceTests.cs
  modified:
    - backend/Configuration/ServiceRegistration.cs

key-decisions:
  - "EmbeddingSeedService is Scoped (not Singleton) — depends on AppDbContext which is scoped; BackgroundService creates a scope per cycle via IServiceScopeFactory"
  - "Checkpoint resume uses DB row count / 20 + 1 to calculate start page — restarts from the beginning of the last incomplete page rather than exactly where it left off (safe, minor re-processing only)"
  - "429 rate-limit errors are caught at batch level, logged as ERROR, and skipped — batch is lost but pipeline continues (D-13, D-14)"
  - "Batch flush happens after each full page worth of IDs, not after each page request — ensures proper batching across the TMDB results"

patterns-established:
  - "Checkpoint pattern: count existing DB rows, calculate resume page, start loop from there"
  - "Azure OpenAI error handling: catch RequestFailedException with Status == 429 separately from generic errors; always re-throw OperationCanceledException"

requirements-completed: [INFRA-01, INFRA-04]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 11 Plan 02: Embedding Seed Pipeline Summary

**Scoped EmbeddingSeedService implements full TMDB-fetch->content-build->Azure-OpenAI-batch-embed->pgvector-upsert pipeline with DB checkpoint resume, 429 handling, and weekly background cycle**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-26T19:18:30Z
- **Completed:** 2026-03-26T19:23:03Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Full embedding seed pipeline: fetches TMDB popular pages, gets detail with keywords+credits via append_to_response, builds content text via EmbeddingContentBuilder, calls Azure OpenAI GenerateEmbeddingsAsync in batches of 50, upserts into movie_embeddings
- Checkpoint resume from DB row counts — skips already-processed pages, skips entire seed when >= 15,000 rows
- EmbeddingSeedBackgroundService registered as hosted service with 5-minute startup delay and 7-day refresh cycle
- 10 unit tests covering checkpoint page calculation (all 5 boundary cases) and seed target constants

## Task Commits

1. **Task 1: IEmbeddingSeedService and EmbeddingSeedService** - `a22437b` (feat)
2. **Task 2: EmbeddingSeedBackgroundService, DI registration, and unit tests** - `109e3af` (feat)

## Files Created/Modified

- `backend/Services/IEmbeddingSeedService.cs` - Interface with `Task RunAsync(CancellationToken ct)`
- `backend/Services/EmbeddingSeedService.cs` - Full pipeline: fetch pages, get details, build text, batch embed, upsert
- `backend/BackgroundJobs/EmbeddingSeedBackgroundService.cs` - Hosted service with 5-min delay and weekly cycle
- `backend/Configuration/ServiceRegistration.cs` - Added AddScoped<IEmbeddingSeedService> and AddHostedService<EmbeddingSeedBackgroundService>
- `backend/backend.Tests/Unit/Services/EmbeddingSeedServiceTests.cs` - 10 tests for checkpoint and constant verification

## Decisions Made

- EmbeddingSeedService is Scoped (not Singleton): it depends on AppDbContext which is registered as Scoped; the BackgroundService uses IServiceScopeFactory to create a scope per cycle — same pattern as TmdbRefreshBackgroundService
- 429 errors are caught at the batch level, logged as ERROR, and the batch is skipped without crashing — pipeline continues to the next batch (D-13, D-14)
- Checkpoint resume calculates `startPage = (existingCount / 20) + 1` — may re-process the last partial page, but this is safe (upsert semantics)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Worktree branch was behind main — needed to fast-forward merge fc8254e (Wave 1) before packages could be restored and compilation verified. Auto-resolved via `git merge`.

## Next Phase Readiness

- EmbeddingSeedService pipeline is complete and registered in DI
- Plan 11-03 (SeedHealthController) depends on the seed row counts that EmbeddingSeedService will populate — the /health/seed endpoint reads from movie_embeddings to report status
- Phase 12 (RAG query pipeline) depends on movie_embeddings table being populated by this pipeline

---
*Phase: 11-embedding-seed-pipeline*
*Completed: 2026-03-26*
