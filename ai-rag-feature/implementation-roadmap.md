# AI Discovery — Implementation Roadmap

## Phase Overview

| Phase | Name | Scope | Depends On | Est. Effort |
|-------|------|-------|------------|-------------|
| 1 | Infrastructure & Data | pgvector, schema, embedding pipeline | Nothing | Large |
| 2 | Backend RAG Service | Query pipeline, controller, guardrails | Phase 1 | Large |
| 3 | Frontend UI | AI page, components, routing, CTA | Phase 2 | Medium |
| 4 | Personalization | Filter watched, boost preferences | Phase 2+3 | Small |
| 5 | Observability & Hardening | Logging, error handling, polish | Phase 4 | Small |

---

## Phase 1: Infrastructure & Data Layer

### 1a. Docker — Switch PostgreSQL Image
**File:** `docker-compose.yml`
- Change `postgres:16-alpine` → `pgvector/pgvector:pg16`
- Add Azure OpenAI env vars to backend service

### 1b. NuGet Packages
```bash
cd backend
dotnet add package Pgvector.EntityFrameworkCore
dotnet add package Azure.AI.OpenAI
```

### 1c. Database Entities
**New files:**
- `backend/Models/Entities/MovieEmbedding.cs` — pgvector entity with `vector(1536)` column
- `backend/Models/Entities/AiQueryLog.cs` — query log entity (no FK to users)

### 1d. DbContext & Migration
**Modified file:** `backend/Data/AppDbContext.cs`
- Add `DbSet<MovieEmbedding>` and `DbSet<AiQueryLog>`
- Configure HNSW index and unique constraint in `OnModelCreating`

**Modified file:** `backend/Configuration/ServiceRegistration.cs`
- Add `.UseVector()` to `UseNpgsql()` call

**Run:**
```bash
dotnet ef migrations add AddAiDiscovery
dotnet ef database update
```

The migration must include:
1. `migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS vector;")` as first operation
2. HNSW index via raw SQL since EF Core doesn't support `USING hnsw`

### 1e. Content Text Builder
**New file:** `backend/Services/AI/EmbeddingTextBuilder.cs`
- Static helper that takes TMDB detail data → produces `ContentText` string
- Format: `Title: X. Genres: Y. Overview: Z. Keywords: W. Cast: A. Director: B. Year: C. Rating: D.`

### 1f. Azure OpenAI Client Registration
**Modified file:** `backend/Configuration/ServiceRegistration.cs`
```csharp
services.AddSingleton<AzureOpenAIClient>(sp => {
    var config = sp.GetRequiredService<IConfiguration>();
    return new AzureOpenAIClient(
        new Uri(config["AzureOpenAI:Endpoint"]!),
        new AzureKeyCredential(config["AzureOpenAI:ApiKey"]!));
});
```

### 1g. Embedding Seed Background Job
**New file:** `backend/BackgroundJobs/EmbeddingSeedBackgroundService.cs`
- Follow pattern from `TmdbRefreshBackgroundService.cs`
- Startup delay: 5 minutes
- Fetch TMDB popular movies pages 1-500 (10,000 titles)
- Per title: fetch details + keywords + credits via `ITmdbService`
- Build text chunks via `EmbeddingTextBuilder`
- Batch embed via Azure OpenAI (100 at a time)
- Upsert into `movie_embeddings` table
- Throttle: 250ms between TMDB calls (~4 req/sec)
- Checkpoint: save progress every 50 records
- Weekly refresh: skip existing tmdb_ids

**Configuration (user-secrets):**
```bash
dotnet user-secrets set "AzureOpenAI:Endpoint" "https://<resource>.openai.azure.com/"
dotnet user-secrets set "AzureOpenAI:ApiKey" "<key>"
dotnet user-secrets set "AzureOpenAI:EmbeddingDeployment" "text-embedding-3-small"
dotnet user-secrets set "AzureOpenAI:ChatDeployment" "gpt-4o-mini"
```

---

## Phase 2: Backend RAG Service & Controller

### 2a. Service Interface & Implementation
**New files:**
- `backend/Services/AI/IAiDiscoveryService.cs`
- `backend/Services/AI/AiDiscoveryService.cs` (registered as **Scoped**)

