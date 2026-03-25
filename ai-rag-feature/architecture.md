# AI Discovery — System Architecture

## End-to-End Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER QUERY                                  │
│  "A movie where a guy relives the same day over and over"           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19)                               │
│                                                                      │
│  AiDiscoverPage.tsx                                                  │
│  ├── useAiDiscover() hook (React Query useMutation)                  │
│  └── POST /api/ai/discover { query }                                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│               BACKEND (.NET 8 / ASP.NET Core)                        │
│                                                                      │
│  AiDiscoverController [Authorize] [RateLimit: "ai" — 20/hr/user]     │
│  ├── Extract userId from HttpContext.User claims                     │
│  └── Call AiDiscoveryService.DiscoverAsync(query, userId)            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  RAG PIPELINE (AiDiscoveryService)                    │
│                                                                      │
│  Step 1: EMBED QUERY                                                 │
│  ├── Azure OpenAI text-embedding-3-small                             │
│  ├── Input: user query string                                        │
│  ├── Output: 1536-dimension float vector                             │
│  └── Timeout: 10 seconds                                            │
│                                                                      │
│  Step 2: VECTOR SEARCH                                               │
│  ├── pgvector cosine similarity against movie_embeddings table       │
│  ├── SQL: SELECT *, 1 - (embedding <=> @query) AS similarity        │
│  │        ORDER BY embedding <=> @query LIMIT 20                     │
│  └── Returns top 20 candidates (over-fetch for personalization)      │
│                                                                      │
│  Step 3: PERSONALIZATION                                             │
│  ├── Query user's MediaEntries (status = Watched)                    │
│  ├── Remove already-watched titles from candidates                   │
│  ├── Extract user's top 3 genres + top 3 actors from MediaEntries    │
│  └── Inject preferences into LLM system prompt                      │
│                                                                      │
│  Step 4: LLM CALL                                                    │
│  ├── Azure OpenAI GPT-4o-mini                                        │
│  ├── System prompt: movie-only guardrails + user preferences         │
│  ├── Context: top 10 candidate titles with metadata                  │
│  ├── Output: JSON with 5 best matches + explanations                 │
│  ├── Temperature: 0.3                                                │
│  └── Timeout: 15 seconds                                            │
│                                                                      │
│  Step 5: OUTPUT VALIDATION                                           │
│  ├── Parse LLM JSON response                                        │
│  ├── Verify each tmdb_id exists in movie_embeddings table            │
│  ├── Drop invalid IDs                                                │
│  └── Fallback: if LLM fails, return top 5 vector results            │
│                                                                      │
│  Step 6: RESPONSE                                                    │
│  ├── Enrich with full TMDB metadata (poster, overview, etc.)         │
│  ├── Log to ai_query_logs (fire-and-forget)                          │
│  └── Cache result: key = ai_discover:{userId}:{SHA256(query)}        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RESPONSE TO USER                              │
│                                                                      │
│  {                                                                   │
│    "results": [                                                      │
│      { "tmdbId": 137, "mediaType": "movie",                         │
│        "title": "Groundhog Day",                                     │
│        "explanation": "Classic time-loop comedy...",                  │
│        "matchScore": 0.98 }                                          │
│    ],                                                                │
│    "message": "Sounds like Groundhog Day!...",                       │
│    "responseTimeMs": 1200                                            │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Offline Embedding Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│          EmbeddingSeedBackgroundService (IHostedService)              │
│          Runs on startup (5-min delay) + weekly refresh               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 1. FETCH TMDB    │ │ 2. BUILD TEXT    │ │ 3. EMBED         │
│                  │ │                  │ │                  │
│ Popular movies   │ │ Concatenate:     │ │ Azure OpenAI     │
│ pages 1-500      │ │ title + genres   │ │ text-embedding-  │
│ (10,000 titles)  │ │ + overview +     │ │ 3-small          │
│                  │ │ keywords + cast  │ │                  │
│ Per title:       │ │ + director +     │ │ Batch: 100 at    │
│ - /movie/{id}    │ │ year + rating    │ │ a time           │
│ - /movie/{id}/   │ │                  │ │                  │
│   keywords       │ │ → content_text   │ │ → vector(1536)   │
│ - /movie/{id}/   │ │   string         │ │                  │
│   credits        │ │                  │ │                  │
│                  │ │                  │ │                  │
│ Throttle: 250ms  │ │                  │ │                  │
│ Uses 6hr cache   │ │                  │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               ▼
                  ┌──────────────────────┐
                  │ 4. UPSERT pgvector   │
                  │                      │
                  │ movie_embeddings     │
                  │ table with HNSW      │
                  │ index                │
                  │                      │
                  │ Checkpoint: every    │
                  │ 50 records           │
                  │ Restartable on       │
                  │ failure              │
                  └──────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────┐
│              PostgreSQL 16 + pgvector        │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │       movie_embeddings              │     │
│  ├─────────────────────────────────────┤     │
│  │ id            SERIAL PK             │     │
│  │ tmdb_id       INT NOT NULL          │     │
│  │ media_type    VARCHAR(10)           │     │
│  │ title         VARCHAR(500)          │     │
│  │ overview      TEXT                  │     │
│  │ genres        TEXT                  │     │
│  │ keywords      TEXT                  │     │
│  │ cast_crew     TEXT                  │     │
│  │ release_year  INT                   │     │
│  │ vote_average  DOUBLE                │     │
│  │ content_text  TEXT NOT NULL         │     │
│  │ embedding     vector(1536) NOT NULL │     │
│  │ created_at    TIMESTAMPTZ          │     │
│  │ updated_at    TIMESTAMPTZ          │     │
│  ├─────────────────────────────────────┤     │
│  │ UNIQUE(tmdb_id, media_type)         │     │
│  │ INDEX HNSW(embedding cosine_ops)    │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │       ai_query_logs                 │     │
│  ├─────────────────────────────────────┤     │
│  │ id              SERIAL PK           │     │
│  │ user_id         VARCHAR(450)        │     │
│  │ query_text      TEXT                │     │
│  │ result_tmdb_ids TEXT (JSON array)   │     │
│  │ response_time_ms INT               │     │
│  │ created_at      TIMESTAMPTZ        │     │
│  ├─────────────────────────────────────┤     │
│  │ No FK to AspNetUsers (intentional   │     │
│  │ for logging resilience)             │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │  Existing tables (unchanged):       │     │
│  │  - AspNetUsers (AppUser)            │     │
│  │  - MediaEntries                     │     │
│  │  - Reviews                          │     │
│  │  - Lists + ListItems                │     │
│  └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

## Guardrails Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   3-LAYER DEFENSE                            │
│                                                              │
│  Layer 1: INPUT VALIDATION (backend controller)              │
│  ├── Max 500 characters                                      │
│  ├── Non-empty check                                         │
│  ├── Rate limit: 20 queries/hour per authenticated user      │
│  └── Partition key: user ID from claims (not IP)             │
│                                                              │
│  Layer 2: SYSTEM PROMPT CONSTRAINTS (LLM)                    │
│  ├── Role: movie/TV discovery assistant ONLY                 │
│  ├── Off-topic → friendly redirect message                   │
│  ├── Must ONLY recommend from retrieved RAG context           │
│  ├── Temperature: 0.3 (focused, factual)                     │
│  └── Structured JSON output format enforced                  │
│                                                              │
│  Layer 3: OUTPUT VALIDATION (post-LLM)                       │
│  ├── Parse and validate JSON structure                        │
│  ├── Verify every tmdb_id exists in movie_embeddings          │
│  ├── Drop invalid/hallucinated IDs                            │
│  └── Fallback to raw vector results if LLM output invalid    │
└─────────────────────────────────────────────────────────────┘
```

## Infrastructure

```
docker-compose.yml
├── db: pgvector/pgvector:pg16  (was: postgres:16-alpine)
│   └── pgvector extension bundled
├── backend: .NET 8 SDK
│   ├── New env vars:
│   │   ├── AzureOpenAI__Endpoint
│   │   ├── AzureOpenAI__ApiKey
│   │   ├── AzureOpenAI__EmbeddingDeployment
│   │   └── AzureOpenAI__ChatDeployment
│   └── New NuGet packages:
│       ├── Pgvector.EntityFrameworkCore
│       └── Azure.AI.OpenAI
└── frontend: Node 20
    └── No new npm packages needed
```

## Configuration (User Secrets)

```
dotnet user-secrets set "AzureOpenAI:Endpoint" "https://<resource>.openai.azure.com/"
dotnet user-secrets set "AzureOpenAI:ApiKey" "<key>"
dotnet user-secrets set "AzureOpenAI:EmbeddingDeployment" "text-embedding-3-small"
dotnet user-secrets set "AzureOpenAI:ChatDeployment" "gpt-4o-mini"
```
