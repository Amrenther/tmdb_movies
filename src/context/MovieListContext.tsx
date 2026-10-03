import {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useCallback,
    type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { favoritesApi, watchlistApi, type SavedMoviePayload } from "../api/serverClient";

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
export interface MovieListContextType {
    favorites: SavedMovie[];
    watchlist: SavedMovie[];
    pendingIds: Set<number>;
    isLoadingLists: boolean;
    listError: string | null;
    clearListError: () => void;
    retryLoadLists: () => void;
    toggleFavorite: (movie: SavedMovie) => Promise<void>;
    isFavorite: (id: number) => boolean;
    toggleWatchlist: (movie: SavedMovie) => Promise<void>;
    isInWatchlist: (id: number) => boolean;
    removeFavorite: (id: number) => Promise<void>;
    removeWatchlist: (id: number) => Promise<void>;
}

const MovieListContext = createContext<MovieListContextType | null>(null);

/* ─── Hook ───────────────────────────────────────────────── */
export const useMovieList = (): MovieListContextType => {
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

const toPayload = (m: SavedMovie): SavedMoviePayload => ({
    id: m.id,
    title: m.title,
    poster_path: m.poster_path ?? null,
    backdrop_path: m.backdrop_path ?? null,
    release_date: m.release_date || "",
    vote_average: m.vote_average ?? 0,
    overview: m.overview,
    genre_ids: m.genre_ids,
});

/* ─── Provider ───────────────────────────────────────────── */
export const MovieListProvider = ({ children }: { children: ReactNode }) => {
    const { user, isLoading: authLoading } = useAuth();

    const [favorites, setFavorites] = useState<SavedMovie[]>(() => load("mv_favorites"));
    const [watchlist, setWatchlist] = useState<SavedMovie[]>(() => load("mv_watchlist"));
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
    const [isLoadingLists, setIsLoadingLists] = useState<boolean>(false);
    const [listError, setListError] = useState<string | null>(null);

    const prevUserRef = useRef<typeof user | undefined>(undefined);

    // Save to localStorage only in guest mode
    useEffect(() => {
        if (!user && !authLoading) {
            localStorage.setItem("mv_favorites", JSON.stringify(favorites));
        }
    }, [favorites, user, authLoading]);

    useEffect(() => {
        if (!user && !authLoading) {
            localStorage.setItem("mv_watchlist", JSON.stringify(watchlist));
        }
    }, [watchlist, user, authLoading]);

    // Load lists from server
    const loadServerLists = useCallback(async () => {
        setIsLoadingLists(true);
        setListError(null);
        try {
            const [favRes, watchRes] = await Promise.all([
                favoritesApi.getAll(),
                watchlistApi.getAll(),
            ]);
            setFavorites(favRes.data.items);
            setWatchlist(watchRes.data.items);
        } catch {
            setListError("Could not load your saved lists from the server.");
        } finally {
            setIsLoadingLists(false);
        }
    }, []);

    // React to user login / logout
    useEffect(() => {
        if (authLoading) return;

        if (user) {
            // Signed in: fetch server lists (v1 no-merge policy: ignores localStorage)
            loadServerLists();
        } else if (prevUserRef.current !== undefined && prevUserRef.current !== null) {
            // Logged out: clear account-owned lists
            setFavorites([]);
            setWatchlist([]);
            setListError(null);
        }

        prevUserRef.current = user;
    }, [user, authLoading, loadServerLists]);

    const isFavorite = (id: number) => favorites.some((m) => m.id === id);
    const isInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

    const clearListError = () => setListError(null);
    const retryLoadLists = () => {
        if (user) loadServerLists();
    };

    // ─── Favorites mutation ───
    const toggleFavorite = async (movie: SavedMovie) => {
        if (pendingIds.has(movie.id)) return;

        if (!user) {
            setFavorites((prev) =>
                isFavorite(movie.id) ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev]
            );
            return;
        }

        const favorited = isFavorite(movie.id);
        const previousFavorites = favorites;

        // Optimistic update
        setFavorites((prev) =>
            favorited ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev]
        );
        setPendingIds((prev) => new Set(prev).add(movie.id));
        setListError(null);

        try {
            if (favorited) {
                await favoritesApi.delete(movie.id);
            } else {
                await favoritesApi.put(movie.id, toPayload(movie));
            }
        } catch {
            setFavorites(previousFavorites);
            setListError("Failed to update favorites. Changes reverted.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(movie.id);
                return next;
            });
        }
    };

    const removeFavorite = async (id: number) => {
        if (pendingIds.has(id)) return;

        if (!user) {
            setFavorites((prev) => prev.filter((m) => m.id !== id));
            return;
        }

        const previousFavorites = favorites;
        setFavorites((prev) => prev.filter((m) => m.id !== id));
        setPendingIds((prev) => new Set(prev).add(id));
        setListError(null);

        try {
            await favoritesApi.delete(id);
        } catch {
            setFavorites(previousFavorites);
            setListError("Failed to remove from favorites. Changes reverted.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    // ─── Watchlist mutation ───
    const toggleWatchlist = async (movie: SavedMovie) => {
        if (pendingIds.has(movie.id)) return;

        if (!user) {
            setWatchlist((prev) =>
                isInWatchlist(movie.id) ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev]
            );
            return;
        }

        const inWatchlist = isInWatchlist(movie.id);
        const previousWatchlist = watchlist;

        // Optimistic update
        setWatchlist((prev) =>
            inWatchlist ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev]
        );
        setPendingIds((prev) => new Set(prev).add(movie.id));
        setListError(null);

        try {
            if (inWatchlist) {
                await watchlistApi.delete(movie.id);
            } else {
                await watchlistApi.put(movie.id, toPayload(movie));
            }
        } catch {
            setWatchlist(previousWatchlist);
            setListError("Failed to update watchlist. Changes reverted.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(movie.id);
                return next;
            });
        }
    };

    const removeWatchlist = async (id: number) => {
        if (pendingIds.has(id)) return;

        if (!user) {
            setWatchlist((prev) => prev.filter((m) => m.id !== id));
            return;
        }

        const previousWatchlist = watchlist;
        setWatchlist((prev) => prev.filter((m) => m.id !== id));
        setPendingIds((prev) => new Set(prev).add(id));
        setListError(null);

        try {
            await watchlistApi.delete(id);
        } catch {
            setWatchlist(previousWatchlist);
            setListError("Failed to remove from watchlist. Changes reverted.");
        } finally {
            setPendingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    return (
        <MovieListContext.Provider
            value={{
                favorites,
                watchlist,
                pendingIds,
                isLoadingLists,
                listError,
                clearListError,
                retryLoadLists,
                toggleFavorite,
                isFavorite,
                toggleWatchlist,
                isInWatchlist,
                removeFavorite,
                removeWatchlist,
            }}
        >
            {children}
        </MovieListContext.Provider>
    );
};
