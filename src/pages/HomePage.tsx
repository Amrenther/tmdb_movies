import { useNavigate } from "react-router-dom";
import { getMovies, getGenres, getTrendingMovies, getTopRatedMovies, getNowPlayingMovies } from "../api/tmdbApi";
import { useEffect, useState, useRef } from "react";

/* ─── Types ─────────────────────────────────────────────── */
interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    release_date: string;
    vote_average: number;
    overview: string;
    genre_ids: number[];
}

interface Genre {
    id: number;
    name: string;
}

/* ─── Skeleton Card ──────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="skeleton-card">
        <div className="skeleton-img skeleton-shimmer" />
        <div style={{ padding: "0.75rem" }}>
            <div className="skeleton-line skeleton-shimmer" style={{ height: 13, width: "80%", marginBottom: "0.5rem" }} />
            <div className="skeleton-line skeleton-shimmer" style={{ height: 11, width: "50%" }} />
        </div>
    </div>
);

/* ─── Movie Card ─────────────────────────────────────────── */
const MovieCard = ({ movie, genres }: { movie: Movie; genres: Genre[] }) => {
    const navigate = useNavigate();
    const genreNames = movie.genre_ids
        ?.slice(0, 2)
        .map((gid) => genres.find((g) => g.id === gid)?.name)
        .filter(Boolean);

    return (
        <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
            <div className="movie-card-poster-wrap">
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                        alt={movie.title}
                        className="movie-card-poster"
                        loading="lazy"
                    />
                ) : (
                    <div className="movie-card-no-poster">🎬</div>
                )}
                <div className="movie-card-overlay">
                    <button className="movie-card-play-btn">▶ Details</button>
                </div>
                <span className="movie-card-rating">
                    ★ {movie.vote_average?.toFixed(1)}
                </span>
            </div>
            <div className="movie-card-body">
                <h3 className="movie-card-title">{movie.title}</h3>
                <div className="movie-card-meta">
                    <span>{movie.release_date?.slice(0, 4)}</span>
                    {genreNames?.map((g, i) => (
                        <span key={i} className="movie-card-genre">{g}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─── Horizontal Scroll Row ──────────────────────────────── */
const MovieRow = ({
    title,
    emoji,
    movies,
    genres,
    loading,
}: {
    title: string;
    emoji: string;
    movies: Movie[];
    genres: Genre[];
    loading: boolean;
}) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const scroll = (dir: "left" | "right") => {
        if (!rowRef.current) return;
        rowRef.current.scrollBy({ left: dir === "right" ? 320 : -320, behavior: "smooth" });
    };

    return (
        <section className="movie-row-section">
            <div className="movie-row-header">
                <h2 className="movie-row-title">
                    <span className="movie-row-emoji">{emoji}</span>
                    {title}
                </h2>
                <div className="row-scroll-btns">
                    <button className="row-scroll-btn" onClick={() => scroll("left")}>‹</button>
                    <button className="row-scroll-btn" onClick={() => scroll("right")}>›</button>
                </div>
            </div>

            <div className="movie-row-track" ref={rowRef}>
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                    : movies.map((m) => <MovieCard key={m.id} movie={m} genres={genres} />)}
            </div>
        </section>
    );
};

/* ─── Hero Spotlight ─────────────────────────────────────── */
const HeroSpotlight = ({ movies }: { movies: Movie[] }) => {
    const navigate = useNavigate();
    const [idx, setIdx] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const featured = movies.slice(0, 6);
    const movie = featured[idx];

    const resetTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setIdx((p) => (p + 1) % featured.length), 6000);
    };

    useEffect(() => {
        if (!featured.length) return;
        resetTimer();
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [featured.length]);

    const goTo = (i: number) => { setIdx(i); resetTimer(); };

    if (!movie) return null;

    return (
        <div className="hero">
            {/* Backdrop */}
            <div className="hero-backdrop-wrap">
                <img
                    key={movie.id}
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="hero-backdrop"
                />
                <div className="hero-backdrop-grad" />
            </div>

            {/* Content */}
            <div className="hero-content">
                <div className="hero-badge">🔥 Trending Now</div>
                <h1 className="hero-title">{movie.title}</h1>
                <p className="hero-overview">{movie.overview?.slice(0, 180)}{movie.overview?.length > 180 ? "…" : ""}</p>
                <div className="hero-meta">
                    <span className="hero-rating">★ {movie.vote_average?.toFixed(1)}</span>
                    <span className="hero-year">{movie.release_date?.slice(0, 4)}</span>
                </div>
                <div className="hero-actions">
                    <button className="hero-btn-primary" onClick={() => navigate(`/movie/${movie.id}`)}>
                        ▶ View Details
                    </button>
                </div>
            </div>

            {/* Dot indicators */}
            <div className="hero-dots">
                {featured.map((_, i) => (
                    <button
                        key={i}
                        className={`hero-dot ${i === idx ? "active" : ""}`}
                        onClick={() => goTo(i)}
                    />
                ))}
            </div>

            {/* Thumbnail strip */}
            <div className="hero-strip">
                {featured.map((m, i) => (
                    <button
                        key={m.id}
                        className={`hero-strip-item ${i === idx ? "active" : ""}`}
                        onClick={() => goTo(i)}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/w154${m.poster_path}`}
                            alt={m.title}
                            className="hero-strip-img"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};

/* ─── Stats Bar ──────────────────────────────────────────── */
const StatsBar = () => (
    <div className="stats-bar">
        {[
            { icon: "🎬", label: "Movies", value: "500,000+" },
            { icon: "⭐", label: "Reviews", value: "2M+" },
            { icon: "🌍", label: "Languages", value: "50+" },
            { icon: "📺", label: "TV Shows", value: "100,000+" },
        ].map((s) => (
            <div key={s.label} className="stat-item">
                <span className="stat-icon">{s.icon}</span>
                <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                </div>
            </div>
        ))}
    </div>
);

/* ─── Genre Pill Row ─────────────────────────────────────── */
const GenreFilter = ({
    genres,
    selected,
    onSelect,
}: {
    genres: Genre[];
    selected: string;
    onSelect: (id: string) => void;
}) => (
    <div className="genre-filter-row">
        <button
            className={`genre-pill ${selected === "" ? "active" : ""}`}
            onClick={() => onSelect("")}
        >All</button>
        {genres.map((g) => (
            <button
                key={g.id}
                className={`genre-pill ${selected === String(g.id) ? "active" : ""}`}
                onClick={() => onSelect(String(g.id))}
            >{g.name}</button>
        ))}
    </div>
);

/* ─── Main HomePage ──────────────────────────────────────── */
const HomePage = () => {
    const navigate = useNavigate();

    const [trending, setTrending] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [rowsLoading, setRowsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchMovie, setSearchMovie] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    // Fetch genres + rows
    useEffect(() => {
        getGenres().then((d) => setGenres(d.genres));
        setRowsLoading(true);
        Promise.all([
            getTrendingMovies("week"),
            getTopRatedMovies(),
            getNowPlayingMovies(),
        ]).then(([tr, top, now]) => {
            setTrending(tr.results);
            setTopRated(top.results);
            setNowPlaying(now.results);
        }).finally(() => setRowsLoading(false));
    }, []);

    // Fetch grid movies
    useEffect(() => {
        setLoading(true);
        getMovies(page, selectedGenre, searchMovie)
            .then((d) => {
                setMovies(d.results);
                setTotalPages(Math.min(d.total_pages, 500));
            })
            .finally(() => setLoading(false));
    }, [page, selectedGenre, searchMovie]);

    const handleGenreSelect = (id: string) => {
        setSelectedGenre(id);
        setPage(1);
    };

    const handleSearch = (v: string) => {
        setSearchMovie(v);
        setPage(1);
    };


    return (
        <div className="home-page">
            <style>{`
                /* ── Page root ── */
                .home-page {
                    background: #0a0a0f;
                    min-height: 100vh;
                    color: #e2e8f0;
                    font-family: 'Inter', sans-serif;
                }

                /* ── Hero ── */
                .hero {
                    position: relative;
                    height: clamp(480px, 72vh, 700px);
                    overflow: hidden;
                    display: flex;
                    align-items: flex-end;
                }
                .hero-backdrop-wrap {
                    position: absolute;
                    inset: 0;
                }
                .hero-backdrop {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center top;
                    transition: opacity 0.8s ease;
                    animation: heroFade 0.7s ease;
                }
                @keyframes heroFade {
                    from { opacity: 0; transform: scale(1.03); }
                    to   { opacity: 1; transform: scale(1); }
                }
                .hero-backdrop-grad {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(
                        to bottom,
                        rgba(10,10,15,0.1) 0%,
                        rgba(10,10,15,0.4) 40%,
                        rgba(10,10,15,0.95) 100%
                    );
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    padding: 0 2rem 7rem;
                    max-width: 680px;
                    animation: slideUp 0.6s ease;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @media (max-width: 640px) {
                    .hero-content { padding: 0 1rem 8rem; }
                    .hero { height: clamp(380px, 65vh, 560px); }
                }

                .hero-badge {
                    display: inline-block;
                    background: linear-gradient(135deg, rgba(102,126,234,0.25), rgba(240,147,251,0.2));
                    border: 1px solid rgba(167,139,250,0.3);
                    color: #c4b5fd;
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    padding: 0.25rem 0.75rem;
                    border-radius: 999px;
                    margin-bottom: 0.75rem;
                    text-transform: uppercase;
                }
                .hero-title {
                    font-size: clamp(1.6rem, 5vw, 3rem);
                    font-weight: 900;
                    color: #fff;
                    line-height: 1.15;
                    margin-bottom: 0.75rem;
                    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
                }
                .hero-overview {
                    color: #94a3b8;
                    font-size: clamp(0.82rem, 1.5vw, 0.95rem);
                    line-height: 1.65;
                    margin-bottom: 1rem;
                    max-width: 540px;
                }
                .hero-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                }
                .hero-rating {
                    background: rgba(250,204,21,0.15);
                    border: 1px solid rgba(250,204,21,0.3);
                    color: #fbbf24;
                    font-weight: 700;
                    font-size: 0.82rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 999px;
                }
                .hero-year {
                    color: #64748b;
                    font-size: 0.82rem;
                }
                .hero-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

                .hero-btn-primary {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: #fff;
                    border: none;
                    padding: 0.65rem 1.5rem;
                    border-radius: 999px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 16px rgba(102,126,234,0.4);
                }
                .hero-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(102,126,234,0.5);
                }

                /* Dots */
                .hero-dots {
                    position: absolute;
                    bottom: 5.5rem;
                    right: 2rem;
                    display: flex;
                    gap: 0.4rem;
                    z-index: 3;
                }
                @media (max-width: 640px) { .hero-dots { display: none; } }
                .hero-dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.25);
                    cursor: pointer;
                    transition: background 0.2s, width 0.3s;
                    padding: 0;
                }
                .hero-dot.active {
                    background: #a78bfa;
                    width: 20px;
                    border-radius: 4px;
                }

                /* Strip */
                .hero-strip {
                    position: absolute;
                    bottom: 1rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 0.5rem;
                    z-index: 3;
                }
                @media (max-width: 640px) { .hero-strip { gap: 0.3rem; } }
                .hero-strip-item {
                    width: 52px; height: 74px;
                    border-radius: 6px;
                    overflow: hidden;
                    border: 2px solid transparent;
                    cursor: pointer;
                    padding: 0;
                    transition: border-color 0.2s, transform 0.2s;
                    flex-shrink: 0;
                    opacity: 0.5;
                    filter: grayscale(30%);
                }
                @media (max-width: 480px) {
                    .hero-strip-item { width: 40px; height: 56px; }
                }
                .hero-strip-item.active {
                    border-color: #a78bfa;
                    opacity: 1;
                    filter: none;
                    transform: scale(1.07);
                }
                .hero-strip-item:hover { opacity: 0.85; }
                .hero-strip-img { width: 100%; height: 100%; object-fit: cover; }

                /* ── Stats Bar ── */
                .stats-bar {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 0;
                    background: rgba(255,255,255,0.025);
                    border-top: 1px solid rgba(255,255,255,0.05);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding: 1.25rem 1rem;
                }
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.5rem 2rem;
                    border-right: 1px solid rgba(255,255,255,0.06);
                }
                .stat-item:last-child { border-right: none; }
                @media (max-width: 640px) {
                    .stat-item { padding: 0.5rem 1rem; border-right: none; }
                }
                .stat-icon { font-size: 1.4rem; }
                .stat-value { font-size: 1rem; font-weight: 800; color: #fff; }
                .stat-label { font-size: 0.72rem; color: #64748b; }

                /* ── Horizontal rows ── */
                .rows-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                }
                .movie-row-section { margin: 2.5rem 0 0; }
                .movie-row-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }
                .movie-row-title {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .movie-row-emoji { font-size: 1.1rem; }

                .row-scroll-btns { display: flex; gap: 0.35rem; }
                .row-scroll-btn {
                    width: 32px; height: 32px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.2s, color 0.2s;
                    line-height: 1;
                }
                .row-scroll-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

                .movie-row-track {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    padding-bottom: 0.75rem;
                    scrollbar-width: none;
                }
                .movie-row-track::-webkit-scrollbar { display: none; }

                /* ── Movie card ── */
                .movie-card {
                    flex-shrink: 0;
                    width: 148px;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    cursor: pointer;
                    scroll-snap-align: start;
                    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
                }
                .movie-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
                    border-color: rgba(102,126,234,0.4);
                }
                .movie-card-poster-wrap {
                    position: relative;
                    aspect-ratio: 2/3;
                    overflow: hidden;
                    background: #111;
                }
                .movie-card-poster {
                    width: 100%; height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.4s;
                }
                .movie-card:hover .movie-card-poster { transform: scale(1.06); }
                .movie-card-no-poster {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2.5rem;
                    color: #374151;
                }
                .movie-card-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(10,10,20,0.6);
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0;
                    transition: opacity 0.25s;
                }
                .movie-card:hover .movie-card-overlay { opacity: 1; }
                .movie-card-play-btn {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: #fff;
                    border: none;
                    padding: 0.45rem 0.9rem;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    cursor: pointer;
                }
                .movie-card-rating {
                    position: absolute;
                    top: 0.4rem; right: 0.4rem;
                    background: rgba(0,0,0,0.75);
                    backdrop-filter: blur(4px);
                    color: #fbbf24;
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 0.15rem 0.4rem;
                    border-radius: 4px;
                }
                .movie-card-body { padding: 0.6rem 0.65rem 0.7rem; }
                .movie-card-title {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #e2e8f0;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    line-height: 1.35;
                    margin-bottom: 0.35rem;
                }
                .movie-card-meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.65rem;
                    color: #64748b;
                }
                .movie-card-genre {
                    background: rgba(102,126,234,0.15);
                    color: #818cf8;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    font-weight: 600;
                }

                /* Skeleton card */
                .skeleton-card {
                    flex-shrink: 0;
                    width: 148px;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .skeleton-img {
                    aspect-ratio: 2/3;
                    width: 100%;
                }
                .skeleton-line { border-radius: 0.3rem; }
                .skeleton-shimmer {
                    background: linear-gradient(90deg,
                        rgba(255,255,255,0.04) 25%,
                        rgba(255,255,255,0.09) 50%,
                        rgba(255,255,255,0.04) 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }

                /* ── Browse section ── */
                .browse-section {
                    max-width: 1400px;
                    margin: 3rem auto 0;
                    padding: 0 1.5rem;
                }
                .browse-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                .browse-title {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #fff;
                }
                .browse-search-wrap {
                    position: relative;
                    flex: 1;
                    max-width: 340px;
                    min-width: 200px;
                }
                .browse-search-icon {
                    position: absolute;
                    left: 0.85rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    font-size: 0.9rem;
                    pointer-events: none;
                }
                .browse-search {
                    width: 100%;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 999px;
                    color: #e2e8f0;
                    font-size: 0.88rem;
                    padding: 0.55rem 1rem 0.55rem 2.5rem;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .browse-search:focus {
                    border-color: rgba(102,126,234,0.5);
                    background: rgba(255,255,255,0.09);
                }
                .browse-search::placeholder { color: #4b5563; }

                /* Genre pills */
                .genre-filter-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-bottom: 1.5rem;
                }
                .genre-pill {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.09);
                    color: #94a3b8;
                    font-size: 0.78rem;
                    font-weight: 600;
                    padding: 0.35rem 0.85rem;
                    border-radius: 999px;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }
                .genre-pill:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .genre-pill.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-color: transparent;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(102,126,234,0.35);
                }

                /* Grid */
                .movies-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
                    gap: 1rem;
                }
                @media (max-width: 480px) {
                    .movies-grid { grid-template-columns: repeat(2, 1fr); }
                }

                /* Grid movie card */
                .grid-movie-card {
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    cursor: pointer;
                    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
                }
                .grid-movie-card:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
                    border-color: rgba(102,126,234,0.4);
                }

                /* Pagination */
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin: 2.5rem 0 1rem;
                    flex-wrap: wrap;
                }
                .page-btn {
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8;
                    padding: 0.5rem 1.1rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .page-btn:hover:not(:disabled) {
                    background: rgba(255,255,255,0.12);
                    color: #fff;
                }
                .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .page-indicator {
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 500;
                    min-width: 80px;
                    text-align: center;
                }

                /* Loading / empty */
                .loading-state, .empty-state {
                    text-align: center;
                    padding: 4rem 1rem;
                    color: #4b5563;
                }
                .loading-spinner {
                    width: 40px; height: 40px;
                    border: 3px solid rgba(102,126,234,0.2);
                    border-top-color: #667eea;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .empty-icon { font-size: 3rem; margin-bottom: 0.75rem; }
                .empty-text { font-size: 0.95rem; }

                /* Section divider */
                .section-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(102,126,234,0.2), transparent);
                    margin: 2.5rem 1.5rem 0;
                    max-width: 1400px;
                    margin-left: auto;
                    margin-right: auto;
                }
            `}</style>

            {/* ── Hero ── */}
            {trending.length > 0 && <HeroSpotlight movies={trending} />}

            {/* ── Stats ── */}
            <StatsBar />

            {/* ── Horizontal rows ── */}
            <div className="rows-wrapper">
                <MovieRow
                    title="Trending This Week"
                    emoji="🔥"
                    movies={trending}
                    genres={genres}
                    loading={rowsLoading}
                />
                <MovieRow
                    title="Now Playing"
                    emoji="🎭"
                    movies={nowPlaying}
                    genres={genres}
                    loading={rowsLoading}
                />
                <MovieRow
                    title="Top Rated All Time"
                    emoji="⭐"
                    movies={topRated}
                    genres={genres}
                    loading={rowsLoading}
                />
            </div>

            <div className="section-divider" />

            {/* ── Browse / Discover ── */}
            <div className="browse-section">
                <div className="browse-header">
                    <h2 className="browse-title">🎬 Discover Movies</h2>
                    <div className="browse-search-wrap">
                        <span className="browse-search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search movies..."
                            className="browse-search"
                            value={searchMovie}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <GenreFilter genres={genres} selected={selectedGenre} onSelect={handleGenreSelect} />

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        <p>Finding great movies…</p>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🎞</div>
                        <p className="empty-text">No movies found. Try a different search.</p>
                    </div>
                ) : (
                    <div className="movies-grid">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                className="grid-movie-card"
                                onClick={() => navigate(`/movie/${movie.id}`)}
                            >
                                <div className="movie-card-poster-wrap">
                                    {movie.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                            alt={movie.title}
                                            className="movie-card-poster"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="movie-card-no-poster">🎬</div>
                                    )}
                                    <div className="movie-card-overlay">
                                        <span className="movie-card-play-btn">▶ Details</span>
                                    </div>
                                    <span className="movie-card-rating">★ {movie.vote_average?.toFixed(1)}</span>
                                </div>
                                <div className="movie-card-body">
                                    <h3 className="movie-card-title">{movie.title}</h3>
                                    <div className="movie-card-meta">
                                        <span>{movie.release_date?.slice(0, 4)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && movies.length > 0 && (
                    <div className="pagination">
                        <button
                            className="page-btn"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        >‹ Prev</button>

                        <span className="page-indicator">Page {page} of {totalPages}</span>

                        <button
                            className="page-btn"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >Next ›</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;