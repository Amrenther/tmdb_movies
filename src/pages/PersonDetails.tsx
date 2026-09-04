import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPersonDetails, getPersonMovieCredits, getPersonImages } from "../api/tmdbApi";
import { useMovieList } from "../context/MovieListContext";

/* ─── Types ──────────────────────────────────────────────── */
interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null;
    known_for_department: string;
    also_known_as: string[];
    imdb_id: string | null;
    homepage: string | null;
    popularity: number;
}

interface PersonMovieCredit {
    id: number;
    title: string;
    character?: string;
    job?: string;
    department?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    overview: string;
}

interface PersonImage {
    file_path: string;
    aspect_ratio: number;
    width: number;
    height: number;
}

/* ─── Calculate Age Helper ───────────────────────────────── */
function calculateAge(birthday: string, deathday: string | null): number {
    const birthDate = new Date(birthday);
    const endDate = deathday ? new Date(deathday) : new Date();
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const m = endDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const PersonDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toggleFavorite, isFavorite, toggleWatchlist, isInWatchlist } = useMovieList();

    const [person, setPerson] = useState<PersonDetails | null>(null);
    const [castCredits, setCastCredits] = useState<PersonMovieCredit[]>([]);
    const [crewCredits, setCrewCredits] = useState<PersonMovieCredit[]>([]);
    const [images, setImages] = useState<PersonImage[]>([]);
    const [loadingPersonId, setLoadingPersonId] = useState<number | null>(null);

    const [bioExpanded, setBioExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"popularity" | "date" | "rating">("popularity");

    const loading = !person || loadingPersonId !== Number(id);

    useEffect(() => {
        if (!id) return;
        window.scrollTo({ top: 0, behavior: "smooth" });

        const personId = Number(id);

        Promise.all([
            getPersonDetails(personId),
            getPersonMovieCredits(personId),
            getPersonImages(personId).catch(() => ({ profiles: [] })),
        ])
            .then(([detailsData, creditsData, imagesData]) => {
                setPerson(detailsData);
                setLoadingPersonId(personId);

                // Deduplicate movies if actor played multiple characters
                const uniqueCast: PersonMovieCredit[] = [];
                const seenCastIds = new Set<number>();
                (creditsData.cast || []).forEach((item: PersonMovieCredit) => {
                    if (!seenCastIds.has(item.id)) {
                        seenCastIds.add(item.id);
                        uniqueCast.push(item);
                    }
                });
                setCastCredits(uniqueCast);

                const uniqueCrew: PersonMovieCredit[] = [];
                const seenCrewKeys = new Set<string>();
                (creditsData.crew || []).forEach((item: PersonMovieCredit) => {
                    const key = `${item.id}-${item.job}`;
                    if (!seenCrewKeys.has(key)) {
                        seenCrewKeys.add(key);
                        uniqueCrew.push(item);
                    }
                });
                setCrewCredits(uniqueCrew);

                // If person is known primarily for Directing/Production and has no cast credits, default to crew tab
                if (uniqueCast.length === 0 && uniqueCrew.length > 0) {
                    setActiveTab("crew");
                }

                setImages(imagesData.profiles || []);
            })
            .catch((err) => console.error("Failed to load person data", err));
    }, [id]);

    // Top "Known For" Highlights (Top 8 by popularity)
    const knownForMovies = useMemo(() => {
        const pool = [...castCredits, ...crewCredits];
        const map = new Map<number, PersonMovieCredit>();
        pool.forEach((m) => {
            if (!map.has(m.id)) map.set(m.id, m);
        });
        return Array.from(map.values())
            .filter((m) => m.poster_path && m.vote_count > 10)
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 10);
    }, [castCredits, crewCredits]);

    // Filtered and Sorted Filmography
    const currentList = activeTab === "cast" ? castCredits : crewCredits;
    const filteredCredits = useMemo(() => {
        let list = [...currentList];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (m) =>
                    m.title.toLowerCase().includes(q) ||
                    (m.character && m.character.toLowerCase().includes(q)) ||
                    (m.job && m.job.toLowerCase().includes(q))
            );
        }

        list.sort((a, b) => {
            if (sortBy === "popularity") {
                return (b.popularity || 0) - (a.popularity || 0);
            }
            if (sortBy === "rating") {
                return (b.vote_average || 0) - (a.vote_average || 0);
            }
            if (sortBy === "date") {
                const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
                const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
                return dateB - dateA;
            }
            return 0;
        });

        return list;
    }, [currentList, searchQuery, sortBy]);

    if (loading) {
        return (
            <div className="person-loading-root">
                <style>{`
                    .person-loading-root {
                        min-height: 100vh;
                        background: linear-gradient(135deg, #0f0c29 0%, #302b63 55%, #24243e 100%);
                        padding: 3rem 1.5rem;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        color: #94a3b8;
                        font-family: 'Inter', sans-serif;
                    }
                    .person-spinner {
                        width: 44px;
                        height: 44px;
                        border: 3px solid rgba(255,255,255,0.1);
                        border-top-color: #a78bfa;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <div className="person-spinner" />
                    <p>Loading person profile...</p>
                </div>
            </div>
        );
    }

    if (!person) {
        return (
            <div style={{ padding: "5rem 2rem", textAlign: "center", color: "#e2e8f0" }}>
                <h2>Person not found</h2>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        marginTop: "1rem",
                        padding: "0.5rem 1.2rem",
                        background: "#667eea",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                    }}
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;
    const isBioLong = (person.biography || "").length > 450;
    const displayedBio =
        bioExpanded || !isBioLong
            ? person.biography
            : person.biography.slice(0, 450) + "...";

    return (
        <div className="person-page">
            <style>{`
                .person-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0b091a 0%, #1a1635 45%, #16122c 100%);
                    color: #e2e8f0;
                    padding: 2.5rem 1.5rem 5rem;
                    font-family: 'Inter', sans-serif;
                }
                .person-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .person-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.07);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: #cbd5e1;
                    padding: 0.5rem 1.1rem;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 2rem;
                    transition: all 0.2s;
                    backdrop-filter: blur(8px);
                }
                .person-back-btn:hover {
                    background: rgba(255, 255, 255, 0.14);
                    color: #fff;
                    transform: translateX(-3px);
                }

                /* ── Hero Profile ── */
                .person-hero {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 2.5rem;
                    background: rgba(255, 255, 255, 0.035);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    backdrop-filter: blur(16px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
                    margin-bottom: 3rem;
                }
                @media (max-width: 820px) {
                    .person-hero {
                        grid-template-columns: 1fr;
                        gap: 1.75rem;
                        padding: 1.5rem;
                    }
                }

                .person-poster-wrap {
                    position: relative;
                    border-radius: 1.25rem;
                    overflow: hidden;
                    aspect-ratio: 2/3;
                    background: #151329;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    max-width: 280px;
                    margin: 0 auto;
                    width: 100%;
                }
                .person-poster {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .person-no-poster {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4.5rem;
                    color: #475569;
                }

                .person-header-info {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .person-name {
                    font-size: 2.3rem;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    margin-bottom: 0.5rem;
                    line-height: 1.15;
                }
                @media (max-width: 640px) {
                    .person-name { font-size: 1.85rem; }
                }

                .person-dept-badge {
                    display: inline-block;
                    align-self: flex-start;
                    background: linear-gradient(135deg, rgba(102, 126, 234, 0.25), rgba(118, 75, 162, 0.25));
                    border: 1px solid rgba(167, 139, 250, 0.4);
                    color: #c4b5fd;
                    font-size: 0.8rem;
                    font-weight: 700;
                    padding: 0.25rem 0.85rem;
                    border-radius: 999px;
                    margin-bottom: 1.25rem;
                }

                /* Quick Stats Grid */
                .person-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 0.85rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 1rem;
                }
                .stat-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                .stat-label {
                    font-size: 0.72rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 0.03em;
                }
                .stat-value {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: #f1f5f9;
                }

                /* Biography */
                .person-bio-section {
                    margin-top: 0.5rem;
                }
                .person-bio-heading {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #a78bfa;
                    margin-bottom: 0.4rem;
                }
                .person-bio-text {
                    font-size: 0.92rem;
                    line-height: 1.65;
                    color: #cbd5e1;
                    white-space: pre-line;
                }
                .bio-toggle-btn {
                    background: none;
                    border: none;
                    color: #818cf8;
                    font-weight: 700;
                    font-size: 0.82rem;
                    cursor: pointer;
                    margin-top: 0.4rem;
                    padding: 0;
                    display: inline-block;
                }
                .bio-toggle-btn:hover {
                    color: #a5b4fc;
                    text-decoration: underline;
                }

                .person-links {
                    display: flex;
                    gap: 0.6rem;
                    margin-top: 1.25rem;
                }
                .imdb-link-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #f5c518;
                    color: #000;
                    font-size: 0.8rem;
                    font-weight: 800;
                    padding: 0.35rem 0.85rem;
                    border-radius: 6px;
                    text-decoration: none;
                    transition: transform 0.2s, opacity 0.2s;
                }
                .imdb-link-btn:hover {
                    transform: scale(1.04);
                    opacity: 0.92;
                }

                /* ── Section Headings ── */
                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.25rem;
                }
                .section-title {
                    font-size: 1.45rem;
                    font-weight: 800;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                .section-count {
                    font-size: 0.75rem;
                    background: rgba(167, 139, 250, 0.2);
                    color: #c4b5fd;
                    border: 1px solid rgba(167, 139, 250, 0.4);
                    padding: 0.15rem 0.6rem;
                    border-radius: 999px;
                    font-weight: 700;
                }

                /* ── Known For Row ── */
                .known-for-track {
                    display: flex;
                    gap: 0.85rem;
                    overflow-x: auto;
                    padding-bottom: 0.8rem;
                    margin-bottom: 3.5rem;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
                }
                .known-for-card {
                    flex-shrink: 0;
                    width: 145px;
                    border-radius: 0.85rem;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    cursor: pointer;
                    transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
                }
                .known-for-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(102, 126, 234, 0.5);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
                }
                .known-for-poster {
                    width: 100%;
                    aspect-ratio: 2/3;
                    object-fit: cover;
                    display: block;
                }
                .known-for-body {
                    padding: 0.55rem 0.65rem;
                }
                .known-for-title {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #f1f5f9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .known-for-rating {
                    font-size: 0.72rem;
                    color: #fbbf24;
                    font-weight: 700;
                    margin-top: 0.15rem;
                }

                /* ── Filmography Controls ── */
                .film-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    padding: 0.75rem 1rem;
                    border-radius: 1rem;
                }
                .film-tabs {
                    display: flex;
                    gap: 0.5rem;
                }
                .film-tab-btn {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #94a3b8;
                    font-size: 0.85rem;
                    font-weight: 600;
                    padding: 0.45rem 1rem;
                    border-radius: 999px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .film-tab-btn.active {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-color: transparent;
                    color: #ffffff;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                }
                .film-tab-btn:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }

                .film-filters {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                }
                .film-search-input {
                    background: rgba(0, 0, 0, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #f1f5f9;
                    padding: 0.45rem 0.85rem;
                    border-radius: 8px;
                    font-size: 0.82rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .film-search-input:focus {
                    border-color: #818cf8;
                }
                .film-sort-select {
                    background: #1e1b38;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #f1f5f9;
                    padding: 0.45rem 0.85rem;
                    border-radius: 8px;
                    font-size: 0.82rem;
                    outline: none;
                    cursor: pointer;
                }

                /* ── Filmography Grid ── */
                .film-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
                    gap: 1.25rem;
                }
                @media (max-width: 640px) {
                    .film-grid {
                        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                        gap: 0.85rem;
                    }
                }

                .movie-item-card {
                    position: relative;
                    border-radius: 1rem;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.035);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    cursor: pointer;
                    transition: transform 0.22s, border-color 0.22s, box-shadow 0.22s;
                    display: flex;
                    flex-direction: column;
                }
                .movie-item-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(167, 139, 250, 0.5);
                    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.6);
                }
                .movie-item-poster-wrap {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 2/3;
                    background: #141224;
                    overflow: hidden;
                }
                .movie-item-poster {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.35s;
                }
                .movie-item-card:hover .movie-item-poster {
                    transform: scale(1.05);
                }
                .movie-item-no-poster {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.5rem;
                    color: #475569;
                }

                .movie-item-rating {
                    position: absolute;
                    top: 0.45rem;
                    right: 0.45rem;
                    background: rgba(0, 0, 0, 0.78);
                    backdrop-filter: blur(4px);
                    color: #fbbf24;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.15rem 0.45rem;
                    border-radius: 4px;
                }

                .movie-item-actions {
                    position: absolute;
                    top: 0.45rem;
                    left: 0.45rem;
                    display: flex;
                    gap: 0.3rem;
                    z-index: 5;
                }
                .movie-item-act-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.72);
                    backdrop-filter: blur(6px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: transform 0.15s, background 0.15s;
                }
                .movie-item-act-btn:hover {
                    transform: scale(1.15);
                    background: rgba(0, 0, 0, 0.9);
                }

                .movie-item-body {
                    padding: 0.65rem 0.75rem 0.85rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    flex-grow: 1;
                }
                .movie-item-title {
                    font-size: 0.84rem;
                    font-weight: 700;
                    color: #f1f5f9;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .movie-item-role {
                    font-size: 0.74rem;
                    color: #a78bfa;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .movie-item-year {
                    font-size: 0.7rem;
                    color: #64748b;
                }

                /* Photo Gallery */
                .person-photos-track {
                    display: flex;
                    gap: 0.75rem;
                    overflow-x: auto;
                    padding-bottom: 0.8rem;
                    margin-top: 1rem;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
                }
                .person-photo-thumb {
                    flex-shrink: 0;
                    width: 120px;
                    aspect-ratio: 2/3;
                    border-radius: 0.75rem;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .person-photo-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
            `}</style>

            <div className="person-container">
                <button className="person-back-btn" onClick={() => navigate(-1)}>
                    ← Back
                </button>

                {/* ── Hero Profile ── */}
                <div className="person-hero">
                    <div className="person-poster-wrap">
                        {person.profile_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                                alt={person.name}
                                className="person-poster"
                            />
                        ) : (
                            <div className="person-no-poster">👤</div>
                        )}
                    </div>

                    <div className="person-header-info">
                        <h1 className="person-name">{person.name}</h1>
                        <div className="person-dept-badge">
                            {person.known_for_department || "Acting"}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="person-stats-grid">
                            {person.birthday && (
                                <div className="stat-item">
                                    <span className="stat-label">Born</span>
                                    <span className="stat-value">
                                        {person.birthday} {age !== null && !person.deathday && `(${age} yrs)`}
                                    </span>
                                </div>
                            )}
                            {person.deathday && (
                                <div className="stat-item">
                                    <span className="stat-label">Died</span>
                                    <span className="stat-value">
                                        {person.deathday} {age !== null && `(${age} yrs)`}
                                    </span>
                                </div>
                            )}
                            {person.place_of_birth && (
                                <div className="stat-item">
                                    <span className="stat-label">Place of Birth</span>
                                    <span className="stat-value">{person.place_of_birth}</span>
                                </div>
                            )}
                            <div className="stat-item">
                                <span className="stat-label">Total Credits</span>
                                <span className="stat-value">
                                    {castCredits.length + crewCredits.length}
                                </span>
                            </div>
                        </div>

                        {/* Biography */}
                        {person.biography ? (
                            <div className="person-bio-section">
                                <h3 className="person-bio-heading">Biography</h3>
                                <p className="person-bio-text">{displayedBio}</p>
                                {isBioLong && (
                                    <button
                                        className="bio-toggle-btn"
                                        onClick={() => setBioExpanded((p) => !p)}
                                    >
                                        {bioExpanded ? "Show Less ▲" : "Read Full Bio ▼"}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.88rem" }}>
                                We don't have a biography for {person.name} yet.
                            </p>
                        )}

                        {/* External Links */}
                        <div className="person-links">
                            {person.imdb_id && (
                                <a
                                    href={`https://www.imdb.com/name/${person.imdb_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="imdb-link-btn"
                                >
                                    IMDb Profile ↗
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Known For Highlights ── */}
                {knownForMovies.length > 0 && (
                    <div className="known-for-section">
                        <div className="section-header">
                            <h2 className="section-title">
                                🌟 Known For
                                <span className="section-count">{knownForMovies.length}</span>
                            </h2>
                        </div>
                        <div className="known-for-track">
                            {knownForMovies.map((movie) => (
                                <div
                                    key={`kf-${movie.id}`}
                                    className="known-for-card"
                                    onClick={() => navigate(`/movie/${movie.id}`)}
                                    title={movie.title}
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                        alt={movie.title}
                                        className="known-for-poster"
                                        loading="lazy"
                                    />
                                    <div className="known-for-body">
                                        <div className="known-for-title">{movie.title}</div>
                                        <div className="known-for-rating">
                                            ★ {movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Photo Gallery (if available) ── */}
                {images.length > 1 && (
                    <div style={{ marginBottom: "3rem" }}>
                        <div className="section-header">
                            <h2 className="section-title">
                                📷 Photos
                                <span className="section-count">{images.length}</span>
                            </h2>
                        </div>
                        <div className="person-photos-track">
                            {images.slice(0, 15).map((img, i) => (
                                <div key={i} className="person-photo-thumb">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${img.file_path}`}
                                        alt={`${person.name} photo ${i + 1}`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Filmography Section ── */}
                <div className="filmography-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            🎬 Filmography
                            <span className="section-count">{filteredCredits.length}</span>
                        </h2>
                    </div>

                    <div className="film-controls">
                        {/* Tabs */}
                        <div className="film-tabs">
                            <button
                                className={`film-tab-btn${activeTab === "cast" ? " active" : ""}`}
                                onClick={() => { setActiveTab("cast"); setSearchQuery(""); }}
                            >
                                Acting ({castCredits.length})
                            </button>
                            {crewCredits.length > 0 && (
                                <button
                                    className={`film-tab-btn${activeTab === "crew" ? " active" : ""}`}
                                    onClick={() => { setActiveTab("crew"); setSearchQuery(""); }}
                                >
                                    Directing & Production ({crewCredits.length})
                                </button>
                            )}
                        </div>

                        {/* Search & Sort */}
                        <div className="film-filters">
                            <input
                                type="text"
                                className="film-search-input"
                                placeholder="Search credits..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="film-sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as "popularity" | "date" | "rating")}
                            >
                                <option value="popularity">Most Popular</option>
                                <option value="date">Release Date (Newest)</option>
                                <option value="rating">Rating (Highest)</option>
                            </select>
                        </div>
                    </div>

                    {/* Movie Grid */}
                    {filteredCredits.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#94a3b8" }}>
                            No credits found matching your filter.
                        </div>
                    ) : (
                        <div className="film-grid">
                            {filteredCredits.map((movie) => {
                                const fav = isFavorite(movie.id);
                                const inWL = isInWatchlist(movie.id);
                                const savedData = {
                                    id: movie.id,
                                    title: movie.title,
                                    poster_path: movie.poster_path || "",
                                    backdrop_path: movie.backdrop_path || "",
                                    release_date: movie.release_date || "",
                                    vote_average: movie.vote_average || 0,
                                    overview: movie.overview || "",
                                    genre_ids: movie.genre_ids || [],
                                };

                                return (
                                    <div
                                        key={`${movie.id}-${movie.character || movie.job || ""}`}
                                        className="movie-item-card"
                                        onClick={() => navigate(`/movie/${movie.id}`)}
                                        title={movie.title}
                                    >
                                        <div className="movie-item-poster-wrap">
                                            {movie.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                                    alt={movie.title}
                                                    className="movie-item-poster"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="movie-item-no-poster">🎬</div>
                                            )}

                                            <span className="movie-item-rating">
                                                ★ {movie.vote_average ? movie.vote_average.toFixed(1) : "-"}
                                            </span>

                                            {/* Action icons */}
                                            <div className="movie-item-actions" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="movie-item-act-btn"
                                                    title={fav ? "Remove Favorite" : "Add Favorite"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFavorite(savedData);
                                                    }}
                                                >
                                                    {fav ? "❤️" : "🤍"}
                                                </button>
                                                <button
                                                    className="movie-item-act-btn"
                                                    title={inWL ? "Remove Watchlist" : "Add Watchlist"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWatchlist(savedData);
                                                    }}
                                                >
                                                    {inWL ? "🔖" : "🏷️"}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="movie-item-body">
                                            <div className="movie-item-title">{movie.title}</div>
                                            <div className="movie-item-role">
                                                {activeTab === "cast"
                                                    ? movie.character || "Cast"
                                                    : movie.job || "Crew"}
                                            </div>
                                            <div className="movie-item-year">
                                                {movie.release_date?.slice(0, 4) || "TBA"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PersonDetails;
