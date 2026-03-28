---
phase: 12-rag-query-service-and-api
plan: "01"
subsystem: api
tags: [dotnet, efcore, pgvector, azure-openai, dto, interface]

# Dependency graph
requires:
  - phase: 10-db-and-infrastructure-foundation
    provides: AiQueryLog entity and ai_query_logs table already exist in DB
  - phase: 11-embedding-seed-pipeline
    provides: EmbeddingSeedService and MovieEmbedding patterns established
provides:
  - AiQueryLog.ResponseText column and migration
  - AiDiscoverRequestDto, AiDiscoverResultDto, AiDiscoverResponseDto records
  - IAiDiscoveryService interface with DiscoverAsync signature
  - AiDiscoveryPrompts system prompt constants
  - AiServiceUnavailableException shared exception contract
  - AppDbContextFactory for EF design-time migrations
affects:
  - 12-02-rag-service-implementation
  - 12-03-ai-discovery-controller

# Tech tracking
tech-stack:
  added: []
  patterns:
    - IDesignTimeDbContextFactory for EF migrations when startup has external dependencies
    - C# record types for request/response DTOs (positional syntax)
    - Verbatim string literal (""") for multi-line system prompt constants

key-files:
  created:
    - backend/Models/Entities/AiQueryLog.cs (ResponseText property added)
    - backend/Data/AppDbContextFactory.cs
    - backend/Data/Migrations/20260328174220_AddAiQueryLogResponseColumns.cs
    - backend/Models/Dtos/AiDiscoverRequestDto.cs
    - backend/Models/Dtos/AiDiscoverResultDto.cs
    - backend/Models/Dtos/AiDiscoverResponseDto.cs
    - backend/Services/IAiDiscoveryService.cs
    - backend/Services/AiDiscoveryPrompts.cs
    - backend/Services/AiServiceUnavailableException.cs
  modified:
    - backend/Data/AppDbContext.cs (response_text column mapping added)

key-decisions:
  - "IDesignTimeDbContextFactory created in backend/Data/ to bypass Azure OpenAI startup validation during dotnet ef migrations"
  - "AiServiceUnavailableException implements D-11: both embedding and LLM failures return 503, overriding RAG-04 vector fallback"
  - "System prompt includes strict off-topic redirect rule (D-02) and grounding constraint (ONLY recommend from CANDIDATES)"

patterns-established:
  - "DTO pattern: C# record types with positional parameters in backend/Models/Dtos/"
  - "System prompt constants in static class AiDiscoveryPrompts for single source of truth"
  - "AiServiceUnavailableException is the shared error contract across Plans 02 and 03"

requirements-completed: [GUARD-02, GUARD-03, RAG-04]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 12 Plan 01: RAG Pipeline Contracts and Schema Summary

**DTOs, IAiDiscoveryService interface, system prompt constants, AiServiceUnavailableException, and ResponseText column migration for the Phase 12 RAG pipeline**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-28T17:40:00Z
- **Completed:** 2026-03-28T17:43:26Z
- **Tasks:** 2
- **Files modified:** 9 (7 created, 2 modified)

## Accomplishments

- Extended AiQueryLog entity with ResponseText property and generated migration adding `response_text TEXT` column
- Created all 3 response DTOs (AiDiscoverRequestDto, AiDiscoverResultDto, AiDiscoverResponseDto) matching architecture spec
- Created IAiDiscoveryService interface with `DiscoverAsync(string query, string userId, CancellationToken)` signature
- Created AiDiscoveryPrompts with system prompt enforcing movie/TV domain boundary and CANDIDATES-only grounding
- Created AiServiceUnavailableException as shared contract for Plans 02/03 (implements D-11 override of RAG-04)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend AiQueryLog entity, update DbContext config, and create migration** - `1bbce15` (feat)
2. **Task 2: Create DTOs, IAiDiscoveryService interface, system prompt constants, and AiServiceUnavailableException** - `565ec88` (feat)

## Files Created/Modified

- `backend/Models/Entities/AiQueryLog.cs` - Added `public string? ResponseText { get; set; }` after ResultTmdbIds
- `backend/Data/AppDbContext.cs` - Added `entity.Property(e => e.ResponseText).HasColumnName("response_text")`
- `backend/Data/AppDbContextFactory.cs` - IDesignTimeDbContextFactory for EF tooling (design-time only)
- `backend/Data/Migrations/20260328174220_AddAiQueryLogResponseColumns.cs` - Adds `response_text TEXT NULL` to `ai_query_logs`
- `backend/Models/Dtos/AiDiscoverRequestDto.cs` - `record AiDiscoverRequestDto(string Query)`
- `backend/Models/Dtos/AiDiscoverResultDto.cs` - `record AiDiscoverResultDto(int TmdbId, string MediaType, string Title, string Explanation, double MatchScore)`
- `backend/Models/Dtos/AiDiscoverResponseDto.cs` - `record AiDiscoverResponseDto(List<AiDiscoverResultDto> Results, string Message, long ResponseTimeMs)`
- `backend/Services/IAiDiscoveryService.cs` - Interface with DiscoverAsync signature
- `backend/Services/AiDiscoveryPrompts.cs` - SystemPrompt, CandidateTemplate, CandidateItemTemplate constants
- `backend/Services/AiServiceUnavailableException.cs` - Exception : Exception with message + inner

## Decisions Made

- **IDesignTimeDbContextFactory**: Created `AppDbContextFactory` in `backend/Data/` to allow `dotnet ef migrations` to run without Azure OpenAI credentials. The factory bypasses the startup validation in `ServiceRegistration.cs` that throws if Azure OpenAI env vars are missing. Design-time only — not used at runtime.
- **D-11 AiServiceUnavailableException**: Per D-11 decision, both embedding and LLM failures throw `AiServiceUnavailableException` which maps to 503. This overrides RAG-04 (vector fallback on LLM failure). Exception defined here as shared contract.
- **System prompt grounding**: Rule 1 in system prompt strictly says "ONLY recommend titles from the CANDIDATES list" — this is the core RAG grounding constraint per D-03.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created IDesignTimeDbContextFactory to unblock EF migration generation**
- **Found during:** Task 1 (migration generation)
- **Issue:** `dotnet ef migrations add` failed with "Azure OpenAI configuration is missing" because `ServiceRegistration.cs` validates Azure OpenAI credentials at startup, before EF tooling can create the DbContext
- **Fix:** Created `backend/Data/AppDbContextFactory.cs` implementing `IDesignTimeDbContextFactory<AppDbContext>` with a minimal connection string (no Azure OpenAI required)
- **Files modified:** backend/Data/AppDbContextFactory.cs (new file)
- **Verification:** Migration generated successfully after factory was created; `dotnet build` exits 0
- **Committed in:** `1bbce15` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking issue)
**Impact on plan:** Blocking issue with EF tooling resolved by adding design-time factory. No scope creep — factory is required infrastructure for any future migrations.

## Issues Encountered

- EF migrations tooling couldn't create DbContext due to Azure OpenAI credential validation throwing at startup. Resolved by creating IDesignTimeDbContextFactory (Rule 3 auto-fix, no user approval needed).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 (AiDiscoveryService implementation) can use IAiDiscoveryService, AiDiscoveryPrompts, and AiServiceUnavailableException directly
- Plan 03 (controller) can use the DTOs and catch AiServiceUnavailableException to return 503
- ResponseText column in DB allows Plans 02/03 to log full LLM JSON response per D-20
- Any future plans needing EF migrations can use AppDbContextFactory without changes

---
*Phase: 12-rag-query-service-and-api*
*Completed: 2026-03-28*
