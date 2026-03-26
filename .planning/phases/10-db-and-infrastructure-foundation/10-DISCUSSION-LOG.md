# Phase 10: DB and Infrastructure Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-26
**Phase:** 10-db-and-infrastructure-foundation
**Areas discussed:** pgvector Docker strategy, Azure OpenAI wiring, EF Core vector mapping, Scope: TV shows, HNSW index tuning, Migration strategy, DI lifetime & startup validation

---

## pgvector Docker Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Swap to pgvector image | Replace postgres:16-alpine with pgvector/pgvector:pg16. Zero-config, extension pre-installed. | ✓ |
| Custom Dockerfile from alpine | Keep alpine base, install pgvector from source. More control but maintenance burden. | |
| Init script on current image | Mount init SQL script — fails without pgvector installed in image. | |

**User's choice:** Swap to pgvector image
**Notes:** Official pgvector image, widely used, zero-config.

| Option | Description | Selected |
|--------|-------------|----------|
| EF Core migration | HasPostgresExtension("vector") in DbContext — schema changes in one place | ✓ |
| Docker init SQL script | Mount .sql to /docker-entrypoint-initdb.d/ — runs once on first start | |
| Manual / on-demand | Document command, let developers run manually | |

**User's choice:** EF Core migration
**Notes:** Single source of truth for schema.

| Option | Description | Selected |
|--------|-------------|----------|
| Swap in-place | Change image tag, existing pgdata volume compatible | ✓ |
| Fresh volume | docker compose down -v, start fresh | |

**User's choice:** Swap in-place

| Option | Description | Selected |
|--------|-------------|----------|
| Rolling pg16 tag | Always gets latest pgvector on PG16 | ✓ |
| Pin exact version | Reproducible builds, manual bumps needed | |

**User's choice:** Rolling pg16 tag

| Option | Description | Selected |
|--------|-------------|----------|
| Keep pg_isready | Healthcheck confirms PG is accepting connections, extension is app concern | ✓ |
| Add extension check | Verify vector extension in healthcheck — couples infra to migration state | |

**User's choice:** Keep pg_isready

---

## Azure OpenAI Wiring

| Option | Description | Selected |
|--------|-------------|----------|
| Azure.AI.OpenAI | Official Azure OpenAI NuGet package with built-in retry and typed responses | ✓ |
| Raw HttpClient | Call REST API directly — more boilerplate | |
| OpenAI package + Azure config | Generic OpenAI package with Azure endpoint override — misses Azure features | |

**User's choice:** Azure.AI.OpenAI

| Option | Description | Selected |
|--------|-------------|----------|
| Flat env vars | AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, etc. Simple, Docker-friendly | ✓ |
| Nested appsettings section | AzureOpenAI:Endpoint etc. with IOptions<T> pattern | |

**User's choice:** Flat env vars

| Option | Description | Selected |
|--------|-------------|----------|
| Use model names as defaults | Default deployment names to text-embedding-3-small and gpt-4o-mini | ✓ |
| I know my deployment names | Provide actual Azure deployment names now | |

**User's choice:** Use model names as defaults
**Notes:** Resolves STATE.md blocker about deployment names.

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal /health/ai endpoint | Dev-only GET endpoint resolving AzureOpenAIClient from DI | ✓ |
| Integration test only | xUnit test, no HTTP endpoint | |
| You decide | Claude picks approach | |

**User's choice:** Minimal /health/ai endpoint

---

## EF Core Vector Mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Npgsql native pgvector | UseVector() + NpgsqlVector property type, full LINQ integration | ✓ |
| Raw SQL for vector ops | byte[]/string entity, FromSqlRaw for queries | |
| Hybrid approach | Npgsql mapping for entity, raw SQL for distance queries | |

**User's choice:** Npgsql native pgvector

| Option | Description | Selected |
|--------|-------------|----------|
| Denormalized (per spec) | All metadata in movie_embeddings table, zero joins | ✓ |
| Lean table + join | Only tmdb_id/embedding, fetch metadata at query time | |

**User's choice:** Denormalized per spec

| Option | Description | Selected |
|--------|-------------|----------|
| Create both tables now | movie_embeddings + ai_query_logs in one migration | ✓ |
| Defer ai_query_logs to Phase 12 | Only movie_embeddings now | |

**User's choice:** Create both tables now

---

## Scope: TV Shows

| Option | Description | Selected |
|--------|-------------|----------|
| Movies only for v2.0 | 10,000 movies, TV shows deferred to v2.1 | |
| Include TV shows | Both movies and TV shows in v2.0 | ✓ |
| Movies + small TV sample | 10,000 movies + 2,000 TV shows | |

**User's choice:** Include TV shows

| Option | Description | Selected |
|--------|-------------|----------|
| 5,000 TV shows (250 pages) | 2:1 ratio, 15,000 total corpus | ✓ |
| 10,000 TV shows (500 pages) | 1:1 ratio, 20,000 total | |
| 2,500 TV shows (125 pages) | Light coverage, 12,500 total | |

**User's choice:** 5,000 TV shows
**Notes:** Resolves STATE.md blocker about TV show scope.

---

## HNSW Index Tuning

| Option | Description | Selected |
|--------|-------------|----------|
| Defaults (m=16, ef_construction=64) | Well-tuned for 15K rows, >99% recall | ✓ |
| Custom parameters (m=24, ef_construction=100) | Marginal improvement at this scale | |

**User's choice:** Defaults

| Option | Description | Selected |
|--------|-------------|----------|
| In the migration | Create index on empty table, incremental inserts fine at 15K | ✓ |
| After seeding | Build index after all rows inserted | |

**User's choice:** In the migration

---

## Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Single migration | One atomic migration: extension + tables + index + constraints | ✓ |
| Split: schema + index | Two migrations for granular rollback | |
| Split: per table | Three migrations, maximum granularity | |

**User's choice:** Single migration

---

## DI Lifetime & Startup Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Singleton | Thread-safe, lightweight sub-clients | ✓ |
| Scoped | New instance per request, unnecessary overhead | |

**User's choice:** Singleton

| Option | Description | Selected |
|--------|-------------|----------|
| Fail-fast | Throw on startup if endpoint/key missing | ✓ |
| Graceful skip | Don't register client, AI features disabled | |
| Warn and continue | Log warning, stub client, 503 on AI endpoints | |

**User's choice:** Fail-fast

| Option | Description | Selected |
|--------|-------------|----------|
| Store in DI as options class | AzureOpenAIOptions record with deployment names | ✓ |
| Read config directly in services | Each service reads IConfiguration | |

**User's choice:** Store in DI as options class

---

## Claude's Discretion

- Entity property naming conventions
- Internal project structure for AI-related models
- `.env.example` formatting

## Deferred Ideas

None — discussion stayed within phase scope.
