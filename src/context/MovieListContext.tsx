import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

/* ─── Shared Movie shape ─────────────────────────────────── */
export interface SavedMovie {
    id: number;
    title: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    release_date: string;
    vote_average: number;
    overview?: string;
    genre_ids?: number[];
}

/* ─── Context type ───────────────────────────────────────── */
interface MovieListContextType {
    favorites: SavedMovie[];
    watchlist: SavedMovie[];
    toggleFavorite: (movie: SavedMovie) => void;
    isFavorite: (id: number) => boolean;
    toggleWatchlist: (movie: SavedMovie) => void;
    isInWatchlist: (id: number) => boolean;
    removeFavorite: (id: number) => void;
    removeWatchlist: (id: number) => void;
}

const MovieListContext = createContext<MovieListContextType | null>(null);

/* ─── Hook ───────────────────────────────────────────────── */
export const useMovieList = () => {
    const ctx = useContext(MovieListContext);
    if (!ctx) throw new Error("useMovieList must be used within MovieListProvider");
    return ctx;
};

/* ─── Helpers ────────────────────────────────────────────── */
const load = (key: string): SavedMovie[] => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/* ─── Provider ───────────────────────────────────────────── */
export const MovieListProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<SavedMovie[]>(() => load("mv_favorites"));
    const [watchlist, setWatchlist] = useState<SavedMovie[]>(() => load("mv_watchlist"));

    useEffect(() => {
        localStorage.setItem("mv_favorites", JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        localStorage.setItem("mv_watchlist", JSON.stringify(watchlist));
    }, [watchlist]);

    const isFavorite = (id: number) => favorites.some((m) => m.id === id);
    const isInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

    const toggleFavorite = (movie: SavedMovie) => {
        setFavorites((prev) =>
            isFavorite(movie.id) ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev]
        );
    };

    const toggleWatchlist = (movie: SavedMovie) => {
        setWatchlist((prev) =>
            isInWatchlist(movie.id) ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev]
        );
    };

    const removeFavorite = (id: number) => setFavorites((prev) => prev.filter((m) => m.id !== id));
    const removeWatchlist = (id: number) => setWatchlist((prev) => prev.filter((m) => m.id !== id));

    return (
        <MovieListContext.Provider
            value={{ favorites, watchlist, toggleFavorite, isFavorite, toggleWatchlist, isInWatchlist, removeFavorite, removeWatchlist }}
        >
            {children}
        </MovieListContext.Provider>
    );
};
