# Phase 12: RAG Query Service and API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 12-rag-query-service-and-api
**Areas discussed:** LLM system prompt design, Personalization depth, Fallback & error behavior, Caching & rate limit strategy

---

## LLM System Prompt Design

### Q1: Explanation Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Casual cinephile | Friendly and enthusiastic, like a movie-buff friend | ✓ |
| Concise factual | Short and neutral descriptions | |
| Editorial/review style | Opinionated and expressive | |

**User's choice:** Casual cinephile
**Notes:** None

### Q2: Off-Topic Response

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly redirect | Warm deflection with suggestion to try movies/TV | |
| Food-to-film pivot | Playful redirect to related movies | |
| Strict boundary | Direct "I can only help with movies/TV" message | ✓ |

**User's choice:** Strict boundary
**Notes:** Returns empty results array with direct message

### Q3: LLM Grounding

| Option | Description | Selected |
|--------|-------------|----------|
| Strict grounding | LLM only picks from RAG candidates | ✓ |
| Loose grounding | LLM can suggest titles outside retrieved set | |

**User's choice:** Strict grounding
**Notes:** Output validation catches violations

### Q4: Query Pre-Processing

| Option | Description | Selected |
|--------|-------------|----------|
| Pass verbatim | Send exact user query, no pre-processing | ✓ |
| Clean and rephrase | Trim, remove special chars, expand abbreviations | |

**User's choice:** Pass verbatim
**Notes:** Input validation (500 char max, non-empty) is the only pre-processing

---

## Personalization Depth

### Q1: Genre Preference Source

| Option | Description | Selected |
|--------|-------------|----------|
| movie_embeddings lookup | Cross-reference watched TmdbIds against embeddings table | |
| TMDB API fetch | Fetch genre data from TMDB per watched title at query time | |
| Skip genre boosting | Only filter watched titles, no genre/cast boosting | ✓ |

**User's choice:** Skip genre boosting
**Notes:** Simplifies pipeline significantly. Genre boosting could be added later.

### Q2: New User Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Raw vector results | Skip personalization entirely for users with no history | ✓ |
| Prompt for preferences | Show genre selection chips on first use | |
| Popular bias | Favor highly-rated popular titles via system prompt hint | |

**User's choice:** Raw vector results
**Notes:** No onboarding friction

### Q3: Filter Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Before LLM | Remove watched titles from candidates before LLM call | ✓ |
| After LLM | Filter watched titles from LLM output | |

**User's choice:** Before LLM
**Notes:** LLM sees only unwatched options

---

## Fallback & Error Behavior

### Q1: LLM Failure Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| Vector results + flag | Return top 5 vector results with aiGenerated: false flag | |
| Vector results + generic explanation | Auto-generate explanations from content_text | |
| Error response | Return HTTP 503 with message | ✓ |

**User's choice:** Error response (HTTP 503)
**Notes:** Overrides architecture doc RAG-04. Rationale: cleaner to say "unavailable" than serve degraded results.

### Q2: Embedding API Failure

| Option | Description | Selected |
|--------|-------------|----------|
| 503 with retry hint | Return 503 with Retry-After header | ✓ |
| Text search fallback | Fall back to LIKE/full-text search | |

**User's choice:** 503 with retry hint
**Notes:** Hard failure — can't proceed without query embedding

### Q3: Partial Results

| Option | Description | Selected |
|--------|-------------|----------|
| Return partial | Return however many valid results remain | ✓ |
| Backfill to 5 | Pad with vector results to always return 5 | |
| Retry LLM once | Retry with stricter prompt if < 3 valid results | |

**User's choice:** Return partial
**Notes:** Frontend handles variable result count

---

## Caching & Rate Limit Strategy

### Q1: Cache Type

| Option | Description | Selected |
|--------|-------------|----------|
| IMemoryCache | Same pattern as TmdbService, 30-min TTL | ✓ |
| Database cache | Persistent, survives restarts | |
| No cache | Every query hits full pipeline | |

**User's choice:** IMemoryCache
**Notes:** Key: ai_discover:{userId}:{SHA256(query)}

### Q2: Rate Limit Partition Key

| Option | Description | Selected |
|--------|-------------|----------|
| Per-user (userId) | Partition by auth claims userId | ✓ |
| Per-IP | Consistent with existing policies | |

**User's choice:** Per-user
**Notes:** AI endpoint requires auth, user ID always available

### Q3: Retry-After Header

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, with countdown | Include Retry-After with exact seconds until reset | ✓ |
| Fixed message only | Generic "try again later" message | |

**User's choice:** Yes, with countdown
**Notes:** ASP.NET rate limiter supports this natively

### Q4: Cache Invalidation

| Option | Description | Selected |
|--------|-------------|----------|
| No invalidation | Let 30-min TTL handle staleness | ✓ |
| Invalidate on watch change | Clear user's AI cache on MediaEntry changes | |

**User's choice:** No invalidation
**Notes:** Low impact, much simpler

### Q5: Query Log Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Full response | Store complete LLM JSON including explanations | ✓ |
| TMDB IDs only | Match existing schema | |
| IDs + token counts | Store IDs plus token counts for cost monitoring | |

**User's choice:** Full response
**Notes:** Useful for debugging prompt quality and monitoring AI behavior

---

## Claude's Discretion

- Vector search candidate count (20 default)
- Number of candidates passed to LLM after filtering (10 default)
- Exact system prompt wording
- AiDiscoveryService class structure
- DTO structure for API response
- Migration strategy for ai_query_logs schema extension

## Deferred Ideas

None — discussion stayed within phase scope.
