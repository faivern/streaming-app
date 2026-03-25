# AI-Powered Movie Discovery — Design Spec

## Overview

Cinelas AI Discovery is a RAG-powered feature that lets users find movies and TV shows through natural language. It solves two problems: "I don't know what to watch" (mood-based discovery) and "What movie is that?" (identification from vague descriptions). This is the flagship differentiator that sets Cinelas apart from other streaming discovery services.

## Architecture

### High-Level Flow

```
User query ("a movie where a guy relives the same day")
    │
    ▼
Frontend (React) ─── POST /api/ai/discover { query }
    │
    ▼
AiDiscoverController [Authorize] [RateLimit: 20/hr per user]
    │
    ▼
AiDiscoveryService.DiscoverAsync()
    ├── 1. Embed query → Azure OpenAI text-embedding-3-small → 1536-dim vector
    ├── 2. Vector search → pgvector cosine similarity → top 20 candidates
    ├── 3. Personalization → filter watched titles, boost preferred genres/cast
    ├── 4. LLM call → GPT-4o-mini picks best 5, explains each match
    ├── 5. Output validation → verify TMDB IDs exist, parse JSON
    └── 6. Return structured response with movie cards + explanations
```

### Offline Embedding Pipeline

```
EmbeddingSeedBackgroundService (runs on startup + weekly refresh)
    ├── Fetch TMDB popular movies/TV pages 1-500 (10,000 titles)
    │   └── Throttle: 250ms between TMDB calls (~4 req/sec, well under 40/10s limit)
    ├── For each: fetch details + keywords + credits via ITmdbService (uses 6hr cache)
    ├── Build content text: title, genres, overview, keywords, cast, director, year, rating
    ├── Batch embed via Azure OpenAI (100 at a time)
    ├── Upsert into movie_embeddings table (pgvector)
    └── Checkpoint: save progress every 50 records (restartable on failure)
```

**Seed timing:** ~30,000 TMDB API calls at 4/sec ≈ 2-3 hours for initial seed. Subsequent weekly refreshes only process new/changed titles (skip existing tmdb_ids), completing in minutes. The job tracks the last-processed page in the database so it can resume after crashes.

**Re-runs use TMDB cache:** The existing `IMemoryCache` with 6hr TTL means repeated detail/keyword/credit fetches within a session hit cache, not the API.

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Embeddings | Azure OpenAI text-embedding-3-small | Convert text to 1536-dim vectors |
| Chat/LLM | Azure OpenAI GPT-4o-mini | Select best matches, generate explanations |
| Vector DB | pgvector (PostgreSQL extension) | Cosine similarity search on embeddings |
| Backend | .NET 8, ASP.NET Core | RAG pipeline orchestration |
| Frontend | React 19, TypeScript, Tailwind CSS 4 | AI Discovery page + floating CTA |
| Caching | IMemoryCache (30-min TTL for AI queries) | Avoid redundant API calls |

## Database Schema

### movie_embeddings table

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE movie_embeddings (
    id              SERIAL PRIMARY KEY,
    tmdb_id         INTEGER NOT NULL,
    media_type      VARCHAR(10) NOT NULL,       -- "movie" or "tv"
    title           VARCHAR(500) NOT NULL,
    overview        TEXT,
    genres          TEXT,                         -- comma-separated
    keywords        TEXT,                         -- comma-separated
    cast_crew       TEXT,                         -- top 5 cast + director
    release_year    INTEGER,
    vote_average    DOUBLE PRECISION,
    content_text    TEXT NOT NULL,                -- full text chunk that was embedded
    embedding       vector(1536) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tmdb_id, media_type)
);

CREATE INDEX idx_embedding_hnsw ON movie_embeddings
    USING hnsw (embedding vector_cosine_ops);
