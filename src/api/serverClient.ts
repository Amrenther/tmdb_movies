import axios from "axios";

/**
 * Axios instance for the MovieVerse backend API.
 *
 * Uses a relative /api base so the same code works in:
 *   - Local dev:   Vite proxies /api → http://localhost:4000  (vite.config.ts)
 *   - Production:  Vercel rewrites /api/* → Render API origin (vercel.json)
 *
 * withCredentials: true sends the mv_session httpOnly cookie on every request.
 * Never use this client for TMDB calls — keep those on tmdbClient.ts.
 */
export const serverClient = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublicUser {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface SavedMoviePayload {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    release_date: string;
    vote_average: number;
    overview?: string;
    genre_ids?: number[];
}

export interface ApiFieldError {
    path: string;
    message: string;
}

export interface ApiErrorEnvelope {
    code: string;
    message: string;
    errors: ApiFieldError[];
}

// ─── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
    me: () =>
        serverClient.get<{ user: PublicUser }>("/auth/me"),

    login: (email: string, password: string) =>
        serverClient.post<{ user: PublicUser }>("/auth/login", { email, password }),

    signup: (email: string, password: string, name: string) =>
        serverClient.post<{ user: PublicUser }>("/auth/signup", { email, password, name }),

    logout: () =>
        serverClient.post<void>("/auth/logout"),
};

// ─── List endpoints (favorites and watchlist share the same shape) ─────────────

function listApi(prefix: "favorites" | "watchlist") {
    return {
        getAll: () =>
            serverClient.get<{ items: SavedMoviePayload[] }>(`/${prefix}`),

        put: (movieId: number, payload: SavedMoviePayload) =>
            serverClient.put<{ item: SavedMoviePayload }>(`/${prefix}/${movieId}`, payload),

        delete: (movieId: number) =>
            serverClient.delete(`/${prefix}/${movieId}`),

        toggle: (payload: SavedMoviePayload) =>
            serverClient.post<{ favorited?: boolean; inWatchlist?: boolean; item?: SavedMoviePayload }>(
                `/${prefix}/toggle`,
                payload
            ),
    };
}

export const favoritesApi = listApi("favorites");
export const watchlistApi = listApi("watchlist");