Pipeline steps in `DiscoverAsync(query, userId)`:
1. Input validation (500 char max, sanitize)
2. Check cache: `ai_discover:{userId}:{SHA256(query)}`
3. Embed query via `text-embedding-3-small` (10s timeout)
4. Vector search: raw SQL cosine similarity, top 20 candidates
5. Personalization filter (Phase 4 — stubbed initially)
6. LLM call to GPT-4o-mini with system prompt + top 10 candidates (15s timeout)
7. Parse LLM JSON, validate TMDB IDs
8. Enrich with full metadata from `movie_embeddings` table
9. Cache result (30-min TTL)
10. Log to `ai_query_logs` (fire-and-forget)

### 2b. Response DTOs
**New file:** `backend/Models/Dtos/AiDiscoveryDtos.cs`
```csharp
public record AiDiscoveryRequest(string Query);
public record AiDiscoveryResponse(List<AiDiscoveryResult> Results, string? Message, int ResponseTimeMs);
public record AiDiscoveryResult(int TmdbId, string MediaType, string Title,
    string? PosterPath, string? Overview, double? VoteAverage,
    string Explanation, double MatchScore);
```

### 2c. Controller
**New file:** `backend/Controllers/AiDiscoverController.cs`
- `[Authorize]` + `[EnableRateLimiting("ai")]`
- `POST /api/ai/discover`
- Extract userId from `User.FindFirst(ClaimTypes.NameIdentifier)`

### 2d. Rate Limit Policy
**Modified file:** `backend/Program.cs`
- Add `"ai"` policy: 20 requests/hour, partitioned by authenticated user ID

### 2e. Cache Duration
**Modified file:** `backend/Constants/CacheDurations.cs`
- Add `AiQuery = TimeSpan.FromMinutes(30)`

---

## Phase 3: Frontend UI

### 3a. API Layer
**New file:** `frontend/src/api/aiDiscover.api.ts`
- `postAiDiscover(query: string): Promise<AiDiscoveryResponse>`
- Uses existing `api` Axios instance

### 3b. React Query Hook
**New file:** `frontend/src/hooks/ai/useAiDiscover.ts`
- `useMutation` (not `useQuery` — triggered by user action)

### 3c. AI Discovery Page
**New file:** `frontend/src/pages/aiDiscover/AiDiscoverPage.tsx`
- Auth guard with `useUser()` + `useSignInModal()`
- Hero section with title + subtitle
- Input bar (max 500 chars, character counter)
- Quick prompt chips (auto-submit on click)
- AI explanation bubble
- 5-card results grid (reuse `MediaCard` component with match score badge)
- Quick action buttons ("More like these", "TV shows instead", "Something darker")
- All frontend states: idle, loading, success, empty, error, rate-limited

### 3d. Floating CTA Button
**New file:** `frontend/src/components/ai/AiDiscoverCta.tsx`
- Fixed position bottom-right
- "Don't know what to watch?"
- Auth-gated (only visible when logged in)
- Mobile: positioned above `<BottomNav />`

### 3e. Route & Global Registration
**Modified file:** `frontend/src/App.tsx`
- Lazy import + route: `/discover/ai` → `AiDiscoverPage`
- Add `<AiDiscoverCta />` below `<Footer />`

---

## Phase 4: Personalization

### 4a. Filter Watched Titles
In `AiDiscoveryService`, after vector search:
- Query `MediaEntries` for user (status = `Watched`)
- Remove candidates with matching `TmdbId`
- Use existing `IMediaEntryService` or add lightweight `GetWatchedTmdbIdsAsync(userId)`

### 4b. Genre/Cast Preference Boosting
- Query user's `MediaEntries` to compute top 3 genres + top 3 actors
- Append to LLM system prompt for soft weighting
- Skip if user has no watch history (omit preference section entirely)

### 4c. Smart Follow-Up Queries
- Frontend stores last result titles in component state
- "More like these" prepends result context to a fresh query
- Each follow-up is a completely independent API call

---

## Phase 5: Observability & Hardening

### 5a. Query Logging
- Write to `ai_query_logs` after returning results (fire-and-forget)
- Log: userId, query, result TMDB IDs, response time

### 5b. Pipeline Step Logging
- Use `ILogger` to log duration of each step: embed, search, LLM, validate
- Log cache hits/misses

### 5c. Error Handling
- Azure OpenAI timeout (10s embed, 15s chat) → 503 response
- Empty vector results (no matches above 0.3 similarity) → friendly empty message
- LLM JSON parse failure → fall back to top 5 raw vector results
- Rate limit exceeded → 429 with reset time

