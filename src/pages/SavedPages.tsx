import { useNavigate } from "react-router-dom";
import { useMovieList, type SavedMovie } from "../context/MovieListContext";

/* ─── Saved Movie Card ───────────────────────────────────── */
const SavedCard = ({
    movie,
    onRemove,
    removeLabel,
    removeColor,
}: {
    movie: SavedMovie;
    onRemove: (id: number) => void;
    removeLabel: string;
    removeColor: string;
}) => {
    const navigate = useNavigate();
    return (
        <div className="saved-card" onClick={() => navigate(`/movie/${movie.id}`)}>
            <style>{`
                .saved-card {
                    position: relative;
                    border-radius: 0.85rem;
                    overflow: hidden;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    cursor: pointer;
                    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
                }
                .saved-card:hover {
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.6);
                    border-color: rgba(102,126,234,0.45);
                }
                .saved-card-poster-wrap {
                    position: relative;
                    aspect-ratio: 2/3;
                    overflow: hidden;
                    background: #111;
                }
                .saved-card-poster {
                    width: 100%; height: 100%;
                    object-fit: cover; display: block;
                    transition: transform 0.4s;
                }
                .saved-card:hover .saved-card-poster { transform: scale(1.07); }
                .saved-card-no-poster {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 3rem; color: #374151;
                }
                .saved-card-rating {
                    position: absolute; top: 0.45rem; right: 0.45rem;
                    background: rgba(0,0,0,0.78); backdrop-filter: blur(4px);
                    color: #fbbf24; font-size: 0.7rem; font-weight: 700;
                    padding: 0.18rem 0.45rem; border-radius: 4px;
                }
                .saved-card-remove {
                    position: absolute; top: 0.45rem; left: 0.45rem;
                    background: rgba(0,0,0,0.72); backdrop-filter: blur(6px);
                    border: 1px solid rgba(255,255,255,0.12);
                    color: #fff; font-size: 0.62rem; font-weight: 700;
                    padding: 0.2rem 0.5rem; border-radius: 999px;
                    cursor: pointer; transition: background 0.2s, color 0.2s;
                    z-index: 2;
                }
                .saved-card-remove:hover { background: ${removeColor}; }
                .saved-card-body { padding: 0.65rem 0.7rem 0.75rem; }
                .saved-card-title {
                    font-size: 0.8rem; font-weight: 700; color: #e2e8f0;
                    overflow: hidden; display: -webkit-box;
                    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    line-height: 1.35; margin-bottom: 0.3rem;
                }
                .saved-card-year { font-size: 0.68rem; color: #64748b; }
            `}</style>
            <div className="saved-card-poster-wrap">
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        className="saved-card-poster"
                        loading="lazy"
                    />
                ) : (
                    <div className="saved-card-no-poster">🎬</div>
                )}
                <span className="saved-card-rating">★ {movie.vote_average?.toFixed(1)}</span>
                <button
                    className="saved-card-remove"
                    title={removeLabel}
                    onClick={(e) => { e.stopPropagation(); onRemove(movie.id); }}
                >
                    ✕ Remove
                </button>
            </div>
            <div className="saved-card-body">
                <div className="saved-card-title">{movie.title}</div>
                <div className="saved-card-year">{movie.release_date?.slice(0, 4)}</div>
            </div>
        </div>
    );
};

/* ─── Reusable List Page ─────────────────────────────────── */
const SavedListPage = ({
    type,
}: {
    type: "favorites" | "watchlist";
}) => {
    const { favorites, watchlist, removeFavorite, removeWatchlist } = useMovieList();
    const navigate = useNavigate();

    const isFav = type === "favorites";
    const movies = isFav ? favorites : watchlist;
    const onRemove = isFav ? removeFavorite : removeWatchlist;
    const title = isFav ? "My Favorites" : "My Watchlist";
    const emoji = isFav ? "❤️" : "🔖";
    const removeLabel = isFav ? "Remove from Favorites" : "Remove from Watchlist";
    const removeColor = isFav ? "rgba(239,68,68,0.8)" : "rgba(59,130,246,0.8)";
    const emptyMsg = isFav
        ? "You haven't favorited any movies yet."
        : "Your watchlist is empty. Start adding movies!";
    const emptyEmoji = isFav ? "💔" : "📭";
    const accentGrad = isFav
        ? "linear-gradient(135deg, #ef4444, #ec4899)"
        : "linear-gradient(135deg, #3b82f6, #6366f1)";

    return (
        <div className="saved-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .saved-page {
                    min-height: 100vh;
                    background: #0a0a0f;
                    color: #e2e8f0;
                    font-family: 'Inter', sans-serif;
                    padding: 2.5rem 1.5rem 5rem;
                }
                .saved-page-inner { max-width: 1300px; margin: 0 auto; }

                .saved-page-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }
                .saved-page-title {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: clamp(1.5rem, 4vw, 2rem);
                    font-weight: 900;
                    color: #fff;
                }
                .saved-page-title-emoji { font-size: 1.6rem; }
                .saved-page-count {
                    display: inline-flex;
                    align-items: center;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #fff;
                    padding: 0.25rem 0.7rem;
                    border-radius: 999px;
                    background: ${accentGrad};
                    margin-left: 0.25rem;
                }
                .saved-back-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    color: #94a3b8; background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.5rem 1.1rem; border-radius: 999px;
                    font-size: 0.85rem; cursor: pointer;
                    transition: background 0.2s, color 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .saved-back-btn:hover { background: rgba(255,255,255,0.12); color: #fff; }

                .saved-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
                    gap: 1.1rem;
                }
                @media (max-width: 480px) { .saved-grid { grid-template-columns: repeat(2, 1fr); } }

                .saved-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    text-align: center;
                    gap: 1rem;
                }
                .saved-empty-emoji { font-size: 4rem; }
                .saved-empty-title {
                    font-size: 1.2rem; font-weight: 700; color: #e2e8f0;
                }
                .saved-empty-desc { color: #4b5563; font-size: 0.9rem; max-width: 300px; line-height: 1.6; }
                .saved-empty-cta {
                    margin-top: 0.5rem;
                    padding: 0.65rem 1.5rem;
                    border-radius: 999px;
                    border: none;
                    background: ${accentGrad};
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .saved-empty-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
            `}</style>

            <div className="saved-page-inner">
                <div className="saved-page-header">
                    <h1 className="saved-page-title">
                        <span className="saved-page-title-emoji">{emoji}</span>
                        {title}
                        {movies.length > 0 && (
                            <span className="saved-page-count">{movies.length}</span>
                        )}
                    </h1>
                    <button className="saved-back-btn" onClick={() => navigate("/")}>
                        ← Back to Home
                    </button>
                </div>

                {movies.length === 0 ? (
                    <div className="saved-empty">
                        <div className="saved-empty-emoji">{emptyEmoji}</div>
                        <div className="saved-empty-title">Nothing here yet</div>
                        <p className="saved-empty-desc">{emptyMsg}</p>
                        <button className="saved-empty-cta" onClick={() => navigate("/")}>
                            🎬 Explore Movies
                        </button>
                    </div>
                ) : (
                    <div className="saved-grid">
                        {movies.map((movie) => (
                            <SavedCard
                                key={movie.id}
                                movie={movie}
                                onRemove={onRemove}
                                removeLabel={removeLabel}
                                removeColor={removeColor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const FavoritesPage = () => <SavedListPage type="favorites" />;
export const WatchlistPage = () => <SavedListPage type="watchlist" />;
