import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieDetails, getMovieReviews, getMovieVideos, getMovieImages, getSimilarMovies } from "../api/tmdbApi";

/* ─── Types ──────────────────────────────────────────────── */
interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    genres: { id: number; name: string }[];
    poster_path: string;
    vote_average: number;
    vote_count: number;
    runtime: number;
    tagline: string;
}

interface Review {
    id: string;
    author: string;
    author_details: {
        name: string;
        username: string;
        avatar_path: string | null;
        rating: number | null;
    };
    content: string;
    created_at: string;
    url: string;
}

interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
    published_at: string;
}

interface ImageItem {
    file_path: string;
    width: number;
    height: number;
    aspect_ratio: number;
    vote_average: number;
}

interface SimilarMovie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
}

/* ─── Star Rating ─────────────────────────────────────────── */
const StarRating = ({ rating }: { rating: number | null }) => {
    if (!rating) return null;
    const stars = Math.round(rating / 2);
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < stars ? "text-yellow-400" : "text-gray-600"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="ml-1 text-xs text-gray-400">{rating}/10</span>
        </div>
    );
};

/* ─── Review Card ─────────────────────────────────────────── */
const ReviewCard = ({ review }: { review: Review }) => {
    const [expanded, setExpanded] = useState(false);
    const isLong = review.content.length > 300;
    const displayContent = expanded || !isLong ? review.content : review.content.slice(0, 300) + "...";

    const avatarUrl = review.author_details.avatar_path
        ? review.author_details.avatar_path.startsWith("/https")
            ? review.author_details.avatar_path.slice(1)
            : `https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`
        : null;

    const initials = (review.author_details.name || review.author).split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="review-avatar">
                    {avatarUrl ? <img src={avatarUrl} alt={review.author} className="avatar-img" /> : <span className="avatar-initials">{initials}</span>}
                </div>
                <div className="review-author-info">
                    <span className="review-author-name">{review.author_details.name || review.author}</span>
                    <span className="review-username">@{review.author_details.username || review.author}</span>
                    <StarRating rating={review.author_details.rating} />
                </div>
                <span className="review-date">{formattedDate}</span>
            </div>
            <p className="review-content">{displayContent}</p>
            {isLong && (
                <button className="read-more-btn" onClick={() => setExpanded((p) => !p)}>
                    {expanded ? "Show less ▲" : "Read more ▼"}
                </button>
            )}
        </div>
    );
};

