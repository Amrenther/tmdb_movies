# 🎬 MovieVerse

> A sleek, high-performance, full-stack movie discovery web application powered by **The Movie Database (TMDB) API**, built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS v4**, and an **Express 5 + Prisma 7 + PostgreSQL** backend.
> Featuring secure **User Authentication** 🔐, account-owned cloud **Favorites** ❤️ and **Watchlist** 🔖, guest `localStorage` fallback, and an immersive **Cinematic Web Audio Intro Sequence** 🔊.

![MovieVerse Banner](https://img.shields.io/badge/MovieVerse-Full--Stack%20Web%20App-blueviolet?style=for-the-badge&logo=themoviedatabase)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646cff?style=for-the-badge&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Node.js](https://img.shields.io/badge/Node.js-24%20LTS-339933?style=for-the-badge&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon%20Serverless-4169E1?style=for-the-badge&logo=postgresql)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)
![Backend on Render](https://img.shields.io/badge/Backend%20on-Render-46E3B7?style=for-the-badge&logo=render)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Architecture & Topology](#-architecture--topology)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [State Management & Data Flow](#-state-management--data-flow)
- [API Reference](#-api-reference)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Production Deployment Guide ($0 Hobby Tier)](#-production-deployment-guide-0-hobby-tier)
- [Operational Characteristics & Cold Starts](#-operational-characteristics--cold-starts)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Key Design Decisions](#-key-design-decisions)
- [Changelog](#-changelog)
- [Contributing](#-contributing)
- [License](#-license)
- [About the Author](#-about-the-author)

---

## 🌟 Overview

**MovieVerse** is an end-to-end full-stack movie discovery platform. Users can explore trending films, browse by genres, search millions of titles in real time, watch official trailers, view high-definition image galleries, read community reviews, and save movies to **personal Favorites and Watchlists**.

The application combines a high-speed browser client with a secure, cloud-persisted identity backend:
- **Direct TMDB Browsing**: Movie catalogs, images, trailers, and reviews are queried directly from the browser to TMDB's edge network for zero latency.
- **Account Persistence**: Users can register and log in to persist their Favorites and Watchlists across browsers and devices using **PostgreSQL via Prisma 7**.
- **Guest Flexibility**: Unregistered guests can immediately save movies locally using `localStorage` without hitting any barriers.
- **Cinematic Experience**: First-time visitors are welcomed with a synchronized Web Audio API intro sequence and animated title curtain.

---

## 🚀 Live Demo

> 🔗 **Frontend (Vercel)**: [https://movie-verse-flax-one.vercel.app/](https://movie-verse-flax-one.vercel.app/)  
> 🔗 **Backend API (Render)**: [https://movieverse-api.onrender.com/api/health](https://movieverse-api.onrender.com/api/health)

---

## 🏗️ Architecture & Topology

MovieVerse operates on a **100% $0 hobby-tier cloud topology** designed for security, zero maintenance cost, and cookie isolation immunity:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           Browser Client                               │
 └──────────────┬──────────────────────────────────────────┬──────────────┘
                │                                          │
                │ Direct TMDB Queries                      │ Relative /api/* Calls
                │ (Client API Key, No Proxy)               │ (credentials: "include")
                ▼                                          ▼
 ┌──────────────────────────────┐              ┌──────────────────────────┐
 │   api.themoviedb.org         │              │   Vercel Hobby Edge      │
 │   (TMDB REST API v3)         │              │   (React 19 SPA)         │
 └──────────────────────────────┘              └───────────┬──────────────┘
                                                           │
                                                           │ Edge Rewrite: /api/:path*
                                                           │ (Same-Origin Cookie Proxy)
                                                           ▼
                                               ┌──────────────────────────┐
                                               │  Render Free Web Service │
                                               │  (Node 24 + Express 5)   │
                                               └───────────┬──────────────┘
                                                           │
                                                           │ Prisma 7 + PostgreSQL Pool
                                                           ▼
                                               ┌──────────────────────────┐
                                               │  Neon Serverless Postgres│
                                               │  (Free Database Tier)    │
                                               └──────────────────────────┘
```

### Architectural Principles
1. **Zero Paid Services (`NFR-COST-01`)**: Built purely on generous free tiers (Vercel Hobby + Render Free Web Service + Neon Serverless PostgreSQL).
2. **No TMDB Proxying**: TMDB calls never route through the Express backend, preserving backend bandwidth and ensuring snappy video/browse response times.
3. **Same-Origin API Rewrite**: Vercel rewrites `/api/:path*` to Render at the network layer. The browser calls relative `/api` paths, keeping auth cookies (`mv_session`) strictly **first-party** (`SameSite=Lax`), preventing third-party cookie blocking in modern browsers.
4. **Stateless JWT Sessions**: 7-day signed HS256 JWT cookies verified on each request. No Redis or database session tables needed.
5. **CSRF Protection**: All state-changing requests (`POST`, `PUT`, `DELETE`) require a matching `Origin` header validated by Express middleware.

---

## ✨ Key Features

### 🔊 Cinematic Web Audio Intro Sequence
- **Synthesized Audio**: Dynamic frequency oscillator chords synthesized in real-time via the browser's native **Web Audio API** — no heavy `.mp3` audio files downloaded.
- **Cinematic Animation**: Title letter transitions, glowing light flares, and smooth curtain reveals.
- **User Controls**: Skip button, volume toggle, and automatic session suppression so returning users aren't interrupted.

### 🏠 Home & Discovery
- **Hero Spotlight**: Auto-rotating hero banner showcasing top trending films with background backdrops, thumbnail navigation, and instant ❤️/🔖 action buttons.
- **Curated Rows**: Smooth horizontal scroll rows for *Weekly Trending*, *Top Rated*, and *Now Playing* movies with touch/trackpad and button navigation.
- **Browse & Genre Filtering**: Paginated movie grid (up to 500 pages) with instant genre pill filtering.
- **Live Search**: Real-time movie title search with URL-encoded parameters for shareable search links.
- **Shimmer Skeletons**: Tailored loading skeletons prevent layout shifts while data is fetched.

### 🎬 Comprehensive Movie Details (`/movie/:id`)
- **Hero Card**: High-res backdrop, poster, tagline, runtime, genre pills, user rating badge, and action toggles.
- **Interactive Video Player**: Embedded YouTube player sorting official trailers first, teasers, and clips with a clickable thumbnail strip.
- **Image Gallery & Lightbox**: High-res backdrops and posters with tabbed filtering, keyboard-controlled full-screen lightbox modal (←, →, Esc).
- **Community Reviews**: User reviews with star ratings, avatar fallbacks, and collapsible read-more toggles.
- **Similar Recommendations**: Scrollable row of related films based on TMDB recommendation models.

### 🔐 Authentication & Session Security
- **Signup & Login**: Clean modal dialog with smooth tab switching and form validation powered by **Zod**.
- **Password Security**: Passwords hashed with **bcryptjs** (cost factor 12) — plain text passwords and hashes are never exposed in responses or logs.
- **Session Restoration**: Seamless automatic authentication check (`GET /api/auth/me`) on application mount.
- **Rate Limiting**: Express in-memory throttling (20 requests per 15 minutes per IP) protects auth endpoints against brute force without requiring Redis.
- **Safe Logout**: Instant cookie clearing (`POST /api/auth/logout`) and local UI state reset.

### ❤️ Cloud Favorites & 🔖 Watchlist
- **Dual-Mode Persistence**:
  - **Logged-in users**: Lists are synced to Neon PostgreSQL via `/api/favorites` and `/api/watchlist`.
  - **Guests**: Lists are stored in `localStorage` (`mv_favorites`, `mv_watchlist`) with zero barriers.
- **Optimistic UI with Rollback**: Instant button state updates when adding or removing movies, with automatic rollback if a network error occurs.
- **Concurrency Hardening**: Toggle endpoints handle concurrent race conditions atomically to prevent duplicate database rows or 500 errors.
- **Dedicated List Pages**: `/favorites` and `/watchlist` routes featuring responsive movie cards, count badges in the navigation bar, and empty-state placeholders.

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.0 | Core UI library |
| **TypeScript** | 5.9.3 | Type-safe application development |
| **Vite** | 7.3.1 | Lightning-fast development server & bundler |
| **Tailwind CSS** | 4.1.18 | Utility-first responsive styling |
| **React Router** | 7.13.0 | Declarative client-side routing |
| **Axios** | 1.13.5 | HTTP client for TMDB and backend API |
| **Web Audio API** | Native | Real-time synthesized audio for intro sequence |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 24.21.0 LTS | High-performance server runtime |
| **Express** | 5.2.1 | Modern REST API framework |
| **Prisma** | 7.10.0 | Type-safe ORM & database migrations |
| **PostgreSQL** | 16+ | Managed relational persistence (Neon Serverless) |
| **Zod** | 4.6.5 | Request payload & environment variable validation |
| **bcryptjs** | 3.0.3 | Password hashing with cost factor 12 |
| **jsonwebtoken** | 9.0.3 | Cryptographically signed HS256 JWT cookies |
| **Helmet** | 8.3.0 | Secure HTTP response headers |
| **express-rate-limit** | 8.7.0 | In-memory throttling for authentication routes |
| **CORS** | 2.8.6 | Strict origin allowlist and credential support |

### Infrastructure & DevOps
| Platform / Tool | Role |
|---|---|
| **Vercel** | Production React SPA hosting + Edge `/api/*` rewrite proxy |
| **Render** | Free-tier Node.js Web Service for Express REST API |
| **Neon** | Serverless PostgreSQL database (with connection pooling) |
| **Node.js Test Runner** | Native `node:test` integration testing suite |

---

## 📁 Project Structure

```text
tmdb_movies/
├── public/                       # Static public assets
├── prisma/
│   ├── schema.prisma             # Prisma schema (User, Favorite, WatchlistItem)
│   ├── prisma.config.ts          # Direct database connection config for migrations
│   └── migrations/               # Committed PostgreSQL migrations
├── server/
│   ├── dist/                     # Compiled production JavaScript (git-ignored)
│   └── src/
│       ├── index.ts              # Process entry point: database connection & server listen
│       ├── app.ts                # Express application setup, middleware, and route mounting
│       ├── config/
│       │   └── env.ts            # Strict environment variable validation using Zod
│       ├── lib/
│       │   ├── prisma.ts         # Shared pooled PrismaClient instance
│       │   ├── jwt.ts            # Token signing, verification, and cookie options
│       │   ├── errors.ts         # Standardized AppError and HTTP error helpers
│       │   └── logger.ts         # Sanitized request logging (no credentials or cookies)
│       ├── middleware/
│       │   ├── requireAuth.ts    # Session cookie verification & req.user attachment
│       │   ├── requireOrigin.ts  # CSRF Origin validation for mutating requests
│       │   ├── rateLimit.ts      # Auth route brute-force protection
│       │   ├── notFound.ts       # Standardized 404 JSON response handler
│       │   └── errorHandler.ts   # Centralized error mapping & envelope formatting
│       ├── mappers/
│       │   └── savedMovie.ts     # Maps Prisma database columns to TMDB JSON format
│       ├── routes/
│       │   ├── health.routes.ts  # GET /api/health (database connectivity check)
│       │   ├── auth.routes.ts    # POST /signup, /login, /logout, GET /me
│       │   ├── favorites.routes.ts # GET, PUT, DELETE, POST /toggle favorites
│       │   └── watchlist.routes.ts # GET, PUT, DELETE, POST /toggle watchlist
│       ├── schemas/
│       │   ├── auth.schema.ts    # Zod schemas for signup and login
│       │   └── savedMovie.schema.ts # Zod schemas for saved movies & movieId params
│       └── types/
│           ├── api.ts            # API request/response TypeScript interfaces
│           └── express.d.ts      # Express Request type extensions (req.user)
├── src/                          # Vite + React 19 Frontend
│   ├── api/
│   │   ├── serverClient.ts       # Axios client for /api backend routes
│   │   ├── tmdbClient.ts         # Axios client for direct TMDB queries
│   │   └── tmdbApi.ts            # TMDB catalog API functions
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # Animated Signup / Login dialog modal
│   │   └── intro/
│   │       └── IntroLoader.tsx   # Cinematic Web Audio intro sequence
│   ├── context/
│   │   ├── AuthContext.tsx       # Global authentication state & session hooks
│   │   └── MovieListContext.tsx  # Dual-mode (cloud + localStorage) list management
│   ├── layouts/
│   │   └── MainLayout.tsx        # Sticky navbar, count badges, auth button, footer
│   ├── pages/
│   │   ├── HomePage.tsx          # Hero, rows, browse grid, filters, search
│   │   ├── MovieDetails.tsx      # Movie info, trailer player, gallery, reviews
│   │   └── SavedPages.tsx        # FavoritesPage and WatchlistPage grids
│   ├── App.tsx                   # Route declarations
│   ├── main.tsx                  # React entry point wrapped with providers
│   └── index.css                 # Tailwind CSS directives and custom animations
├── tests/
│   └── api/                      # Automated API Integration Test Suite
│       ├── health.test.ts        # Health check and 404 envelope tests
│       ├── auth.test.ts          # Auth, cookies, bcrypt, and JWT verification tests
│       ├── lists.test.ts         # Lists upsert, isolation, and concurrency tests
│       └── security.test.ts      # CSRF Origin, Helmet, and envelope tests
├── .env.example                  # Environment variable template with documentation
├── package.json                  # Root scripts and unified dependencies
├── render.yaml                   # Render Blueprint Infrastructure specification
├── vercel.json                   # Vercel SPA routing and /api/* edge rewrite config
├── tsconfig.json                 # TypeScript project configuration
├── tsconfig.server.json          # Strict TypeScript configuration for server
└── vite.config.ts                # Vite build and development proxy configuration
```

---

## 🗄 State Management & Data Flow

MovieVerse uses React's native Context API for state management:

### 1. `AuthContext`
Tracks the active user session:
- Calls `GET /api/auth/me` on initial page load.
- Provides `user`, `isAuthenticated`, `login()`, `signup()`, `logout()`, and `openAuthModal()`.
- Automatically prompts `MovieListContext` to fetch user lists on login or switch to guest `localStorage` on logout.

### 2. `MovieListContext` (Dual-Mode)
```text
                    ┌─────────────────────────┐
                    │    MovieListContext     │
                    └────────────┬────────────┘
                                 │
                 Is user authenticated?
                ┌────────────────┴────────────────┐
               YES                                NO
                │                                 │
                ▼                                 ▼
   [Express API (/api/*)]             [Browser localStorage]
   - GET /api/favorites               - Key: mv_favorites
   - GET /api/watchlist               - Key: mv_watchlist
   - Neon PostgreSQL database         - Immediate client storage
```
- **Optimistic UI**: Mutating actions immediately update the local React state, rolling back safely if the server request fails.
- **No Silent Merging**: In accordance with specification, guest lists remain stored locally and are not silently blended into newly created accounts.

---

## 🔌 API Reference

All backend routes are prefixed with `/api`. Mutating endpoints require `Origin: <approved_origin>` for CSRF protection.

### Health Check
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Returns `200 { "status": "ok", "db": "up" }` when database is healthy |

### Authentication
| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | No | `{ email, password, name }` | Creates user, sets `mv_session` cookie, returns `201 { user }` |
| `POST` | `/api/auth/login` | No | `{ email, password }` | Authenticates user, sets cookie, returns `200 { user }` |
| `POST` | `/api/auth/logout` | Optional | None | Clears `mv_session` cookie, returns `204` |
| `GET` | `/api/auth/me` | Yes | None | Returns `200 { user }` for current session cookie |

### Favorites (`/api/favorites`)
| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `GET` | `/api/favorites` | Yes | None | Retrieves all favorites for user, newest first (`200 { items }`) |
| `PUT` | `/api/favorites/:id` | Yes | `SavedMovie` | Upserts movie snapshot (`200 { item }`). URL ID must equal `body.id` |
| `DELETE`| `/api/favorites/:id` | Yes | None | Idempotently deletes movie snapshot (`204`) |
| `POST` | `/api/favorites/toggle`| Yes | `SavedMovie` | Atomically toggles movie state (`200 { favorited: boolean, item? }`) |

### Watchlist (`/api/watchlist`)
| Method | Endpoint | Auth | Request Body | Description |
|---|---|---|---|---|
| `GET` | `/api/watchlist` | Yes | None | Retrieves all watchlist items for user, newest first (`200 { items }`) |
| `PUT` | `/api/watchlist/:id` | Yes | `SavedMovie` | Upserts movie snapshot (`200 { item }`) |
| `DELETE`| `/api/watchlist/:id` | Yes | None | Idempotently deletes movie snapshot (`204`) |
| `POST` | `/api/watchlist/toggle`| Yes | `SavedMovie` | Atomically toggles movie state (`200 { inWatchlist: boolean, item? }`) |

---

## 🚀 Getting Started & Local Development

### Prerequisites
- **Node.js**: `24.x LTS` (or `20.x+`)
- **npm**: `9.x+`
- **TMDB API Key**: Free Developer key from [themoviedb.org](https://www.themoviedb.org/settings/api)
- **PostgreSQL Database**: Free instance from [Neon](https://neon.tech) or a local PostgreSQL container

### 1. Clone & Install
```bash
git clone https://github.com/Amrenther/tmdb_movies.git
cd tmdb_movies
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `.env` file with:
```env
VITE_TMDB_API_KEY=your_actual_tmdb_api_key
DATABASE_URL=postgresql://user:pass@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://user:pass@ep-sample.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=development-jwt-secret-must-be-at-least-32-characters-long
FRONTEND_ORIGIN=http://localhost:5173,https://tmdb-movies-tau.vercel.app
COOKIE_NAME=mv_session
PORT=4000
NODE_ENV=development
```

### 3. Initialize Database
Generate the Prisma Client and run initial migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Start Development Servers
Run the frontend and backend in separate terminals:

**Terminal 1 — Vite React Client:**
```bash
npm run dev
```
*(Runs at `http://localhost:5173`. Proxies relative `/api` calls to port `4000` via `vite.config.ts`).*

**Terminal 2 — Express TypeScript API:**
```bash
npm run dev:server
```
*(Runs at `http://localhost:4000` with hot-reload via `tsx watch`).*

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **`npm run dev`** | `vite` | Starts Vite React frontend development server (`:5173`) |
| **`npm run dev:server`** | `tsx watch server/src/index.ts` | Starts Express backend server with hot-reload (`:4000`) |
| **`npm run build`** | `tsc -b && vite build` | Type-checks & builds production React SPA in `dist/` |
| **`npm run build:server`** | `tsc -p tsconfig.server.json` | Compiles TypeScript Express API server to `server/dist/` |
| **`npm run start:server`** | `node server/dist/index.js` | Executes compiled production Express server |
| **`npm run prisma:generate`**| `prisma generate` | Generates `@prisma/client` from `prisma/schema.prisma` |
| **`npm run prisma:migrate`** | `prisma migrate dev` | Runs development database migrations locally |
| **`npm run prisma:deploy`**  | `prisma migrate deploy` | Applies pending migrations in production |
| **`npm run test:api`**       | `tsx --test tests/api/**/*.test.ts` | Runs the full 26-test API integration test suite |
| **`npm run lint`**           | `eslint .` | Runs ESLint across all TypeScript & React files |
| **`npm run preview`**        | `vite preview` | Previews the production client build locally |

---

## 🔑 Environment Variables

| Variable | Target | Required | Description |
|---|---|---|---|
| `VITE_TMDB_API_KEY` | Frontend | Yes | TMDB API v3 key for direct movie browse |
| `PORT` | Backend | No | Express port (`4000` locally, `10000` on Render) |
| `NODE_ENV` | Backend | Yes | `development`, `production`, or `test` |
| `DATABASE_URL` | Backend | Yes | PostgreSQL connection string (use **pooled** URL on Neon) |
| `DIRECT_URL` | Backend | Yes | Direct PostgreSQL connection string (for migrations) |
| `JWT_SECRET` | Backend | Yes | Min 32-character secret for signing session JWTs |
| `FRONTEND_ORIGIN` | Backend | Yes | Comma-separated list of allowed origins for CORS/CSRF |
| `COOKIE_NAME` | Backend | No | Name of session cookie (default: `mv_session`) |

---

## 🌐 Production Deployment Guide ($0 Hobby Tier)

MovieVerse is configured to run continuously at **$0 cost** using Neon, Render, and Vercel.

### Step 1: Provision Neon PostgreSQL
1. Create a free account at [neon.tech](https://neon.tech) and start a new project.
2. Under **Connection Details**, copy:
   - **Pooled connection**: Set as `DATABASE_URL` for runtime queries.
   - **Direct connection**: Set as `DIRECT_URL` for Prisma migrations.

### Step 2: Deploy Express API on Render
Deploy via Render Blueprint or manual dashboard setup:

#### Option A: Automatic Blueprint Setup (`render.yaml`)
1. In the [Render Dashboard](https://dashboard.render.com), navigate to **Blueprints** → **New Blueprint Instance**.
2. Connect your GitHub repository. Render automatically reads [`render.yaml`](./render.yaml).
3. Fill in the secret values (`DATABASE_URL` and `DIRECT_URL`).

#### Option B: Manual Web Service Setup
1. In Render, select **New +** → **Web Service** and connect the repository.
2. Configuration:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Plan**: `Free`
   - **Health Check Path**: `/api/health`
3. Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: *(Your Neon pooled connection URL)*
   - `DIRECT_URL`: *(Your Neon direct connection URL)*
   - `JWT_SECRET`: *(A random, cryptographically secure 32+ character string)*
   - `FRONTEND_ORIGIN`: `https://tmdb-movies-tau.vercel.app`
   - `COOKIE_NAME`: `mv_session`
4. Apply migrations: Run `npm run prisma:deploy` against your Neon direct database URL.

### Step 3: Deploy Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set Environment Variable:
   - `VITE_TMDB_API_KEY`: *(Your TMDB API key)*
3. Confirm [`vercel.json`](./vercel.json):
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://movieverse-api.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *(Note: If your Render service URL differs from `movieverse-api.onrender.com`, update the destination URL).*
4. Deploy. Vercel routes `/api/*` requests to Render and sends all other requests to React Router's `index.html`.

---

## ⚡ Operational Characteristics & Cold Starts

Because MovieVerse leverages free-tier hosting infrastructure:

- **Render Cold Starts**: Render free web services spin down after 15 minutes of inactivity. When a request arrives after inactivity, the instance resumes within ~50 seconds. The frontend features loading indicators and friendly error recovery states so users can retry without losing their place.
- **Neon Serverless Inactivity**: Neon database computes suspend after a period of zero queries and resume automatically within milliseconds upon receiving a new connection.
- **In-Memory Rate Limiting**: Auth endpoints limit requests to 20 per 15 minutes per IP using an in-memory sliding window, preventing brute force attempts without requiring a paid Redis instance.
- **Stateless Cookies**: Sessions are stored directly in signed `httpOnly` JWT cookies, removing the need for a persistent server-side session store.

---

## 🧪 Testing & Quality Assurance

MovieVerse includes an extensive automated integration test suite written with Node's native test runner (`node:test`) and executed via `tsx`:

```bash
npm run test:api
```

### Test Coverage Highlights (26/26 Passing)
- **Authentication**: Valid registration, password hashing verification, short password rejection, duplicate email conflict (`409`), credential check, session cookie issuance, `/api/auth/me` verification, logout cookie clearing, and invalid/expired JWT rejection.
- **Favorites & Watchlist**: Auth enforcement, PUT snapshot upsert with TMDB field mappings, ID mismatch validation, duplicate PUT idempotence, toggle operations, cross-account user isolation, idempotent DELETE, and concurrent toggle race handling.
- **Security & CSRF**: Mandatory `Origin` header validation on mutating requests, Helmet security headers, `X-Powered-By` suppression, and standardized JSON error envelopes.
- **Database Health**: Real query test on `GET /api/health` with `200 { "status": "ok", "db": "up" }`.

---

## 🗂 Key Design Decisions

1. **Dual-Tier State Management**: Unauthenticated users enjoy zero-friction `localStorage` list saving, while logged-in users get cloud synchronization with PostgreSQL.
2. **First-Party Cookie Isolation**: By utilizing Vercel's edge rewrite to proxy `/api/*`, the browser sees all API calls as same-origin, ensuring cookies work without third-party cookie blocking.
3. **Optimistic UI with Rollback**: Card toggles update immediately on click for instant responsiveness, with graceful rollback and error notification if the network request fails.
4. **Zero TMDB Proxying**: TMDB calls stay client-side, eliminating server bottlenecking and preserving server memory.
5. **Concurrency Hardening**: Toggle operations handle duplicate-key race conditions (`P2002`) safely without returning 500 internal errors.

---

## 📋 Changelog

### v1.2.0 — Full-Stack Backend, Cloud Auth & Lists, Deployment *(Current)*
- Added Express 5 TypeScript REST API with Prisma 7 and PostgreSQL.
- Implemented user registration, login, logout, and session restoration with bcryptjs and JWT cookies.
- Implemented account-owned Favorites and Watchlist persistence with concurrency hardening.
- Integrated `AuthModal` and connected `MovieListContext` to cloud backend with optimistic UI and rollback.
- Added 26-test API integration test suite covering SRS acceptance requirements.
- Configured Vercel same-origin `/api/*` edge rewrite and Render Blueprint (`render.yaml`).
- Updated project documentation with full architecture and $0 deployment guides.

### v1.1.0 — Favorites & Watchlist Context *(2026-07-04)*
- Added `MovieListContext` with persistent `localStorage` for guests.
- Added `/favorites` and `/watchlist` pages with remove buttons and empty states.
- Added live count badges on navigation links.

### v1.0.0 — Initial Frontend Release
- Hero Spotlight, Trending/Top Rated/Now Playing rows, Browse Grid, Genre Filter, Live Search.
- Movie Details with Trailers, Image Gallery with Lightbox, Reviews, Similar Movies.
- Deployed on Vercel with SPA routing.

---

## 🤝 Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Ensure your code passes linting and tests before submitting:
```bash
npm run lint
npm run test:api
npm run build
npm run build:server
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the comprehensive free movie data API
- [React](https://react.dev/) team for the modern React 19 framework
- [Vite](https://vitejs.dev/) for the lightning-fast build tooling
- [Prisma](https://www.prisma.io/) for type-safe database queries and migrations
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Render](https://render.com/) for free Web Service hosting
- [Vercel](https://vercel.com/) for seamless edge SPA hosting

---

## 👨‍💻 About the Author

<p align="center">
  Made with ❤️ by <a href="https://github.com/Amrenther"><strong>Amrenther</strong></a>
</p>

I'm a Full Stack Developer passionate about building modern, scalable, and responsive web applications with **React**, **TypeScript**, **Node.js**, **Express**, **PostgreSQL**, and **Prisma**.

- 🌐 **GitHub**: [github.com/Amrenther](https://github.com/Amrenther)
- 💼 **LinkedIn**: [linkedin.com/in/amrenther](https://www.linkedin.com/in/amrenther/)

⭐ **If you found this project helpful, please consider giving the repository a star!**
