# Cinelas

**Your personal cinema atlas.** Explore, track, and collect over 1.3 Million movies and TV shows.

![Cinelas Banner](./screenshots/banner.png)

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white)

### Backend
![.NET](https://img.shields.io/badge/.NET_8-512BD4?style=flat-square&logo=dotnet&logoColor=white)
![C#](https://img.shields.io/badge/C%23-239120?style=flat-square&logo=csharp&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

## Features

- **Search** — Instant results across movies, TV shows, and people as you type
- **Browse by Genre** — Deep-dive into any genre with infinite scroll and smart filtering
- **Rich Media Pages** — Full cast & crew, trailers, ratings, and exactly where to stream it
- **Streaming Services** — Browse by hundreds of providers by country and explore their full catalogs
- **Custom Lists** — Build and curate personal collections with grid and list views
- **One-Click Tracking** — Mark anything as Want to Watch, Watching, or Watched from anywhere in the app
- **Reviews & Ratings** — Score media across four dimensions: Acting, Story, Visuals, and Soundtrack
- **Discover Modal** — Surface hidden gems with advanced filters and add them straight to your lists
- **Google OAuth** — Frictionless sign-in with secure cookie sessions
- **Responsive** — Feels native on desktop and mobile

## Coming Soon

- **Insight dashboard for lists**
- **AI-powered suggestions**
- **Email reminder for upcoming releases**
- **Shareable lists**

## Technical Highlights

- **20+ Custom React Hooks** for data fetching, sorting, and UI state
- **Backend Caching Layer** with 6-hour TTL for optimal performance
- **Bayesian Rating Algorithm** (IMDb-style) for fair popularity rankings
- **Full TypeScript Coverage** across the frontend

## Screenshots

| Homepage(1/2) | Carousels(2/2) |
|:--------:|:---------:|
| ![Homepage](./screenshots/homepage.png) | ![Carousels](./screenshots/carouselles-homepage.png) |

| Movie Details | TV Show Details |
|:-------------:|:---------------:|
| ![Movie Details](./screenshots/detail-movie.png) | ![TV Details](./screenshots/detail-tv.png) |

| Search | Browse by Genre |
|:------:|:---------------:|
| ![Search](./screenshots/search.png) | ![Genre Page](./screenshots/genrepage.png) |

| Genre Filter Modal | Cast & Crew |
|:------------------:|:-----------:|
| ![Genre Modal](./screenshots/genre-modal.png) | ![Credits](./screenshots/credits.png) |

| Person Details | Collections |
|:--------------:|:-----------:|
| ![Person](./screenshots/person.png) | ![Collection](./screenshots/collectionpage.png) |

### Streaming Services

| All Providers | Provider Catalog |
|:-------------:|:----------------:|
| ![All Providers](./screenshots/all-provider-grid.png) | ![Provider Detail](./screenshots/provider-detail.png) |

### My Lists & Tracking

| My Tracking | Custom List (Grid View) |
|:-----------:|:-----------------------:|
| ![My Tracking](./screenshots/my-tracking.png) | ![List Grid View](./screenshots/my-list-gridview.png) |

| Custom List (List View) | Track & Add to List |
|:-----------------------:|:-------------------:|
| ![List List View](./screenshots/my-list-listview.png) | ![Media Entry Modal](./screenshots/media-entry-modal.png) |

| Discover Modal | Review & Ratings |
|:--------------:|:----------------:|
| ![Discover Modal](./screenshots/my-list-discover-modal.png) | ![Review Modal](./screenshots/my-list-review.png) |

## Architecture

```
React → React Query → Axios → .NET API → TmdbService (cached) → TMDB API
                                  ↓
                            PostgreSQL
```

## Quick Start

**Prerequisites:** Node.js, .NET 8 SDK, Docker, [TMDB API Key](https://www.themoviedb.org/signup)

```bash
# Clone the repo
git clone https://github.com/your-username/streaming-app.git
cd streaming-app

# Start the database
docker-compose up -d

# Backend (in /backend)
dotnet user-secrets set "Tmdb:ApiKey" "YOUR_KEY"
dotnet run

# Frontend (in /frontend)
echo "VITE_API_URL=https://localhost:7123" > .env.local
npm install && npm run dev
```

**Backend:** https://localhost:7123 (Swagger docs at `/swagger`)
**Frontend:** http://localhost:3000
