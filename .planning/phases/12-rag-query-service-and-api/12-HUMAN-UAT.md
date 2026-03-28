---
status: partial
phase: 12-rag-query-service-and-api
source: [12-VERIFICATION.md]
started: 2026-03-28T00:00:00Z
updated: 2026-03-28T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. End-to-End Query Returns 5 Results
expected: POST `/api/ai-discover` with `{"query": "time loop comedy"}` as authenticated user returns HTTP 200 with 5 results containing TMDB IDs, match scores (0-1), explanation text; responseTimeMs < 25000
result: [pending]

### 2. Caching Behavior
expected: Same query twice within 30 minutes — second response identical, significantly faster; only one new ai_query_logs entry (or second response sub-millisecond)
result: [pending]

### 3. Rate Limiting at 21st Request
expected: 21 requests within 1 hour from same user — requests 1-20 return 200; request 21 returns 429 with Retry-After header
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
