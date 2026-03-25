# Phase 10: DB and Infrastructure Foundation - Context

**Gathered:** 2026-03-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable the database and backend to store and query vector embeddings, and make the Azure OpenAI SDK available to all services via DI. This phase delivers infrastructure only — no embedding pipeline, no query logic, no UI. The output is: pgvector-enabled PostgreSQL, two new tables (`movie_embeddings` + `ai_query_logs`), an HNSW index, and a configured `AzureOpenAIClient` in DI.

</domain>

<decisions>
## Implementation Decisions

### pgvector Docker Strategy
- **D-01:** Swap Docker image from `postgres:16-alpine` to `pgvector/pgvector:pg16` (rolling tag, not pinned)
- **D-02:** In-place volume swap — existing `pgdata` volume is binary-compatible, no data loss
- **D-03:** Extension created via EF Core migration (`HasPostgresExtension("vector")`), not Docker init script
- **D-04:** Existing `pg_isready` healthcheck unchanged — extension verification is an app concern, not infra

### Azure OpenAI SDK & Configuration
- **D-05:** Use `Azure.AI.OpenAI` NuGet package (v2.x) — official SDK with built-in retry and typed clients
- **D-06:** Flat environment variables for configuration: `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_EMBEDDING_DEPLOYMENT`, `AZURE_OPENAI_CHAT_DEPLOYMENT`
- **D-07:** Deployment names default to model names (`text-embedding-3-small`, `gpt-4o-mini`) — actual Azure deployment names overridden in `.env`
- **D-08:** `AzureOpenAIClient` registered as singleton in DI — thread-safe, lightweight sub-clients via `GetEmbeddingClient()` / `GetChatClient()`
- **D-09:** `AzureOpenAIOptions` record registered as singleton in DI — holds `EmbeddingDeployment` and `ChatDeployment` names so services don't read config directly
- **D-10:** Fail-fast on startup if `AZURE_OPENAI_ENDPOINT` or `AZURE_OPENAI_API_KEY` are missing — matches existing TMDB key validation pattern
- **D-11:** Minimal `/health/ai` GET endpoint (dev-only, requires auth) — resolves `AzureOpenAIClient` from DI and confirms it's configured. Satisfies success criteria #4.
- **D-12:** Azure OpenAI env vars documented in `.env.example`

### EF Core Vector Mapping
- **D-13:** Use Npgsql native pgvector support — `UseVector()` on Npgsql options, `NpgsqlVector` property type for embedding column
- **D-14:** Denormalized `movie_embeddings` table per architecture spec — all metadata columns (title, overview, genres, keywords, cast_crew, release_year, vote_average, content_text) alongside embedding. Zero joins on query path.
- **D-15:** Both `movie_embeddings` and `ai_query_logs` tables created in Phase 10's migration — Phase 12 starts without needing another migration

### HNSW Index
- **D-16:** Default HNSW parameters (m=16, ef_construction=64) — optimal for 15K-row corpus
- **D-17:** Index created in the migration (on empty table) — pgvector handles incremental inserts efficiently at this scale

### Migration Strategy
- **D-18:** Single atomic migration (`AddAiDiscoverySchema`): enable vector extension + create movie_embeddings + HNSW index + create ai_query_logs + unique constraint on (tmdb_id, media_type)

### Scope: TV Shows
- **D-19:** TV shows ARE in scope for v2.0 — schema includes `media_type` column with `UNIQUE(tmdb_id, media_type)` constraint
- **D-20:** Target corpus: 10,000 movies + 5,000 TV shows = 15,000 total titles (pipeline details in Phase 11)

### Claude's Discretion
- Entity property naming conventions (PascalCase C# properties mapped to snake_case PostgreSQL columns via EF Core conventions)
- Internal project structure for AI-related models (subfolder under Models/ or new top-level directory)
- `.env.example` formatting and documentation style

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Design
- `ai-rag-feature/architecture.md` — Full system architecture including database schema, embedding pipeline flow, RAG pipeline steps, and guardrails architecture
- `ai-rag-feature/design-spec.md` — Design specification for the AI discovery feature
- `ai-rag-feature/implementation-roadmap.md` — Implementation roadmap with phase breakdown

### Codebase Maps
- `.planning/codebase/STACK.md` — Technology stack details (NuGet packages, .NET 8, EF Core 9, Npgsql)
- `.planning/codebase/ARCHITECTURE.md` — Layered architecture patterns and service organization
- `.planning/codebase/CONVENTIONS.md` — Coding conventions and patterns used in the backend

### Key Source Files
- `docker-compose.yml` — Docker Compose configuration (db service image swap needed)
- `backend/backend.csproj` — NuGet package references (Azure.AI.OpenAI needs to be added)
- `backend/Data/AppDbContext.cs` — EF Core DbContext (add HasPostgresExtension + new entity configs)
- `backend/Program.cs` — DI registration and startup configuration (add Azure OpenAI client registration)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **AppDbContext.cs**: EF Core DbContext with existing entity configurations — add new entity configs alongside existing ones
- **Program.cs**: DI registration pattern already used for `IMemoryCache`, `IHttpClientFactory`, rate limiter — follow same pattern for `AzureOpenAIClient`
- **TmdbRefreshBackgroundService**: Existing `BackgroundService` pattern — model for Phase 11's embedding pipeline
- **Existing rate limiter**: ASP.NET Core rate limiting middleware in `Program.cs` — Phase 12 adds "ai" policy alongside existing policies

### Established Patterns
- **Configuration**: Environment variables override `appsettings.json` via double-underscore convention (e.g., `ConnectionStrings__DefaultConnection`)
- **Service registration**: Services registered via `AddScoped`/`AddSingleton` in `Program.cs` with interface abstractions
- **Entity models**: Located in `backend/Models/Entities/` with navigation properties and EF Core Fluent API configuration
- **Fail-fast validation**: TMDB API key throws on startup if missing — same pattern for Azure OpenAI

### Integration Points
- **docker-compose.yml db service**: Image tag change from `postgres:16-alpine` to `pgvector/pgvector:pg16`
- **docker-compose.yml backend service**: Add 4 Azure OpenAI environment variables
- **backend.csproj**: Add `Azure.AI.OpenAI` NuGet package
- **Program.cs**: Add `AzureOpenAIClient` and `AzureOpenAIOptions` singleton registrations + fail-fast validation
- **AppDbContext.cs**: Add `HasPostgresExtension("vector")` + `UseVector()` + new `DbSet<MovieEmbedding>` and `DbSet<AiQueryLog>`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches following existing codebase conventions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 10-db-and-infrastructure-foundation*
*Context gathered: 2026-03-26*
