# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MovieBucket is a full-stack movie/TV discovery app with a React frontend and .NET backend that proxies TMDB API data.

## Commands

### Frontend (in `frontend/`)
```bash
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run build:strict # TypeScript check + build
npm run lint         # ESLint
npm run typecheck    # TypeScript compilation check
```

### Backend (in `backend/`)
```bash
dotnet run           # Dev server at https://localhost:7123
dotnet build         # Build
dotnet watch run     # Hot reload
```

### Docker (from root)
```bash
docker compose up -d              # Full stack (db, backend, frontend)
docker compose --profile dev up -d # Include pgAdmin
docker compose down
```

### Secrets Setup
```bash
cd backend
dotnet user-secrets set "Tmdb:ApiKey" "YOUR_KEY"
```

## Architecture

**Frontend** (`frontend/src/`):
- `pages/` - Route-level components (home, detailPage, creditsPage, genreDetailPage, collectionPage)
- `components/` - Reusable UI (layout, auth, media, filters, feedback, ui)
- `api/` - Axios client layer with modules per resource (movies.api.ts, tv.api.ts, search.api.ts, etc.)
- `api/http/` - Axios instance config and interceptors
- `hooks/` - Custom React hooks (useSearch, useAddWatchList, useToWatch, useDelayHover, useShare)
- `types/` - TypeScript interfaces

**Backend** (`backend/`):
- `Controllers/` - API routes (AuthController for OAuth, MoviesController for TMDB proxy)
- `Services/` - Business logic (TmdbService handles TMDB API calls with caching)
- `Models/` - Data models (MoviebucketUser, TmdbVideoModels)
- `Data/` - EF Core DbContext

**Data Flow**: Frontend → React Query → Axios → Backend API → TmdbService (with MemoryCache) → TMDB API

## Key Patterns

- **State Management**: React Query for server state, React hooks for UI state
- **API Structure**: Backend acts as TMDB proxy with caching via TmdbService
- **Authentication**: OAuth2 (Google) with cookie-based sessions (`MovieBucketAuth` cookie)
- **Styling**: Tailwind CSS with Headless UI and Material Tailwind components

## API Endpoints

Backend exposes TMDB data at `/api/movies/*` and auth at `/api/auth/*`:
- `GET /api/movies/popularMovie`, `/api/movies/trending/movie/day`
- `GET /api/movies/movie/{id}`, `/api/movies/{mediaType}/{id}/trailer`
- `GET /api/movies/search/multi?query=...`
- `POST /api/auth/google`, `GET /api/auth/me`, `POST /api/auth/logout`

Swagger available at `https://localhost:7123/swagger` in development.

## Database

PostgreSQL 16 via Docker. Connection managed through EF Core with ASP.NET Identity integration.

## Development Notes

- Frontend environment: Create `.env.local` with `VITE_API_URL=https://localhost:7123`
- Backend secrets: Use .NET User Secrets Manager (not appsettings for sensitive values)
- CORS configured for localhost:3000 (Docker) and localhost:5173 (Vite default)

## Instructions
- NEVER touch any type of environment or configuration files if not told to explicitly do so.