```

### ai_query_logs table

```sql
CREATE TABLE ai_query_logs (
    id                SERIAL PRIMARY KEY,
    user_id           VARCHAR(450) NOT NULL,
    query_text        TEXT NOT NULL,
    result_tmdb_ids   TEXT,                       -- JSON array string
    response_time_ms  INTEGER,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

### EF Core Migration Strategy

The pgvector extension and HNSW index require raw SQL in the EF Core migration since they are PostgreSQL-specific features:

1. The migration must call `migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS vector;")` as the first operation.
2. The `MovieEmbedding.Embedding` property uses `[Column(TypeName = "vector(1536)")]` mapped by `Pgvector.EntityFrameworkCore`.
3. The HNSW index must be created via raw SQL: `migrationBuilder.Sql("CREATE INDEX idx_embedding_hnsw ON \"MovieEmbeddings\" USING hnsw (\"Embedding\" vector_cosine_ops);")` since EF Core does not natively understand the `USING hnsw` syntax.
4. The `UseNpgsql` call in `ServiceRegistration.cs` must include `.UseVector()` to register the pgvector type mappings.

### ai_query_logs Design Notes

The `ai_query_logs` table intentionally has **no foreign key** to `AspNetUsers`. This is for logging resilience — query logs survive user deletion and provide analytics data regardless of user lifecycle. The `user_id VARCHAR(450)` matches ASP.NET Identity's default key length.

## Content Text Format

Each movie/show is embedded as a single text chunk:

```
Title: Inception.
Genres: Science Fiction, Action, Thriller.
Overview: A thief who steals corporate secrets through dream-sharing technology...
Keywords: dream, heist, subconscious, alternate reality.
Cast: Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page.
Director: Christopher Nolan.
Year: 2010. Rating: 8.4/10.
```

## Guardrails (3-Layer Defense)

1. **Input validation (backend):** Max 500 chars, rate limit 20 queries/hour per user (partitioned by authenticated user ID from claims, not IP), non-empty check.
2. **System prompt constraints:** LLM instructed to ONLY discuss movies/TV. Off-topic queries get friendly redirect. Temperature 0.3. Must only recommend from retrieved RAG context.
3. **Output validation:** Verify all returned TMDB IDs exist in embeddings table. Parse and validate LLM JSON. Fallback to raw vector results if LLM parse fails.

### Timeouts & Fallback Strategy

- **LLM call timeout:** 15 seconds via `CancellationTokenSource`. If Azure OpenAI is slow or unresponsive, the request fails gracefully.
- **Embedding call timeout:** 10 seconds. If embedding fails, return 503.
- **Graceful degradation:** If the embedding succeeds but the LLM chat call fails (timeout, parse error, or 5xx), fall back to returning the top 5 vector search results with generic explanations ("Matched based on similar themes and plot elements") instead of LLM-generated ones.
- **User ID source:** Always extracted from `HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)` — never from the request body. This prevents IDOR attacks.

### Caching Strategy

Cache key: `$"ai_discover:{userId}:{SHA256(query.ToLowerInvariant().Trim())}"`. The cache is per-user because results are personalized (watched titles filtered, genre preferences applied). This means cache hit rates will be low, but the 30-min TTL protects against repeated identical queries from the same user. The primary cost savings come from the LLM call, not shared caching.

### System Prompt

```
You are Cinelas AI, a movie and TV show discovery assistant.
You ONLY discuss movies and TV shows. If a query is not about movies or TV,
respond with: "I'm your movie discovery assistant! Try describing a movie
you're looking for or a mood you're in."

Given the user's query and the candidate titles below, select the 5 best matches.
For each, explain WHY it matches the user's mood or description in 1-2 sentences.

Return ONLY valid JSON in this exact format:
{"message": "brief summary", "results": [{"tmdb_id": 123, "media_type": "movie", "explanation": "...", "match_score": 0.95}]}

// Only appended if user has watch history with ratings:
User's preferred genres: {genres}. Favorite actors: {actors}.
Give slight preference to these when matches are close.
// If user has no watch history, this section is omitted entirely.
```

## UI Design

### AI Discovery Page (`/discover/ai`)

- **Auth-gated:** Logged-in users only. Shows sign-in prompt for unauthenticated users.
- **Hero section:** Title "What are you looking for?" with subtitle explaining capabilities.
- **Input bar:** Single text input (max 500 chars) with submit button. Works for both mood queries and movie identification.
- **Quick prompt chips:** Example queries to inspire first-time users:
  - "A mind-bending thriller like Inception"
  - "Cozy feel-good movie for a rainy day"
  - "That movie with the red pill"
- **AI explanation bubble:** Styled card showing the LLM's summary of why these results match.
- **Results grid:** 5 movie/TV cards using existing MediaCard component with added match score badge and per-title explanation.
- **Quick action buttons:** Single-turn refinement that generates a new independent query:
  - "More like these" → new query with result context
  - "Show me TV shows instead" → media type filter
  - "Something darker" → mood modifier

### Frontend States

- **Idle:** Input bar + quick prompt chips. No results shown.
- **Loading:** Skeleton card placeholders + pulsing "Searching..." animation in the AI explanation area. Input disabled during query.
- **Success:** AI explanation bubble + 5 result cards + quick action buttons.
- **Empty results:** Friendly message: "I couldn't find anything matching that description. Try being more specific or use different words."
- **Error (503):** "Our AI is temporarily unavailable. Please try again in a moment."
- **Rate limited (429):** "You've reached the query limit. Try again in {minutes} minutes."
- **Follow-up state:** After results load, the frontend stores the result titles in component state so the "More like these" button can reference them in the next query.

### Floating CTA Button

- Fixed position, bottom-right corner on all pages.
- Text: sparkle icon + "Don't know what to watch?"
- Links to `/discover/ai`.
- Only visible when user is logged in.
- **Mobile:** Positioned above the existing `<BottomNav />` component using `bottom: calc(var(--bottom-nav-height, 4rem) + 1rem)` to avoid overlap.

## API Contract

### POST /api/ai/discover

**Request:**
```json
{ "query": "a movie where a guy relives the same day over and over" }
```

**Response:**
```json
{
  "results": [
    {
      "tmdbId": 137,
      "mediaType": "movie",
      "title": "Groundhog Day",
      "posterPath": "/gCgt1WARPZaXnq523ySQEUKinCs.jpg",
      "overview": "A cynical TV weatherman finds himself...",
      "voteAverage": 7.6,
      "explanation": "The classic time-loop comedy where Bill Murray relives February 2nd.",
      "matchScore": 0.98
    }
  ],
  "message": "Sounds like you're describing Groundhog Day! Here are similar time-loop films:",
  "responseTimeMs": 1200
}
```

**Error responses:**
- 400: Empty query or exceeds 500 chars
- 401: Not authenticated
- 429: Rate limit exceeded (20/hour)
- 503: Azure OpenAI unavailable

## Personalization

- **Filter watched titles:** Query user's MediaEntries (status = Watched) and exclude matching TMDB IDs from results.
- **Boost preferences:** Extract user's top 3 genres and top 3 actors from their MediaEntries. Inject into LLM system prompt for soft preference weighting.
- **Smart follow-ups:** Quick action buttons generate context-aware prompts:
  - "More like these" → "More movies similar to {title1}, {title2} — {original query}"
  - "Something different" → "Something different from {results} — NOT {genres from results}"

## Infrastructure Changes

### docker-compose.yml
- Change `postgres:16-alpine` → `pgvector/pgvector:pg16` (bundles pgvector extension)
- Add Azure OpenAI env vars to backend service

### Configuration (user-secrets)
```
AzureOpenAI:Endpoint        → Azure OpenAI resource URL
AzureOpenAI:ApiKey           → API key
AzureOpenAI:EmbeddingDeployment  → "text-embedding-3-small"
AzureOpenAI:ChatDeployment       → "gpt-4o-mini"
```

### NuGet Packages
- `Pgvector.EntityFrameworkCore` — EF Core support for vector columns and HNSW indexes
- `Azure.AI.OpenAI` — Azure OpenAI SDK for embeddings and chat completions

### npm Packages
- None required. Existing stack covers all needs.

## File Inventory

### New Backend Files (8)
| File | Purpose |
|------|---------|
| `Models/Entities/MovieEmbedding.cs` | pgvector entity |
| `Models/Entities/AiQueryLog.cs` | Query log entity |
| `Models/Dtos/AiDiscoveryDtos.cs` | Request/response DTOs |
| `Services/AI/IAiDiscoveryService.cs` | Service interface |
| `Services/AI/AiDiscoveryService.cs` | RAG pipeline orchestration |
| `Services/AI/EmbeddingTextBuilder.cs` | TMDB data → text chunk builder |
| `BackgroundJobs/EmbeddingSeedBackgroundService.cs` | Offline embedding pipeline |
| `Controllers/AiDiscoverController.cs` | HTTP endpoint |

### New Frontend Files (4)
| File | Purpose |
|------|---------|
| `src/api/aiDiscover.api.ts` | API call layer |
| `src/hooks/ai/useAiDiscover.ts` | React Query mutation hook |
| `src/pages/aiDiscover/AiDiscoverPage.tsx` | Main discovery page |
| `src/components/ai/AiDiscoverCta.tsx` | Floating CTA button |

### Modified Files (5)
| File | Change |
|------|--------|
| `backend/Data/AppDbContext.cs` | Add DbSets + pgvector HNSW index config |
| `backend/Configuration/ServiceRegistration.cs` | Register AzureOpenAIClient (singleton), IAiDiscoveryService (scoped), background job |
| `backend/Constants/CacheDurations.cs` | Add AiQuery (30 min) duration |
| `backend/Program.cs` | Add "ai" rate limit policy (partitioned by user ID from claims, 20/hr) |
| `frontend/src/App.tsx` | Add route + lazy import + CTA component |

### Modified Infrastructure (1)
| File | Change |
|------|--------|
| `docker-compose.yml` | Switch postgres image to pgvector, add Azure env vars |

## Existing Code to Reuse

- `MediaCard` component → render AI results as standard media cards
- `useUser()` hook → auth guard on the page
- `ITmdbService` → fetch details/keywords/credits during embedding pipeline
- `api` Axios instance → HTTP client
- `BackgroundService` pattern → from `TmdbRefreshBackgroundService`
- `IMemoryCache` → cache AI query results
- `[Authorize]` attribute → from existing controllers
- Rate limiting infrastructure → existing `AddPolicy` pattern

## Testing Strategy

### Unit Tests
- `EmbeddingTextBuilderTests` — text assembly from various TMDB inputs
- `AiDiscoveryServiceTests` — mock Azure OpenAI + DbContext, test pipeline steps
- `AiDiscoverControllerTests` — auth, validation, rate limit attributes

### Integration Tests
- Vector search ordering with known embeddings
- End-to-end embedding pipeline write

### Manual Testing Checklist
- "Cozy rainy day movie" → returns reasonable mood-based results
- "That movie with the spinning top" → identifies Inception
- Rate limit triggers after 20 queries/hour
- Already-watched titles excluded
- Off-topic query ("how to cook pasta") → friendly redirect
- Mobile responsive layout
- CTA button visible only when logged in

## Cost Estimates

| Resource | Monthly Cost |
|----------|-------------|
| Embedding generation (10K titles, one-time) | ~$0.04 |
| Query embeddings (1000 queries/month) | ~$0.01 |
| GPT-4o-mini chat (1000 queries/month) | ~$1-3 |
| pgvector storage | $0 (existing PostgreSQL) |
| **Total** | **~$1-5/month** |

## Scaling Notes

- **Embedding dimensions:** `text-embedding-3-small` supports dimension reduction (256, 512, 1024, 1536). Starting with 1536 for best accuracy at 10K titles. If the corpus grows past 100K, consider reducing to 512 dimensions for faster search and smaller storage.
- **Adding more titles:** Run the seed job targeting new TMDB ID ranges. Existing embeddings stay untouched. pgvector HNSW index updates automatically on insert.
- **Observability:** Each pipeline step (embed, search, LLM, validate) should log duration via `ILogger` for production debugging. The `ai_query_logs` table captures per-request metrics.
