---
phase: 10-db-and-infrastructure-foundation
plan: "01"
subsystem: database
tags: [pgvector, postgresql, efcore, azure-openai, migrations, embeddings]

# Dependency graph
requires: []
provides:
  - pgvector-enabled PostgreSQL via pgvector/pgvector:pg16 Docker image
  - MovieEmbedding EF Core entity with vector(1536) column and HNSW index
  - AiQueryLog EF Core entity for AI query observability
  - AddAiDiscoverySchema migration creating both tables with correct indexes
  - Azure OpenAI environment variable configuration wired into Docker Compose
affects:
  - 11-embedding-seed-pipeline
  - 12-rag-query-service
  - 13-ai-discovery-frontend

# Tech tracking
tech-stack:
  added:
    - Pgvector.EntityFrameworkCore 0.3.0 (vector type mapping for EF Core)
    - Azure.AI.OpenAI 2.1.0 (Azure OpenAI client SDK)
  patterns:
    - HNSW index with HasMethod/HasOperators/HasStorageParameter fluent API on embedding column
    - UseVector() on Npgsql options enables pgvector type mapping at the data access layer
    - HasPostgresExtension("vector") ensures CREATE EXTENSION vector in migration Up

key-files:
  created:
    - backend/Models/Entities/MovieEmbedding.cs
    - backend/Models/Entities/AiQueryLog.cs
    - backend/Data/Migrations/20260326002704_AddAiDiscoverySchema.cs
  modified:
    - docker-compose.yml
    - backend/backend.csproj
    - backend/Data/AppDbContext.cs
    - backend/Configuration/ServiceRegistration.cs
    - .env.example

key-decisions:
  - "pgvector/pgvector:pg16 Docker image replaces postgres:16-alpine — drop-in replacement that adds pgvector extension pre-installed"
  - "HNSW index with m=16, ef_construction=64 and vector_cosine_ops — EF Core Npgsql fluent API emits correct WITH parameters natively (no raw SQL needed)"
  - "Single atomic migration AddAiDiscoverySchema creates both tables plus indexes in one operation"
  - "AzureOpenAI double-underscore env var convention (AzureOpenAI__Endpoint) wired into Docker Compose backend service"

patterns-established:
  - "Vector column: [Column(TypeName = \"vector(1536)\")] on Pgvector.Vector property in entity class"
  - "HNSW index: .HasMethod(\"hnsw\").HasOperators(\"vector_cosine_ops\").HasStorageParameter(\"m\", 16).HasStorageParameter(\"ef_construction\", 64)"
  - "Extension registration: builder.HasPostgresExtension(\"vector\") before entity configurations in OnModelCreating"

requirements-completed: [INFRA-02]

# Metrics
duration: 5min
completed: 2026-03-26
---

# Phase 10 Plan 01: DB and Infrastructure Foundation Summary

**pgvector on PostgreSQL via Docker image swap, MovieEmbedding and AiQueryLog EF Core entities, HNSW cosine index, and AddAiDiscoverySchema migration — complete database foundation for Phase 11 seed pipeline and Phase 12 RAG query service**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-26T00:24:21Z
- **Completed:** 2026-03-26T00:29:09Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Swapped `postgres:16-alpine` to `pgvector/pgvector:pg16` in docker-compose.yml enabling vector extension without custom image builds
- Created MovieEmbedding entity with `vector(1536)` column, HNSW index (m=16, ef_construction=64, vector_cosine_ops), and unique constraint on (tmdb_id, media_type)
- Created AiQueryLog entity for query observability (user_id, query_text, response_time_ms, result_tmdb_ids)
- Added `Pgvector.EntityFrameworkCore 0.3.0` and `Azure.AI.OpenAI 2.1.0` to backend.csproj
- Configured `UseVector()` on Npgsql options and `HasPostgresExtension("vector")` in AppDbContext
- Scaffolded single atomic `AddAiDiscoverySchema` migration verified to contain both tables, HNSW index with correct parameters, and unique constraint
- Wired Azure OpenAI env vars into Docker Compose backend service and documented in .env.example

## Task Commits

Each task was committed atomically:

1. **Task 1: Docker image swap, NuGet packages, and entity models** - `8004cd2` (feat)
2. **Task 2: AppDbContext configuration, UseVector(), and EF Core migration** - `15a85bc` (feat)

**Plan metadata:** (created in final commit)

## Files Created/Modified
- `docker-compose.yml` - db image to pgvector/pgvector:pg16; Azure OpenAI env vars in backend service
- `backend/backend.csproj` - Added Pgvector.EntityFrameworkCore 0.3.0 and Azure.AI.OpenAI 2.1.0
- `backend/Models/Entities/MovieEmbedding.cs` - New entity with vector(1536) embedding column
- `backend/Models/Entities/AiQueryLog.cs` - New entity for AI query logging
- `backend/Data/AppDbContext.cs` - HasPostgresExtension, DbSets, fluent config for both entities
- `backend/Configuration/ServiceRegistration.cs` - UseVector() on Npgsql options
- `backend/Data/Migrations/20260326002704_AddAiDiscoverySchema.cs` - Migration creating both tables with HNSW index
- `.env.example` - Azure OpenAI section with 4 variables

## Decisions Made
- EF Core's Npgsql fluent API correctly emits HNSW parameters via Annotations (`Npgsql:StorageParameter:m`, `Npgsql:StorageParameter:ef_construction`) — no raw SQL migration edit needed
- `pgvector/pgvector:pg16` is a drop-in replacement for `postgres:16-alpine`; healthcheck (`pg_isready`) unchanged per D-04
- Azure OpenAI double-underscore convention (`AzureOpenAI__Endpoint`) maps to `IConfiguration` hierarchy without needing custom config binding

## Deviations from Plan

None - plan executed exactly as written. The migration's HNSW index parameters were emitted correctly by the Npgsql EF Core provider via fluent API annotations, so no manual SQL edit was required (plan noted this as conditional).

## Issues Encountered

Pre-existing test failures (29 of 170 tests) were confirmed present before any changes in this plan — not caused by this plan's modifications. Tests pass count held at 141/170.

## User Setup Required

External services require manual configuration before Phase 11 can run:
- Set `AZURE_OPENAI_ENDPOINT` to your Azure OpenAI resource endpoint
- Set `AZURE_OPENAI_API_KEY` to your API key
- Optionally set `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` (default: `text-embedding-3-small`)
- Optionally set `AZURE_OPENAI_CHAT_DEPLOYMENT` (default: `gpt-4o-mini`)
- Copy `.env.example` to `.env` and fill in values before `docker compose up`

## Next Phase Readiness

- Phase 11 (embedding seed pipeline) can now start — pgvector schema is ready, MovieEmbedding entity is wired, Azure OpenAI client SDK is installed
- Phase 12 (RAG query service) depends on Phase 11 seeding data, but the EF Core querying infrastructure (vector type, HNSW index) is ready
- Confirm Azure OpenAI deployment names before Phase 11 config wiring (deployment name may differ from model name)
- Confirm TPM quota before first seed run (reduce batch size if below 250K TPM)

---
*Phase: 10-db-and-infrastructure-foundation*
*Completed: 2026-03-26*
