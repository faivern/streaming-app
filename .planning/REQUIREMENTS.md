# Requirements: Cinelas

**Defined:** 2026-03-25
**Core Value:** Users can effortlessly discover movies and TV shows — whether browsing, searching, or describing what they're in the mood for in natural language.

## v2.0 Requirements

Requirements for AI-Powered Discovery milestone. Each maps to roadmap phases.

### Infrastructure

- [ ] **INFRA-01**: Embedding pipeline seeds 10,000 TMDB titles into pgvector with text-embedding-3-small embeddings
- [x] **INFRA-02**: pgvector extension enabled on PostgreSQL via Docker image swap
- [x] **INFRA-03**: HNSW index on embedding column for cosine similarity search
- [ ] **INFRA-04**: Embedding pipeline runs as background service with checkpoint/restart support

### RAG Pipeline

- [ ] **RAG-01**: User query is embedded and matched against corpus via cosine similarity (top 20 candidates)
- [ ] **RAG-02**: GPT-4o-mini ranks and filters candidates, returning top 5 with per-result explanations
- [ ] **RAG-03**: Output validation verifies all returned TMDB IDs exist in corpus
- [ ] **RAG-04**: Pipeline falls back to raw vector results when LLM call fails
- [ ] **RAG-05**: Query results cached per-user for 30 minutes (keyed by userId:SHA256(query))

### Discovery UI

- [ ] **UI-01**: AI Discovery page at `/discover/ai` with natural language search input (500 char max)
- [ ] **UI-02**: 5 quick prompt chips that auto-submit on tap
- [ ] **UI-03**: Results displayed as 5-card grid using existing MediaCard with match score badge
- [ ] **UI-04**: AI explanation bubble summarizing why results match the query
- [ ] **UI-05**: Quick action refinement buttons ("More like these", "TV shows instead", "Something darker")
- [ ] **UI-06**: All error/edge states handled (loading skeleton, empty, 503, 429, 400)
- [ ] **UI-07**: Corpus scope disclosure near search bar ("Searching across 10,000 popular titles")

### Personalization

- [ ] **PERS-01**: User's watched titles filtered from AI results
- [ ] **PERS-02**: User's preferred genres and cast boosted in LLM ranking prompt

### Entry Points

- [ ] **ENTRY-01**: Floating CTA button on all pages for logged-in users ("Don't know what to watch?")
- [ ] **ENTRY-02**: Auth gate with value explanation for unauthenticated users

### Guardrails & Observability

- [ ] **GUARD-01**: Input validation (non-empty, 500 char max, rate limit 20/hr per user)
- [ ] **GUARD-02**: System prompt constrains LLM to movie/TV domain with off-topic redirect
- [ ] **GUARD-03**: Query and results logged to ai_query_logs table with pipeline timing

## Future Requirements

Deferred to v2.1+. Tracked but not in current roadmap.

### Feedback & History

- **FEED-01**: Per-result thumbs up/down feedback collected to ai_result_feedback table
- **FEED-02**: Query history / recent searches section on AI Discovery idle state
- **FEED-03**: Expand embedding corpus beyond 10K titles

### Social Discovery

- **SOCL-01**: Group watch / shared discovery session (multi-user mood merge)
- **SOCL-02**: Feedback-driven prompt evolution (use thumbs data to tune system prompt)
- **SOCL-03**: Multi-turn conversation mode (chat history, session context)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-turn conversation / chat history | Single-query design; follow-ups are independent queries via refinement buttons |
| Real-time streaming responses (SSE/WebSocket) | Response time is 1-3s — fast enough for regular API call; adds infrastructure complexity |
| User-uploaded content (images, audio) | Text queries only; multimodal requires entirely different pipeline |
| Custom embedding model training | Azure OpenAI text-embedding-3-small is sufficient and cost-effective |
| Searching outside 10K corpus | pgvector can only return embedded titles; overpromising causes trust failure |
| Native mobile app | Web-only; fully responsive as of v1.1 |
| Infinite scroll on AI results | Pipeline optimized for precision at top-5, not recall at top-50 |
| User-generated taste profiles | Automatic derivation from watch history is zero-setup; profiles add onboarding friction |
| AI confidence score as primary metric | Cosine similarity not intuitive to users; match score badge is sufficient |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-02 | Phase 10 | Complete |
| INFRA-03 | Phase 10 | Complete |
| INFRA-01 | Phase 11 | Pending |
| INFRA-04 | Phase 11 | Pending |
| RAG-01 | Phase 12 | Pending |
| RAG-02 | Phase 12 | Pending |
| RAG-03 | Phase 12 | Pending |
| RAG-04 | Phase 12 | Pending |
| RAG-05 | Phase 12 | Pending |
| PERS-01 | Phase 12 | Pending |
| PERS-02 | Phase 12 | Pending |
| GUARD-01 | Phase 12 | Pending |
| GUARD-02 | Phase 12 | Pending |
| GUARD-03 | Phase 12 | Pending |
| UI-01 | Phase 13 | Pending |
| UI-02 | Phase 13 | Pending |
| UI-03 | Phase 13 | Pending |
| UI-04 | Phase 13 | Pending |
| UI-05 | Phase 13 | Pending |
| UI-06 | Phase 13 | Pending |
| UI-07 | Phase 13 | Pending |
| ENTRY-01 | Phase 13 | Pending |
| ENTRY-02 | Phase 13 | Pending |

**Coverage:**
- v2.0 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap creation*
