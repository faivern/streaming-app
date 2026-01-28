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
- `pages/` - Route-level components (home, detailPage, creditsPage, genreDetailPage, collectionPage, myLists)
- `components/` - Reusable UI organized by domain (layout, media, lists, filters, ui)
- `api/` - Axios client layer with modules per resource (movies.api.ts, lists.api.ts, mediaEntries.api.ts, etc.)
- `api/http/` - Axios instance config and interceptors
- `hooks/` - Custom React hooks organized by domain (hooks/lists/, hooks/sorting/, hooks/user/)
- `types/` - TypeScript interfaces

**Backend** (`backend/`):
- `Controllers/` - API routes (AuthController, MoviesController, ListController, MediaEntryController)
- `Services/` - Business logic (TmdbService handles TMDB API calls with caching)
- `Models/` - Data models (MoviebucketUser, List, MediaEntry, TmdbVideoModels)
- `Data/` - EF Core DbContext

**Data Flow**: Frontend → React Query → Axios → Backend API → TmdbService (with MemoryCache) → TMDB API

## Key Patterns

- **State Management**: React Query for server state, React hooks for UI state
- **API Layer**: Separate API files (`*.api.ts`) from React Query hooks (`hooks/*/use*.ts`)
- **Query Key Factory**: Use `const fooKeys = { all: ["foo"], detail: (id) => ["foo", id] }` pattern for cache management
- **Authentication**: OAuth2 (Google) with cookie-based sessions (`MovieBucketAuth` cookie)
- **Styling**: Tailwind CSS with Headless UI components, theme tokens in `style/tokens.css`
- **Modals**: Use Headless UI `Dialog` with `Transition` for modal patterns

## API Endpoints

**TMDB Proxy** at `/api/movies/*`:
- `GET /api/movies/popularMovie`, `/api/movies/trending/movie/day`
- `GET /api/movies/movie/{id}`, `/api/movies/{mediaType}/{id}/trailer`
- `GET /api/movies/search/multi?query=...`

**User Lists** at `/api/list/*`:
- `GET/POST /api/list` - Get all / Create list
- `GET/PUT/DELETE /api/list/{id}` - Single list operations
- `POST/DELETE /api/list/{id}/items` - Add/remove list items

**Media Tracking** at `/api/media-entries/*`:
- `GET/POST /api/media-entries` - Get all / Create entry
- `GET/PUT/DELETE /api/media-entries/{id}` - Single entry operations
- `PUT/DELETE /api/media-entries/{id}/review` - Entry reviews

**Auth** at `/api/auth/*`:
- `POST /api/auth/google`, `GET /api/auth/me`, `POST /api/auth/logout`

Swagger available at `https://localhost:7123/swagger` in development.

## Database

PostgreSQL 16 via Docker. Connection managed through EF Core with ASP.NET Identity integration.

## Development Notes

- Frontend environment: Create `.env.local` with `VITE_API_URL=https://localhost:7123`
- Backend secrets: Use .NET User Secrets Manager (not appsettings for sensitive values)
- CORS configured for localhost:3000 (Docker) and localhost:5173 (Vite default)
- Design mockups available in `frontend/docs/designs/`

## Instructions
- NEVER touch any type of environment or configuration files if not told to explicitly do so.
