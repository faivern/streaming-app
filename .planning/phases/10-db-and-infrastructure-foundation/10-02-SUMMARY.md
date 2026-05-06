---
phase: 10-db-and-infrastructure-foundation
plan: "02"
subsystem: backend
tags: [azure-openai, di-registration, health-endpoint, unit-tests, fail-fast]
dependency_graph:
  requires: ["10-01"]
  provides: ["AzureOpenAIClient singleton in DI", "AzureOpenAIOptions config record", "GET /health/ai endpoint"]
  affects: ["Phase 11 embedding pipeline", "Phase 12 RAG query service"]
tech_stack:
  added: ["Azure.AI.OpenAI 2.1.0 (already added in 10-01)", "System.ClientModel (ApiKeyCredential)"]
  patterns: ["fail-fast DI validation at startup", "dev-only diagnostic endpoints", "singleton registration for SDK clients"]
key_files:
  created:
    - backend/Models/Options/AzureOpenAIOptions.cs
    - backend/Controllers/HealthAiController.cs
    - backend/backend.Tests/Unit/Controllers/AiHealthControllerTests.cs
  modified:
    - backend/Configuration/ServiceRegistration.cs
decisions:
  - "ApiKeyCredential comes from System.ClientModel namespace (not Azure), required for AzureOpenAIClient v2.x constructor"
  - "HealthAiController uses [Authorize] — AI health endpoint is auth-gated, not public"
  - "Pre-existing test failures in ListServiceTests/MediaEntryServiceTests caused by Vector type incompatibility with InMemory provider (from Plan 01 work, not in scope)"
metrics:
  duration: "~240s"
  completed: "2026-03-26"
  tasks: 2
  files: 4
---

# Phase 10 Plan 02: Azure OpenAI SDK Registration and Health Endpoint Summary

AzureOpenAIClient singleton registered in DI with fail-fast validation, AzureOpenAIOptions config record, and dev-only /health/ai diagnostic endpoint with 2 passing unit tests.

## Objective

Register the Azure OpenAI SDK in the .NET DI container with fail-fast startup validation, create the `/health/ai` diagnostic endpoint, and add unit tests proving DI resolution works. This makes the `AzureOpenAIClient` available to all downstream services (Phase 11 embedding pipeline, Phase 12 RAG query).

## Tasks Completed

### Task 1: AzureOpenAIOptions record and DI registration with fail-fast
**Commit:** `6439b4f`

- Created `backend/Models/Options/AzureOpenAIOptions.cs` with `EmbeddingDeployment` and `ChatDeployment` string properties
- Modified `backend/Configuration/ServiceRegistration.cs` to add Azure OpenAI singleton registrations
- Fail-fast: throws `InvalidOperationException` at startup if `AZURE_OPENAI_ENDPOINT` or `AZURE_OPENAI_API_KEY` are missing from config
- Default deployment names: `text-embedding-3-small` and `gpt-4o-mini` (override via env vars)
- Config key pattern: `AzureOpenAI:Endpoint` (colon notation) maps from docker-compose double-underscore `AzureOpenAI__Endpoint`

### Task 2: HealthAi controller and unit tests
**Commit:** `f0e2422`

- Created `backend/Controllers/HealthAiController.cs` with `[Route("health")]` and `[Authorize]`
- `GET /health/ai` returns 200 with `status`, `provider`, `embeddingDeployment`, `chatDeployment` in Development
- `GET /health/ai` returns 404 in Production (dev-only diagnostic guard)
- Created `backend/backend.Tests/Unit/Controllers/AiHealthControllerTests.cs` with 2 tests
- Both tests pass: `GetAiHealth_InDevelopment_ReturnsOkWithConfig` and `GetAiHealth_InProduction_ReturnsNotFound`

## Verification

- `dotnet build` exits 0
- `dotnet test --filter "AiHealthControllerTests"` shows 2 passed, 0 failed
- `ServiceRegistration.cs` contains `AzureOpenAIClient` singleton registration with fail-fast validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Incorrect namespace for ApiKeyCredential**
- **Found during:** Task 1 build
- **Issue:** The plan specified `using Azure;` for `ApiKeyCredential`, but in Azure.AI.OpenAI v2.x the `ApiKeyCredential` type lives in `System.ClientModel` namespace, not `Azure`
- **Fix:** Replaced `using Azure;` with `using System.ClientModel;` in `ServiceRegistration.cs`
- **Files modified:** `backend/Configuration/ServiceRegistration.cs`
- **Commit:** `6439b4f`

## Pre-existing Failures (Out of Scope)

24 test failures exist in `ListServiceTests` and `MediaEntryServiceTests` due to `Vector` type incompatibility with EF Core InMemory provider. This was introduced by Plan 01 (adding `MovieEmbedding.Embedding` vector column to AppDbContext). These failures are pre-existing and out of scope for this plan. The tests use InMemory provider which does not support the pgvector `Vector` type. This requires a fix in the test helpers (scoped to a future plan or inline with Plan 01 resolution).

**Deferred item logged:** The service tests need the InMemory DbContext to either exclude `MovieEmbedding` from the model or use a Sqlite provider that has the vector extension configured.

## Known Stubs

None — all functionality is fully wired. The HealthAiController returns real data from injected `AzureOpenAIOptions`.

## Self-Check: PASSED

Files exist:
- `backend/Models/Options/AzureOpenAIOptions.cs` - FOUND
- `backend/Controllers/HealthAiController.cs` - FOUND
- `backend/backend.Tests/Unit/Controllers/AiHealthControllerTests.cs` - FOUND
- `backend/Configuration/ServiceRegistration.cs` - FOUND (modified)

Commits exist:
- `6439b4f` feat(10-02): AzureOpenAIOptions record and DI registration with fail-fast - FOUND
- `f0e2422` feat(10-02): HealthAiController with dev-only guard and unit tests - FOUND