### 5d. System Prompt Guardrails
- LLM instructed to only discuss movies/TV
- Off-topic queries get friendly redirect
- Temperature 0.3 for consistent responses
- All output TMDB IDs verified against embeddings table

---

## Complete File Inventory

### New Backend Files (8)
| File | Purpose |
|------|---------|
| `backend/Models/Entities/MovieEmbedding.cs` | pgvector entity |
| `backend/Models/Entities/AiQueryLog.cs` | Query log entity |
| `backend/Models/Dtos/AiDiscoveryDtos.cs` | Request/response DTOs |
| `backend/Services/AI/IAiDiscoveryService.cs` | Service interface |
| `backend/Services/AI/AiDiscoveryService.cs` | RAG pipeline (scoped) |
| `backend/Services/AI/EmbeddingTextBuilder.cs` | Text chunk builder |
| `backend/BackgroundJobs/EmbeddingSeedBackgroundService.cs` | Embedding pipeline |
| `backend/Controllers/AiDiscoverController.cs` | HTTP endpoint |

### New Frontend Files (4)
| File | Purpose |
|------|---------|
| `frontend/src/api/aiDiscover.api.ts` | API call layer |
| `frontend/src/hooks/ai/useAiDiscover.ts` | React Query mutation |
| `frontend/src/pages/aiDiscover/AiDiscoverPage.tsx` | Discovery page |
| `frontend/src/components/ai/AiDiscoverCta.tsx` | Floating CTA |

### Modified Backend Files (4)
| File | Change |
|------|--------|
| `backend/Data/AppDbContext.cs` | Add DbSets + pgvector config |
| `backend/Configuration/ServiceRegistration.cs` | Register AzureOpenAIClient (singleton), IAiDiscoveryService (scoped), background job, `.UseVector()` |
| `backend/Constants/CacheDurations.cs` | Add `AiQuery` (30 min) |
| `backend/Program.cs` | Add "ai" rate limit policy (per-user, 20/hr) |

### Modified Frontend Files (1)
| File | Change |
|------|--------|
| `frontend/src/App.tsx` | Add route + lazy import + CTA |

### Modified Infrastructure (1)
| File | Change |
|------|--------|
| `docker-compose.yml` | `pgvector/pgvector:pg16` + Azure env vars |

---

## Package Dependencies

### NuGet (Backend)
| Package | Purpose |
|---------|---------|
| `Pgvector.EntityFrameworkCore` | Vector column type + HNSW index support |
| `Azure.AI.OpenAI` | Embeddings + chat completions SDK |

### npm (Frontend)
None — existing stack covers all needs.

---

## Testing Strategy

### Unit Tests
- `EmbeddingTextBuilderTests` — text assembly from various TMDB inputs (nulls, missing fields)
- `AiDiscoveryServiceTests` — mock Azure OpenAI + DbContext, test each pipeline step
- `AiDiscoverControllerTests` — auth, validation, rate limit attributes

### Integration Tests
- Seed known embeddings into pgvector, verify cosine similarity returns expected ordering
- End-to-end embedding pipeline write and read

### Manual Testing Checklist
- [ ] "Cozy rainy day movie" → reasonable mood-based results
- [ ] "That movie with the spinning top" → identifies Inception
- [ ] Rate limit triggers after 20 queries/hour
- [ ] Already-watched titles excluded from results
- [ ] Off-topic query ("how to cook pasta") → friendly redirect
- [ ] Mobile responsive layout
- [ ] CTA button visible only when logged in
- [ ] CTA button positioned above bottom nav on mobile
- [ ] Empty results message for nonsensical queries
- [ ] 503 error message when Azure OpenAI is down

---

## Cost Estimates

| Resource | Monthly Cost |
|----------|-------------|
| Embedding generation (10K titles, one-time) | ~$0.04 |
| Query embeddings (~1000 queries/month) | ~$0.01 |
| GPT-4o-mini chat (~1000 queries/month) | ~$1-3 |
| pgvector storage | $0 (existing PostgreSQL) |
| **Total** | **~$1-5/month** |

## Scaling Path

1. **10K → 100K titles:** Run seed job on additional TMDB pages. Consider reducing embedding dimensions from 1536 to 512.
2. **Response speed:** Add Redis cache for frequently-asked queries across users.
3. **Accuracy:** Enrich content text with TMDB reviews, scene descriptions, or external data sources.
4. **Hybrid routing:** Add intent classification to route "what to watch" queries to TMDB API filters and "what movie is that" queries to RAG (Approach C from brainstorming).
