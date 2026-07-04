# 🎬 MovieVerse

> A sleek, dark-themed movie discovery web application powered by the **TMDB (The Movie Database) API** — built with React 19, TypeScript, Vite, and Tailwind CSS v4.
> Now featuring **Favorites** ❤️ and **Watchlist** 🔖 with persistent localStorage and dedicated pages.

![MovieVerse Banner](https://img.shields.io/badge/MovieVerse-TMDB%20Powered-blueviolet?style=for-the-badge&logo=themoviedatabase)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Components](#-pages--components)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Changelog](#-changelog)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MovieVerse** is a full-featured movie discovery platform that lets users explore trending films, browse by genre, search titles, watch trailers, view image galleries, read community reviews, and now **save movies to a personal Favorites list or Watchlist** — all in a premium, dark-mode interface.

The app fetches real-time data from the [TMDB REST API v3](https://developer.themoviedb.org/docs) and presents it through a responsive, animated UI with smooth micro-interactions and glassmorphism design elements. All user lists are persisted to `localStorage` so they survive page refreshes without any backend.

---

## 🚀 Live Demo

> 🔗 **[https://tmdb-movies-tau.vercel.app](https://tmdb-movies-tau.vercel.app)** *(Deployed on Vercel)*

---

## ✨ Features

### 🏠 Home Page
| Feature | Description |
|---|---|
| **Hero Spotlight** | Auto-rotating hero banner cycling through top 6 trending films every 6 seconds with thumbnail strip, dot indicators, and ❤️/🔖 action buttons |
| **Trending Movies** | Horizontal scrollable row of weekly trending movies |
| **Top Rated Movies** | Horizontal scrollable row of all-time highest-rated films |
| **Now Playing** | Horizontal scrollable row of currently playing movies |
| **Browse Grid** | Paginated movie grid (up to 500 pages) with URL-encoded search |
| **Genre Filtering** | One-click genre pill filter that resets pagination automatically |
| **Live Search** | Real-time movie search using TMDB's `/search/movie` endpoint |
| **Stats Bar** | Animated stats strip showing platform-wide metrics |
| **Skeleton Loading** | Shimmer skeleton cards displayed during all data fetches |
| **Responsive Design** | Fully mobile-responsive with hamburger menu and adaptive grids |
| **Card Action Buttons** | Hover-revealed ❤️ Favorite and 🔖 Watchlist toggle buttons on every movie card |

### 🎬 Movie Details Page
| Feature | Description |
|---|---|
| **Hero Card** | Poster, title, tagline, genres, runtime, rating, vote count, overview, and action buttons |
| **Add to Favorites** | Pill button below the overview — toggles between ❤️ Favorited and 🤍 Add to Favorites with red active state |
| **Add to Watchlist** | Pill button below the overview — toggles between 🔖 In Watchlist and 🏷️ Add to Watchlist with blue active state |
| **Video Player** | Embedded YouTube player for trailers, teasers, clips & featurettes, sorted by official trailers first |
| **Video Strip** | Clickable thumbnail row for all available YouTube videos |
| **Image Gallery** | Tabbed Backdrops/Posters gallery with lazy-loaded images, "Show all" toggle |
| **Lightbox** | Full-screen image viewer with keyboard navigation (← → Esc) and thumbnail strip |
| **Community Reviews** | User review cards with avatar, star rating, collapsible long-form content |
| **Similar Movies** | Horizontally scrollable row of similar movie recommendations |
| **Back Navigation** | One-click back button to return to the home page |

### ❤️ Favorites Page (`/favorites`)
| Feature | Description |
|---|---|
| **Movie Grid** | Responsive grid of all favorited movies, matching the browse grid aesthetic |
| **Remove Button** | "✕ Remove" button on each card (appears always, not on hover) with red hover color |
| **Empty State** | Beautiful empty state with 💔 emoji, descriptive text, and an "Explore Movies" CTA button |
| **Count Badge** | Live count badge on the navbar Favorites link (red gradient, hidden when 0) |
| **Persistence** | Saved to `localStorage` key `mv_favorites` — survives page refresh and browser restarts |

### 🔖 Watchlist Page (`/watchlist`)
| Feature | Description |
|---|---|
| **Movie Grid** | Responsive grid of all watchlisted movies |
| **Remove Button** | "✕ Remove" button on each card with blue hover color |
| **Empty State** | Beautiful empty state with 📭 emoji and "Explore Movies" CTA |
| **Count Badge** | Live count badge on the navbar Watchlist link (blue gradient, hidden when 0) |
| **Persistence** | Saved to `localStorage` key `mv_watchlist` |

### 🎨 Design & UX
- **Dark glassmorphism** aesthetic (`#0a0a0f` base, blurred panels with subtle borders)
- **Animated hero** with `heroFade` and `slideUp` keyframe transitions
- **Shimmer skeleton** loaders matching card aspect ratios
- **Sticky transparent navbar** that gains a frosted-glass blur on scroll, with live count badges
- **Micro-interactions** on all interactive elements (cards, buttons, genre pills, action buttons)
- **Inter font** loaded from Google Fonts for consistent, modern typography
- **Gradient accents** — purple `#667eea → #764ba2`, red `#ef4444 → #ec4899` (Favorites), blue `#3b82f6 → #6366f1` (Watchlist)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS-in-JSX |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **Linting** | [ESLint 9](https://eslint.org/) + TypeScript ESLint |
| **Deployment** | [Vercel](https://vercel.com/) |
| **Data Source** | [TMDB API v3](https://developer.themoviedb.org/) |

---

## 📁 Project Structure

```
tmdb_movies/
├── public/                   # Static assets
├── src/
│   ├── api/
│   │   ├── tmdbClient.ts     # Axios instance configured with base URL & API key
│   │   └── tmdbApi.ts        # All TMDB API call functions
│   ├── context/
│   │   └── MovieListContext.tsx  # ✨ NEW — Favorites & Watchlist context + localStorage
│   ├── layouts/
│   │   └── MainLayout.tsx    # Navbar (with badges) + Footer wrapper with scroll detection
│   ├── pages/
│   │   ├── HomePage.tsx      # Hero, rows, browse grid, search, genre filter, action buttons
│   │   ├── MovieDetails.tsx  # Movie info, videos, gallery, reviews, similar, action buttons
│   │   └── SavedPages.tsx    # ✨ NEW — FavoritesPage & WatchlistPage
│   ├── App.tsx               # Route declarations (/, /movie/:id, /favorites, /watchlist)
│   ├── main.tsx              # React DOM root wrapped with MovieListProvider
│   ├── index.css             # Global base styles
│   └── App.css               # App-level styles
├── index.html                # HTML entry point
├── vite.config.ts            # Vite + Tailwind CSS v4 plugin config
├── vercel.json               # SPA rewrite rule for client-side routing
├── tsconfig.json             # TypeScript project references
├── tsconfig.app.json         # App TypeScript config
├── tsconfig.node.json        # Node TypeScript config
├── eslint.config.js          # ESLint flat config
└── package.json              # Dependencies & scripts
```

---

## 📄 Pages & Components

### `MainLayout.tsx`
The top-level layout component that wraps all pages via React Router's `<Outlet />`.

- **Navbar**: Fixed 64px bar with transparent-to-frosted scroll transition. Contains the **MovieVerse** brand logo and three nav links — **Home**, **Favorites** (❤️), and **Watchlist** (🔖). The latter two display live count badges that update instantly as movies are saved. Mobile breakpoint shows a hamburger menu with the same links and badges.
- **Footer**: Minimal footer crediting the app and TMDB API.

### `HomePage.tsx`
The main landing page, composed of several sub-components:

| Component | Role |
|---|---|
| `HeroSpotlight` | Auto-rotating backdrop hero with dot indicators, thumbnail strip, "View Details", ❤️ Favorite, and 🔖 Watchlist buttons |
| `StatsBar` | Statistics strip (500k+ Movies, 2M+ Reviews, 50+ Languages, 100k+ TV Shows) |
| `MovieRow` | Reusable horizontal scrollable section with left/right arrow buttons and `ref`-based smooth scrolling |
| `GenreFilter` | Pill button row that filters the browse grid by TMDB genre ID |
| `MovieCard` | Poster card with overlay play button, star rating badge, title, year, genre tags, and **hover-revealed ❤️/🔖 action buttons** |
| `GridMovieCard` | Full-width grid variant of MovieCard used in the browse section, also with action buttons |
| `SkeletonCard` | Animated shimmer placeholder matching MovieCard dimensions |

**State management** uses `useState` + `useEffect` hooks with parallel `Promise.all` for the three horizontal rows and a separate effect for the paginated browse grid.

### `MovieDetails.tsx`
Comprehensive single-movie detail view loaded by route `/movie/:id`.

| Component | Role |
|---|---|
| `VideoSection` | YouTube embed player with a sortable video strip (official trailers first) |
| `ImageGallery` | Tabbed Backdrops/Posters grid with "Show all" toggle |
| `Lightbox` | Full-screen image modal with keyboard navigation and thumbnail strip |
| `ReviewCard` | Individual review with avatar (or initials fallback), star rating, collapsible content |
| `SimilarMovies` | Horizontal scroll track for related film recommendations |
| `StarRating` | Reusable 5-star visual component derived from TMDB's 10-point scale |
| **Action buttons** | "Add to Favorites" and "Add to Watchlist" pill buttons in the hero card, with colored active states |

### `SavedPages.tsx` ✨ New
Contains two named exports that share a single `SavedListPage` base component:

| Export | Route | Description |
|---|---|---|
| `FavoritesPage` | `/favorites` | Grid of all favorited movies with red remove buttons and 💔 empty state |
| `WatchlistPage` | `/watchlist` | Grid of all watchlisted movies with blue remove buttons and 📭 empty state |

Both pages share the `SavedCard` sub-component which renders a poster card with an always-visible "✕ Remove" button and navigates to the movie detail on click.

### `MovieListContext.tsx` ✨ New
A React Context provider wrapping the entire app (mounted in `main.tsx`):

```typescript
// Exposed interface
{
  favorites: SavedMovie[];       // list of favorited movies
  watchlist: SavedMovie[];       // list of watchlisted movies
  toggleFavorite(movie): void;   // add if absent, remove if present
  toggleWatchlist(movie): void;  // add if absent, remove if present
  isFavorite(id): boolean;
  isInWatchlist(id): boolean;
  removeFavorite(id): void;
  removeWatchlist(id): void;
}
```

All state is synced to `localStorage` via `useEffect` on every change.

---

## 🗄 State Management

MovieVerse uses **React Context API** for global client-side state — no Redux or Zustand needed at this scale.

### `MovieListContext` flow

```
main.tsx
  └─ <MovieListProvider>        ← wraps entire app
       └─ <App />
            ├─ MainLayout       ← reads favorites.length, watchlist.length for badges
            ├─ HomePage         ← MovieCard / GridMovieCard / HeroSpotlight call toggleFavorite/toggleWatchlist
            ├─ MovieDetails     ← hero card calls toggleFavorite/toggleWatchlist
            ├─ FavoritesPage    ← reads favorites[], calls removeFavorite()
            └─ WatchlistPage    ← reads watchlist[], calls removeWatchlist()
```

### `SavedMovie` shape (shared type)
```typescript
interface SavedMovie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    release_date: string;
    vote_average: number;
    overview?: string;
    genre_ids?: number[];
}
```

---

## 🔌 API Integration

All TMDB calls are centralized in `src/api/`:

### `tmdbClient.ts`
```typescript
import axios from "axios";

export const tmdbClient = axios.create({
    baseURL: "https://api.themoviedb.org/3",
    params: {
        api_key: import.meta.env.VITE_TMDB_API_KEY,
    }
});
```

### `tmdbApi.ts` — Exported functions

| Function | Endpoint | Description |
|---|---|---|
| `getMovies(page, genreId, searchMovie?)` | `/discover/movie` or `/search/movie` | Paginated movie list, optionally filtered by genre or search query |
| `getGenres()` | `/genre/movie/list` | Full list of movie genre IDs and names |
| `getTrendingMovies(timeWindow)` | `/trending/movie/day\|week` | Trending movies for a given time window |
| `getTopRatedMovies()` | `/movie/top_rated` | All-time highest rated movies |
| `getNowPlayingMovies()` | `/movie/now_playing` | Currently showing in cinemas |
| `getMovieDetails(movieId)` | `/movie/:id` | Full metadata for a single movie |
| `getMovieReviews(movieId)` | `/movie/:id/reviews` | Community written reviews |
| `getMovieVideos(movieId)` | `/movie/:id/videos` | Trailers, teasers, clips from YouTube |
| `getMovieImages(movieId)` | `/movie/:id/images` | Backdrops and posters (EN + untagged) |
| `getSimilarMovies(movieId)` | `/movie/:id/similar` | Movies similar to the given title |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A free [TMDB API key](https://www.themoviedb.org/settings/api)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Amrenther/tmdb_movies.git
cd tmdb_movies

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then add your TMDB API key (see below)

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | Type-check + production bundle |
| Preview | `npm run preview` | Preview the production build locally |
| Lint | `npm run lint` | Run ESLint across the project |

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

> ⚠️ **Security Note:** Never commit your `.env` file. It is already included in `.gitignore`. The `VITE_` prefix makes the variable accessible in the browser bundle — keep your key restricted to read-only access on the TMDB dashboard.

To get your API key:
1. Create a free account at [themoviedb.org](https://www.themoviedb.org/)
2. Navigate to **Settings → API**
3. Request an API key (Developer / Personal use)
4. Copy the **API Key (v3 auth)** value

---

## 🌐 Deployment

The project is deployed on **Vercel** with client-side routing support.

### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This rewrite rule ensures that deep links like `/movie/550` are handled by React Router instead of returning a 404 from Vercel's edge network.

### Deploy Your Own Fork

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Amrenther/tmdb_movies)

1. Click the button above or import the repo in your Vercel dashboard
2. Add `VITE_TMDB_API_KEY` as an **Environment Variable** in Vercel project settings
3. Vercel will auto-detect Vite and run `npm run build` → deploy `dist/`

---

## 🗂 Key Design Decisions

- **CSS-in-JSX over external stylesheets**: Component styles are co-located using `<style>` tags within JSX for true encapsulation without a CSS Modules setup overhead.
- **Context API over Redux/Zustand**: The favorites/watchlist feature uses React's built-in Context API — lightweight and sufficient for this feature scope without adding a third-party state library.
- **localStorage for persistence**: User lists survive page refresh and browser restarts without any backend. The `SavedMovie` shape is intentionally minimal (8 fields) to keep storage efficient.
- **Toggle pattern**: `toggleFavorite` / `toggleWatchlist` use a single function to add-if-absent or remove-if-present, simplifying call-site code to a single click handler.
- **Parallel data fetching**: `Promise.all` is used on the home page to simultaneously fetch trending, top-rated, and now-playing data in a single render cycle.
- **Image lazy loading**: All poster/backdrop `<img>` tags use `loading="lazy"` to defer off-screen image requests and improve initial page performance.
- **Video sort priority**: Videos on the details page are sorted so *official trailers* always appear first, followed by other trailers, then teasers, then all other types.
- **Badge visibility**: Nav count badges are only rendered when `count > 0`, keeping the navbar uncluttered for new users.

---

## 📋 Changelog

### v1.1.0 — Favorites & Watchlist *(2026-07-04)*

**New Files**
- `src/context/MovieListContext.tsx` — Global React Context with `localStorage` persistence for Favorites and Watchlist
- `src/pages/SavedPages.tsx` — `FavoritesPage` (`/favorites`) and `WatchlistPage` (`/watchlist`) with grid, remove, and empty states

**Modified Files**
- `src/main.tsx` — Wrapped app with `<MovieListProvider>`
- `src/App.tsx` — Added `/favorites` and `/watchlist` routes
- `src/layouts/MainLayout.tsx` — Added Favorites ❤️ and Watchlist 🔖 nav links with live count badges; full mobile menu support
- `src/pages/HomePage.tsx` — Added `useMovieList` hook to `MovieCard`, `GridMovieCard`, and `HeroSpotlight`; hover-reveal action buttons on all cards; hero Favorite/Watchlist buttons
- `src/pages/MovieDetails.tsx` — Added Favorite and Watchlist pill buttons in the movie hero card with active color states

### v1.0.0 — Initial Release
- Hero Spotlight, Trending/Top Rated/Now Playing rows, Browse Grid, Genre Filter, Live Search
- Movie Details with Videos, Image Gallery, Lightbox, Reviews, Similar Movies
- Deployed to Vercel with SPA routing

---


## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code passes ESLint checks (`npm run lint`) before submitting.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the comprehensive free API
- [React](https://react.dev/) team for the outstanding v19 release
- [Vite](https://vitejs.dev/) for the blazing-fast build tooling
- [Vercel](https://vercel.com/) for seamless free hosting

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Amrenther">Amrenther</a> · Powered by <a href="https://www.themoviedb.org/">TMDB</a>
</p>
