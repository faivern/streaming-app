---
phase: 12-rag-query-service-and-api
plan: "02"
subsystem: backend-ai
tags: [rag, ai-discovery, azure-openai, pgvector, caching, personalization]
dependency_graph:
  requires: [12-01]
  provides: [IAiDiscoveryService, AiDiscoveryService]
  affects: [backend/Configuration/ServiceRegistration.cs]
tech_stack:
  added: []
  patterns:
    - RAG pipeline (embed -> vector search -> personalize -> LLM rank -> validate -> cache + log)
    - Fire-and-forget logging via IServiceScopeFactory
    - IMemoryCache with SHA256 cache key
key_files:
  created:
    - backend/Services/AiDiscoveryService.cs
  modified:
    - backend/Configuration/ServiceRegistration.cs
decisions:
  - "CosineDistance LINQ extension used for vector search — Pgvector.EntityFrameworkCore provides this, cleaner than raw SQL"
  - "JsonPropertyName attributes on private LLM records alongside case-insensitive options — belt-and-suspenders for LLM key casing variance"
  - "validCandidateIds built from full 20-item candidates list (not just filtered 10) — catches any hallucinated IDs against all retrieved candidates"
metrics:
  duration: 81s
  completed: "2026-03-28T17:47:23Z"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 12 Plan 02: AiDiscoveryService RAG Pipeline Summary

**One-liner:** Full 6-step RAG pipeline — embed query, top-20 cosine vector search, watched-title filter, GPT-4o-mini ranking of top 10, output validation against candidate set, 30-min IMemoryCache + fire-and-forget query logging.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement AiDiscoveryService with full RAG pipeline | 2c43802 | backend/Services/AiDiscoveryService.cs (created, 281 lines) |
| 2 | Register AiDiscoveryService in DI | edee246 | backend/Configuration/ServiceRegistration.cs |

## What Was Built

### AiDiscoveryService.cs (281 lines)

Implements `IAiDiscoveryService` with a single `DiscoverAsync(query, userId)` method executing the complete RAG pipeline:

**Step 0 — Cache check:** SHA256 hash of `query.Trim().ToLowerInvariant()` forms key `ai_discover:{userId}:{hash}`. Cache hit returns immediately.

**Step 1 — Embed:** `AzureOpenAIClient.GetEmbeddingClient(EmbeddingDeployment).GenerateEmbeddingAsync(query)` → `Pgvector.Vector`. Failure throws `AiServiceUnavailableException`.

**Step 2 — Vector search:** `_db.MovieEmbeddings.OrderBy(e => e.Embedding.CosineDistance(queryVector)).Take(20).ToListAsync()` via Pgvector.EntityFrameworkCore LINQ extension.

**Step 3 — Personalize:** `GetUserEntriesAsync(userId)` → filter `WatchStatus.Watched` → remove from candidates. If all watched, fall back to full candidate list (D-10).

**Step 4 — LLM rank:** `GetChatClient(ChatDeployment).CompleteChatAsync(messages, { Temperature = 0.3f })` with `SystemChatMessage(AiDiscoveryPrompts.SystemPrompt)` + formatted candidates. Top 10 filtered candidates passed to LLM. Failure throws `AiServiceUnavailableException`.

**Step 5 — Validate:** Deserialize LLM JSON into `LlmResponse` record. If `IsOffTopic`, return empty results immediately. Cross-reference `TmdbId` against full 20-candidate set — drop any not present. Zero valid results → `AiServiceUnavailableException` (D-14).

**Step 6 — Respond + cache + log:** Build `AiDiscoverResponseDto`, cache for 30 minutes, fire-and-forget `Task.Run` with `IServiceScopeFactory.CreateScope()` to save `AiQueryLog` (includes `ResponseText`, `PromptTokens`, `CompletionTokens`).

### ServiceRegistration.cs

Added `services.AddScoped<IAiDiscoveryService, AiDiscoveryService>()` after the existing `IMediaEntryService` registration.

## Verification

- `dotnet build` passes — 0 errors, 0 warnings
- All 11 acceptance criteria met (class declaration, method signature, all pipeline steps, cache key, logging, error handling)
- 281 lines (above 150-line minimum)
- Watched-title filtering uses `WatchStatus.Watched` enum
- LLM output validated against full 20-candidate set
- Fire-and-forget uses `IServiceScopeFactory` for separate `DbContext` scope (avoids scoped service in background thread)

## Deviations from Plan

### Auto-applied clarifications

**1. [Rule 2 - Missing Detail] JsonPropertyName attributes on private records**
- **Found during:** Task 1
- **Issue:** Plan specified `JsonSerializerOptions { PropertyNameCaseInsensitive = true }` for LLM parsing. Added `[JsonPropertyName]` attributes on the private `LlmResult`/`LlmResponse` records as belt-and-suspenders since camelCase is the expected LLM output format.
- **Fix:** Both attributes and case-insensitive options applied together.
- **Files modified:** AiDiscoveryService.cs

None — plan executed as specified; the clarification above is supplementary, not a deviation from behavior.

## Known Stubs

None — pipeline is fully wired. No hardcoded empty values flow to callers. Controller (Plan 03) will call `DiscoverAsync` with real user/query data.
