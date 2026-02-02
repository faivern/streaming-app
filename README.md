# MovieBucket

A full-stack movie and TV show discovery app built with React and .NET.

![MovieBucket Banner](./screenshots/banner.png)

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
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

-  **Search** - Movies, TV shows, and people with real-time results
-  **Browse by Genre** - Filter content with infinite scroll pagination
-  **Detailed Info** - Cast, crew, trailers, and watch providers
-  **Custom Lists** - Create and manage personal movie/TV collections with grid and list views
-  **Watch Tracking** - Track your watchlist status (Want to Watch, Watching, Watched)
-  **Reviews & Ratings** - Rate media across categories (Acting, Story, Visuals, Soundtrack)
-  **Discover Modal** - Find new content with advanced filters to add to your lists
-  **Google OAuth** - Secure authentication with cookie sessions
-  **Responsive** - Works on desktop and mobile

## Technical Highlights

- **20+ Custom React Hooks** for data fetching, sorting, and UI state
- **Backend Caching Layer** with 6-hour TTL for optimal performance
- **Bayesian Rating Algorithm** (IMDb-style) for fair popularity rankings
- **Full TypeScript Coverage** across the frontend

## Screenshots

| Homepage Grid | Homepage Carousels |
|:--------:|:------------------:|
| ![Homepage](./screenshots/homepage.png) | ![Carousels](./screenshots/carouselles-homepage.png) |

| Movie Details | TV Show Details |
|:-------------:|:---------------:|
| ![Movie Details](./screenshots/detail-movie.png) | ![TV Details](./screenshots/detail-tv.png) |

| Search | Login |
|:------:|:-----:|
| ![Search](./screenshots/search.png) | ![Login](./screenshots/login.png) |

| Browse by Genre | Genre Modal |
|:---------------:|:-----------:|
| ![Genre Page](./screenshots/genrepage.png) | ![Genre Modal](./screenshots/genre-modal.png) |

| Cast & Crew | Person Details |
|:-----------:|:--------------:|
| ![Credits](./screenshots/credits.png) | ![Person](./screenshots/person.png) |

| Collections |
|:-----------:|
| ![Collection](./screenshots/collectionpage.png) |

### My Lists & Tracking

| My Tracking | Custom List (Grid View) |
|:-----------:|:-----------------------:|
| ![My Tracking](./screenshots/my-tracking.png) | ![List Grid View](./screenshots/my-list-gridview.png) |

| Custom List (List View) | Discover Modal |
|:-----------------------:|:--------------:|
| ![List List View](./screenshots/my-list-listview.png) | ![Discover Modal](./screenshots/my-list-discover-modal.png) |

| Review & Ratings |
|:----------------:|
| ![Review Modal](./screenshots/my-list-review.png) |

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