/* ─── Lightbox ───────────────────────────────────────────── */
const Lightbox = ({
    images,
    startIndex,
    onClose,
}: {
    images: ImageItem[];
    startIndex: number;
    onClose: () => void;
}) => {
    const [idx, setIdx] = useState(startIndex);

    const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
    const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") prev();
            else if (e.key === "ArrowRight") next();
            else if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [prev, next, onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    const img = images[idx];

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
                {/* Close */}
                <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>

                {/* Counter */}
                <div className="lightbox-counter">{idx + 1} / {images.length}</div>

                {/* Prev / Next */}
                <button className="lightbox-arrow lightbox-prev" onClick={prev} aria-label="Previous">‹</button>
                <button className="lightbox-arrow lightbox-next" onClick={next} aria-label="Next">›</button>

                {/* Image */}
                <img
                    key={img.file_path}
                    src={`https://image.tmdb.org/t/p/original${img.file_path}`}
                    alt={`Image ${idx + 1}`}
                    className="lightbox-img"
                />

                {/* Thumbnail strip */}
                <div className="lightbox-thumbs">
                    {images.map((im, i) => (
                        <button
                            key={im.file_path}
                            className={`lightbox-thumb-btn${i === idx ? " active" : ""}`}
                            onClick={() => setIdx(i)}
                        >
                            <img src={`https://image.tmdb.org/t/p/w92${im.file_path}`} alt="" className="lightbox-thumb-img" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─── Image Gallery ──────────────────────────────────────── */
const ImageGallery = ({ backdrops, posters }: { backdrops: ImageItem[]; posters: ImageItem[] }) => {
    const [tab, setTab] = useState<"backdrops" | "posters">("backdrops");
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);

    const activeImages = tab === "backdrops" ? backdrops : posters;
    const LIMIT = 12;
    const displayed = showAll ? activeImages : activeImages.slice(0, LIMIT);

    if (backdrops.length === 0 && posters.length === 0) return null;

    const handleTabChange = (t: "backdrops" | "posters") => { setTab(t); setShowAll(false); };

    return (
        <div className="gallery-section">
            {/* Header + tabs */}
            <div className="gallery-header">
                <h2 className="section-heading">
                    <span>📸 Image Gallery</span>
                    <span className="section-badge">{activeImages.length}</span>
                </h2>
                <div className="gallery-tabs">
                    <button
                        className={`gallery-tab${tab === "backdrops" ? " active" : ""}`}
                        onClick={() => handleTabChange("backdrops")}
                    >
                        Backdrops <span className="gallery-tab-count">{backdrops.length}</span>
                    </button>
                    <button
                        className={`gallery-tab${tab === "posters" ? " active" : ""}`}
                        onClick={() => handleTabChange("posters")}
                    >
                        Posters <span className="gallery-tab-count">{posters.length}</span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className={`gallery-grid ${tab === "posters" ? "poster-grid" : "backdrop-grid"}`}>
                {displayed.map((img, i) => (
                    <button
                        key={img.file_path}
                        className="gallery-item"
                        onClick={() => setLightboxIdx(i)}
                        aria-label={`View image ${i + 1}`}
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/${tab === "backdrops" ? "w500" : "w342"}${img.file_path}`}
                            alt={`${tab} ${i + 1}`}
                            className="gallery-img"
                            loading="lazy"
                        />
                        <div className="gallery-item-overlay">
                            <span className="gallery-zoom-icon">🔍</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Show more */}
            {activeImages.length > LIMIT && (
                <button className="gallery-show-more" onClick={() => setShowAll((p) => !p)}>
                    {showAll ? `Show less ▲` : `Show all ${activeImages.length} ${tab} ▼`}
                </button>
            )}

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <Lightbox
                    images={activeImages}
                    startIndex={lightboxIdx}
                    onClose={() => setLightboxIdx(null)}
                />
            )}
        </div>
    );
};

/* ─── Similar Movies ────────────────────────────────────── */
const SimilarMovies = ({
    movies,
    loading,
    onSelect,
}: {
    movies: SimilarMovie[];
    loading: boolean;
    onSelect: (id: number) => void;
}) => {
    if (!loading && movies.length === 0) return null;

    return (
        <div className="similar-section">
            <h2 className="section-heading">
                <span>🎥 More Like This</span>
                {!loading && movies.length > 0 && (
                    <span className="section-badge">{movies.length}</span>
                )}
            </h2>

            <div className="similar-track">
                {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="similar-card-skeleton">
                            <div className="similar-skeleton-img skeleton-line" />
                            <div style={{ padding: "0.6rem" }}>
                                <div className="skeleton-line" style={{ height: 11, width: "80%", marginBottom: "0.4rem" }} />
                                <div className="skeleton-line" style={{ height: 9, width: "50%" }} />
                            </div>
                        </div>
                    ))
                    : movies.map((m) => (
                        <button
                            key={m.id}
                            className="similar-card"
                            onClick={() => onSelect(m.id)}
                            title={m.title}
                        >
                            <div className="similar-poster-wrap">
                                {m.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                                        alt={m.title}
                                        className="similar-poster"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="similar-no-poster">🎬</div>
                                )}
                                <div className="similar-overlay">
                                    <span className="similar-play">▶</span>
                                </div>
                                <span className="similar-rating">★ {m.vote_average?.toFixed(1)}</span>
                            </div>
                            <div className="similar-meta">
                                <span className="similar-title">{m.title}</span>
                                <span className="similar-year">{m.release_date?.slice(0, 4)}</span>
                            </div>
                        </button>
                    ))}
            </div>
        </div>
    );
};

/* ─── Video Player Section ────────────────────────────────── */
const VideoSection = ({ videos }: { videos: Video[] }) => {
    const youtubeVideos = videos.filter((v) => v.site === "YouTube");
    const [activeIdx, setActiveIdx] = useState(0);
    if (youtubeVideos.length === 0) return null;

    const active = youtubeVideos[activeIdx];
    const typeIcon: Record<string, string> = { Trailer: "🎬", Teaser: "🎞", Clip: "📽", Featurette: "🎥", "Behind the Scenes": "🎭", Bloopers: "😂" };

    return (
        <div className="video-section">
            <h2 className="section-heading">
                <span>Videos</span>
                <span className="section-badge">{youtubeVideos.length}</span>
            </h2>
            <div className="video-player-wrapper">
                <iframe key={active.key} className="video-player-iframe"
                    src={`https://www.youtube.com/embed/${active.key}?rel=0&modestbranding=1`}
                    title={active.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen />
            </div>
            <div className="video-active-label">
                <span className="video-type-chip">{typeIcon[active.type] ?? "▶"} {active.type}</span>
                <span className="video-active-name">{active.name}</span>
            </div>
            {youtubeVideos.length > 1 && (
                <div className="video-strip">
                    {youtubeVideos.map((v, i) => (
                        <button key={v.id} className={`video-thumb-btn${i === activeIdx ? " active" : ""}`} onClick={() => setActiveIdx(i)} title={v.name}>
                            <img src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`} alt={v.name} className="video-thumb-img" />
                            <div className="video-thumb-overlay"><span className="video-thumb-play">▶</span></div>
                            <div className="video-thumb-meta">
                                <span className="video-thumb-type">{typeIcon[v.type] ?? "▶"} {v.type}</span>
                                <span className="video-thumb-name">{v.name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ─── Main Component ─────────────────────────────────────── */
const MovieDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [videos, setVideos] = useState<Video[]>([]);
    const [backdrops, setBackdrops] = useState<ImageItem[]>([]);
    const [posters, setPosters] = useState<ImageItem[]>([]);
    const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([]);
    const [similarLoading, setSimilarLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        window.scrollTo({ top: 0, behavior: "smooth" });

        getMovieDetails(Number(id)).then((data) => setMovieDetails(data));

        setReviewsLoading(true);
        getMovieReviews(Number(id))
            .then((data) => setReviews(data.results))
            .finally(() => setReviewsLoading(false));

        getMovieVideos(Number(id)).then((data) => {
            const sorted = [...data.results].sort((a: Video, b: Video) => {
                const priority = (v: Video) =>
                    v.official && v.type === "Trailer" ? 0
                    : v.type === "Trailer" ? 1
                    : v.type === "Teaser" ? 2
                    : 3;
                return priority(a) - priority(b);
            });
            setVideos(sorted);
        });

        getMovieImages(Number(id)).then((data) => {
            // Sort by vote_average descending so best images show first
            const sortByVote = (arr: ImageItem[]) =>
                [...arr].sort((a, b) => b.vote_average - a.vote_average);
            setBackdrops(sortByVote(data.backdrops ?? []));
            setPosters(sortByVote(data.posters ?? []));
        });

        setSimilarLoading(true);
        getSimilarMovies(Number(id))
            .then((data) => setSimilarMovies(data.results ?? []))
            .finally(() => setSimilarLoading(false));
    }, [id]);

    const handleSimilarSelect = (movieId: number) => {
        navigate(`/movie/${movieId}`);
    };

    return (
        <div className="details-page">
            <style>{`
                /* ── Page ── */
                .details-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%);
                    padding: 2.5rem 1rem 4rem;
                    font-family: 'Inter', sans-serif;
                }
                .details-container { max-width: 960px; margin: 0 auto; }

                /* ── Back btn ── */
                .details-back-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    color: #a0aec0; background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.45rem 1.1rem; border-radius: 999px;
                    font-size: 0.85rem; cursor: pointer; margin-bottom: 1.75rem;
                    transition: background 0.2s, color 0.2s;
                }
                .details-back-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }

                /* ── Hero card ── */
                .details-hero {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1.25rem; padding: 2rem;
                    display: grid; grid-template-columns: 200px 1fr; gap: 2rem;
                    backdrop-filter: blur(12px); margin-bottom: 2rem;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.4);
                }
                @media (max-width: 600px) {
                    .details-hero { grid-template-columns: 1fr; text-align: center; }
                    .genres-row, .meta-row { justify-content: center; }
                    .details-poster { max-width: 180px; margin: 0 auto; }
                }
                .details-poster {
                    width: 100%; border-radius: 0.75rem; object-fit: cover;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border: 2px solid rgba(255,255,255,0.08); display: block;
                }
                .details-title {
                    font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 800;
                    color: #fff; margin-bottom: 0.25rem; line-height: 1.25;
                }
                .details-tagline { color: #7f8ea3; font-style: italic; font-size: 0.88rem; margin-bottom: 0.85rem; }
                .genres-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
                .genre-badge {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: #fff; font-size: 0.72rem; font-weight: 600;
                    padding: 0.25rem 0.75rem; border-radius: 999px;
                }
                .meta-row { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; font-size: 0.82rem; color: #94a3b8; }
                .score-circle {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: rgba(34,197,94,0.15); border: 1.5px solid rgba(34,197,94,0.4);
                    color: #4ade80; font-size: 0.82rem; font-weight: 700;
                    padding: 0.3rem 0.75rem; border-radius: 999px;
                }
                .overview-heading { font-size: 1rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.4rem; margin-top: 0.5rem; }
                .overview-text { color: #94a3b8; font-size: 0.9rem; line-height: 1.75; }

                /* ── Shared section ── */
                .section-heading {
                    font-size: 1.35rem; font-weight: 800; color: #fff;
                    margin-bottom: 1.1rem; display: flex; align-items: center; gap: 0.6rem;
                }
                .section-badge {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: #fff; font-size: 0.72rem; font-weight: 700;
                    padding: 0.2rem 0.6rem; border-radius: 999px;
                }

                /* ════════════════════════════════
                   IMAGE GALLERY
                ════════════════════════════════ */
                .gallery-section { margin-bottom: 2.5rem; }

                .gallery-header {
                    display: flex; align-items: flex-start;
                    justify-content: space-between; flex-wrap: wrap;
                    gap: 0.75rem; margin-bottom: 1rem;
                }
                .gallery-header .section-heading { margin-bottom: 0; }

                .gallery-tabs { display: flex; gap: 0.35rem; }
                .gallery-tab {
                    display: flex; align-items: center; gap: 0.4rem;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8; font-size: 0.8rem; font-weight: 600;
                    padding: 0.4rem 0.9rem; border-radius: 999px;
                    cursor: pointer; transition: all 0.2s; white-space: nowrap;
                    font-family: 'Inter', sans-serif;
                }
                .gallery-tab:hover { background: rgba(255,255,255,0.11); color: #fff; }
                .gallery-tab.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-color: transparent; color: #fff;
                    box-shadow: 0 4px 12px rgba(102,126,234,0.35);
                }
                .gallery-tab-count {
                    background: rgba(255,255,255,0.15);
                    font-size: 0.68rem; padding: 0.1rem 0.4rem;
                    border-radius: 999px; font-weight: 700;
                }
                .gallery-tab.active .gallery-tab-count { background: rgba(255,255,255,0.25); }

                /* Backdrop grid: 16:9 wide tiles */
                .backdrop-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 0.65rem;
                }
                @media (max-width: 600px) { .backdrop-grid { grid-template-columns: repeat(2, 1fr); } }

                /* Poster grid: 2:3 portrait tiles */
                .poster-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
                    gap: 0.65rem;
                }
                @media (max-width: 480px) { .poster-grid { grid-template-columns: repeat(3, 1fr); } }

                .gallery-item {
                    position: relative; overflow: hidden;
                    border-radius: 0.6rem; border: 1.5px solid transparent;
                    cursor: pointer; padding: 0; background: #111;
                    transition: border-color 0.22s, transform 0.22s, box-shadow 0.22s;
                }
                .gallery-item:hover {
                    border-color: rgba(102,126,234,0.55);
                    transform: scale(1.025);
                    box-shadow: 0 10px 32px rgba(0,0,0,0.5);
                }

                .backdrop-grid .gallery-img {
                    width: 100%; aspect-ratio: 16/9;
                    object-fit: cover; display: block;
                    transition: transform 0.35s;
                }
                .poster-grid .gallery-img {
                    width: 100%; aspect-ratio: 2/3;
                    object-fit: cover; display: block;
                    transition: transform 0.35s;
                }
                .gallery-item:hover .gallery-img { transform: scale(1.06); }

                .gallery-item-overlay {
                    position: absolute; inset: 0;
                    background: rgba(10,10,20,0.55);
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: opacity 0.22s;
                }
                .gallery-item:hover .gallery-item-overlay { opacity: 1; }
                .gallery-zoom-icon { font-size: 1.5rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.7)); }

                .gallery-show-more {
                    display: block; width: 100%; margin-top: 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8; font-size: 0.85rem; font-weight: 600;
                    padding: 0.7rem; border-radius: 0.75rem; cursor: pointer;
                    transition: background 0.2s, color 0.2s; font-family: 'Inter', sans-serif;
                }
                .gallery-show-more:hover { background: rgba(255,255,255,0.1); color: #fff; }

                /* ════════════════════════════════
                   LIGHTBOX
                ════════════════════════════════ */
                .lightbox-overlay {
                    position: fixed; inset: 0; z-index: 1000;
                    background: rgba(0,0,0,0.92);
                    backdrop-filter: blur(10px);
                    display: flex; align-items: center; justify-content: center;
                    animation: lbFade 0.2s ease;
                }
                @keyframes lbFade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                .lightbox-inner {
                    position: relative;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    width: 100%; height: 100%;
                    padding: 3rem 1rem 5.5rem;
                    max-width: 1200px; margin: 0 auto;
                }

                .lightbox-close {
                    position: fixed; top: 1rem; right: 1rem;
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff; font-size: 1rem; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.2s;
                    z-index: 10;
                }
                .lightbox-close:hover { background: rgba(255,255,255,0.2); }

                .lightbox-counter {
                    position: fixed; top: 1.15rem; left: 50%;
                    transform: translateX(-50%);
                    color: #94a3b8; font-size: 0.82rem; font-weight: 600;
                    background: rgba(0,0,0,0.5); padding: 0.3rem 0.8rem;
                    border-radius: 999px; z-index: 10;
                }

                .lightbox-arrow {
                    position: fixed; top: 50%; transform: translateY(-50%);
                    width: 44px; height: 44px; border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff; font-size: 1.5rem; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.2s; z-index: 10;
                    line-height: 1;
                }
                .lightbox-arrow:hover { background: rgba(255,255,255,0.22); }
                .lightbox-prev { left: 1rem; }
                .lightbox-next { right: 1rem; }
                @media (max-width: 480px) {
                    .lightbox-prev { left: 0.4rem; }
                    .lightbox-next { right: 0.4rem; }
                }

                .lightbox-img {
                    max-width: 100%; max-height: calc(100vh - 160px);
                    object-fit: contain; border-radius: 0.5rem;
                    box-shadow: 0 20px 80px rgba(0,0,0,0.8);
                    animation: lbImgIn 0.25s ease;
                }
                @keyframes lbImgIn {
                    from { opacity: 0; transform: scale(0.97); }
                    to   { opacity: 1; transform: scale(1); }
                }

                /* Lightbox thumbs strip */
                .lightbox-thumbs {
                    position: fixed; bottom: 0; left: 0; right: 0;
                    display: flex; gap: 0.4rem; overflow-x: auto;
                    padding: 0.6rem 1rem; background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(8px); scrollbar-width: none;
                    z-index: 10;
                }
                .lightbox-thumbs::-webkit-scrollbar { display: none; }
                .lightbox-thumb-btn {
                    flex-shrink: 0; width: 56px; height: 40px;
                    border-radius: 4px; overflow: hidden;
                    border: 2px solid transparent; cursor: pointer; padding: 0;
                    opacity: 0.5; transition: opacity 0.2s, border-color 0.2s;
                }
                .lightbox-thumb-btn.active {
                    border-color: #a78bfa; opacity: 1;
                }
                .lightbox-thumb-btn:hover { opacity: 0.85; }
                .lightbox-thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }

                /* ── Video section ── */
                .video-section { margin-bottom: 2.5rem; }
                .video-player-wrapper {
                    position: relative; width: 100%; padding-bottom: 56.25%;
                    border-radius: 1rem; overflow: hidden; background: #000;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                    border: 1px solid rgba(255,255,255,0.08); margin-bottom: 0.85rem;
                }
                .video-player-iframe {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    border: none; border-radius: 1rem;
                }
                .video-active-label { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap; }
                .video-type-chip {
                    background: rgba(102,126,234,0.2); border: 1px solid rgba(102,126,234,0.35);
                    color: #a5b4fc; font-size: 0.75rem; font-weight: 600;
                    padding: 0.2rem 0.65rem; border-radius: 999px; white-space: nowrap;
                }
                .video-active-name { color: #cbd5e1; font-size: 0.88rem; font-weight: 500; }
                .video-strip { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.65rem; }
                @media (max-width: 480px) { .video-strip { grid-template-columns: repeat(2, 1fr); } }
                .video-thumb-btn {
                    position: relative; border-radius: 0.6rem; overflow: hidden;
                    background: #000; border: 2px solid transparent; cursor: pointer; padding: 0;
                    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; text-align: left;
                }
                .video-thumb-btn:hover { border-color: rgba(102,126,234,0.6); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.2); }
                .video-thumb-btn.active { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.25); }
                .video-thumb-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; }
                .video-thumb-overlay {
                    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                    background: rgba(0,0,0,0.35); transition: background 0.2s;
                }
                .video-thumb-btn:hover .video-thumb-overlay, .video-thumb-btn.active .video-thumb-overlay { background: rgba(102,126,234,0.3); }
                .video-thumb-play { font-size: 1.4rem; color: #fff; opacity: 0.85; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
                .video-thumb-meta { padding: 0.4rem 0.5rem 0.5rem; display: flex; flex-direction: column; gap: 0.15rem; }
                .video-thumb-type { font-size: 0.65rem; color: #a5b4fc; font-weight: 600; }
                .video-thumb-name { font-size: 0.72rem; color: #94a3b8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }

                /* ── Reviews ── */
                .reviews-section { margin-top: 0; }
                .reviews-list { display: flex; flex-direction: column; gap: 1.1rem; }
                .review-card {
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 1rem; padding: 1.25rem 1.5rem;
                    backdrop-filter: blur(8px); transition: border-color 0.2s, box-shadow 0.2s;
                }
                .review-card:hover { border-color: rgba(102,126,234,0.4); box-shadow: 0 4px 24px rgba(102,126,234,0.1); }
                .review-header { display: flex; align-items: flex-start; gap: 0.85rem; margin-bottom: 0.85rem; flex-wrap: wrap; }
                .review-avatar {
                    width: 44px; height: 44px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex; align-items: center; justify-content: center;
                }
                .avatar-img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-initials { color: #fff; font-weight: 700; font-size: 0.85rem; }
                .review-author-info { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
                .review-author-name { color: #e2e8f0; font-weight: 700; font-size: 0.9rem; }
                .review-username { color: #64748b; font-size: 0.78rem; }
                .review-date { color: #4b5563; font-size: 0.75rem; white-space: nowrap; margin-left: auto; padding-top: 0.1rem; }
                .review-content { color: #94a3b8; font-size: 0.875rem; line-height: 1.75; white-space: pre-line; }
                .read-more-btn { margin-top: 0.6rem; background: none; border: none; color: #667eea; font-size: 0.8rem; font-weight: 600; cursor: pointer; padding: 0; transition: color 0.2s; }
                .read-more-btn:hover { color: #a78bfa; }

                /* Skeleton */
                .skeleton-review {
                    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 1rem; padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.7rem;
                }
                .skeleton-line {
                    background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 75%);
                    background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 0.4rem;
                }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .no-reviews { text-align: center; padding: 3rem 1rem; color: #4b5563; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08); border-radius: 1rem; }
                .no-reviews-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
                .no-reviews-text { font-size: 0.9rem; }

                /* ════════════════════════════════
                   SIMILAR MOVIES
                ════════════════════════════════ */
                .similar-section {
                    margin-top: 2.5rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }

                .similar-track {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    padding-bottom: 0.75rem;
                    scrollbar-width: none;
                }
                .similar-track::-webkit-scrollbar { display: none; }

                .similar-card {
                    flex-shrink: 0;
                    width: 140px;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    background: rgba(255,255,255,0.04);
                    border: 1.5px solid transparent;
                    cursor: pointer;
                    padding: 0;
                    scroll-snap-align: start;
                    text-align: left;
                    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
                    font-family: 'Inter', sans-serif;
                }
                .similar-card:hover {
                    transform: translateY(-5px) scale(1.025);
                    box-shadow: 0 16px 40px rgba(0,0,0,0.55);
                    border-color: rgba(167,139,250,0.5);
                }

                .similar-poster-wrap {
                    position: relative;
                    aspect-ratio: 2/3;
                    overflow: hidden;
                    background: #111;
                }
                .similar-poster {
                    width: 100%; height: 100%;
                    object-fit: cover; display: block;
                    transition: transform 0.35s;
                }
                .similar-card:hover .similar-poster { transform: scale(1.07); }
                .similar-no-poster {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2rem; color: #374151;
                }
                .similar-overlay {
                    position: absolute; inset: 0;
                    background: rgba(10,10,20,0.6);
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: opacity 0.25s;
                }
                .similar-card:hover .similar-overlay { opacity: 1; }
                .similar-play {
                    font-size: 1.6rem; color: #fff;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.6);
                }
                .similar-rating {
                    position: absolute; top: 0.4rem; right: 0.4rem;
                    background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
                    color: #fbbf24; font-size: 0.67rem; font-weight: 700;
                    padding: 0.15rem 0.4rem; border-radius: 4px;
                }
                .similar-meta {
                    padding: 0.55rem 0.6rem 0.65rem;
                    display: flex; flex-direction: column; gap: 0.2rem;
                }
                .similar-title {
                    font-size: 0.76rem; font-weight: 700; color: #e2e8f0;
                    overflow: hidden; display: -webkit-box;
                    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    line-height: 1.35;
                }
                .similar-year {
                    font-size: 0.68rem; color: #64748b;
                }

                /* skeleton card */
                .similar-card-skeleton {
                    flex-shrink: 0; width: 140px;
                    border-radius: 0.75rem; overflow: hidden;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .similar-skeleton-img {
                    width: 100%; aspect-ratio: 2/3;
                }
            `}</style>

            <div className="details-container">
                <button className="details-back-btn" onClick={() => navigate(-1)}>← Back</button>

                {/* ── Hero ── */}
                <div className="details-hero">
                    <img src={`https://image.tmdb.org/t/p/w500${movieDetails?.poster_path}`} alt={movieDetails?.title} className="details-poster" />
                    <div>
                        <h1 className="details-title">{movieDetails?.title}</h1>
                        {movieDetails?.tagline && <p className="details-tagline">"{movieDetails.tagline}"</p>}
                        <div className="genres-row">
                            {movieDetails?.genres.map((genre) => (
                                <span key={genre.id} className="genre-badge">{genre.name}</span>
                            ))}
                        </div>
                        <div className="meta-row">
                            <span className="score-circle">★ {movieDetails?.vote_average.toFixed(1)} / 10</span>
                            <span>📅 {movieDetails?.release_date}</span>
                            {movieDetails?.runtime && <span>⏱ {movieDetails.runtime} min</span>}
                            <span>🗳 {movieDetails?.vote_count?.toLocaleString()} votes</span>
                        </div>
                        <p className="overview-heading">Overview</p>
                        <p className="overview-text">{movieDetails?.overview || "No overview available."}</p>
                    </div>
                </div>

                {/* ── Image Gallery (above Videos) ── */}
                <ImageGallery backdrops={backdrops} posters={posters} />

                {/* ── Videos ── */}
                {videos.length > 0 && <VideoSection videos={videos} />}

                {/* ── Reviews ── */}
                <div className="reviews-section">
                    <h2 className="section-heading">
                        Reviews
                        {!reviewsLoading && reviews.length > 0 && <span className="section-badge">{reviews.length}</span>}
                    </h2>
                    {reviewsLoading ? (
                        <div className="reviews-list">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="skeleton-review">
                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                                        <div className="skeleton-line" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                            <div className="skeleton-line" style={{ height: 12, width: "40%" }} />
                                            <div className="skeleton-line" style={{ height: 10, width: "25%" }} />
                                        </div>
                                    </div>
                                    <div className="skeleton-line" style={{ height: 11, width: "100%" }} />
                                    <div className="skeleton-line" style={{ height: 11, width: "85%" }} />
                                    <div className="skeleton-line" style={{ height: 11, width: "70%" }} />
                                </div>
                            ))}
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="no-reviews">
                            <div className="no-reviews-icon">🎬</div>
                            <p className="no-reviews-text">No reviews yet for this movie.</p>
                        </div>
                    ) : (
                        <div className="reviews-list">
                            {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
                        </div>
                    )}
                </div>

                {/* ── Similar Movies ── */}
                <SimilarMovies
                    movies={similarMovies}
                    loading={similarLoading}
                    onSelect={handleSimilarSelect}
                />
            </div>
        </div>
    );
};

export default MovieDetails;