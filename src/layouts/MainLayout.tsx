import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMovieList } from "../context/MovieListContext";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "../components/auth/AuthModal";

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const { favorites, watchlist } = useMovieList();
    const { user, isLoading: authLoading, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on navigation
    const handleNav = (path: string) => {
        navigate(path);
        setMenuOpen(false);
    };

    const navLinks = [
        { label: "Home", path: "/", icon: "🏠" },
        { label: "Favorites", path: "/favorites", icon: "❤️", count: favorites.length },
        { label: "Watchlist", path: "/watchlist", icon: "🔖", count: watchlist.length },
    ];

    return (
        <div className="app-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .app-root {
                    min-height: 100vh;
                    background: #0a0a0f;
                    color: #e2e8f0;
                    font-family: 'Inter', sans-serif;
                }

                /* ── Navbar ── */
                .navbar {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 100;
                    transition: background 0.3s, box-shadow 0.3s, backdrop-filter 0.3s;
                    padding: 0 2rem;
                    height: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .navbar.scrolled {
                    background: rgba(10, 10, 20, 0.88);
                    backdrop-filter: blur(16px);
                    box-shadow: 0 1px 0 rgba(255,255,255,0.06);
                }
                .navbar.top {
                    background: transparent;
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    text-decoration: none;
                }
                .nav-logo-icon {
                    width: 34px; height: 34px;
                    background: linear-gradient(135deg, #667eea, #f093fb);
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(102,126,234,0.4);
                }
                .nav-brand-text {
                    font-size: 1.2rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #fff 40%, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: -0.3px;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                @media (max-width: 640px) { .nav-links { display: none; } }

                .nav-link {
                    position: relative;
                    color: #94a3b8;
                    font-size: 0.88rem;
                    font-weight: 500;
                    padding: 0.4rem 0.85rem;
                    border-radius: 8px;
                    cursor: pointer;
                    border: none;
                    background: none;
                    transition: color 0.2s, background 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-family: 'Inter', sans-serif;
                }
                .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
                .nav-link.active { color: #a78bfa; background: rgba(167,139,250,0.1); }

                /* Count badge on nav links */
                .nav-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    border-radius: 999px;
                    font-size: 0.62rem;
                    font-weight: 800;
                    color: #fff;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    line-height: 1;
                    margin-left: 0.1rem;
                    transition: transform 0.2s;
                }
                .nav-link.fav-link .nav-badge { background: linear-gradient(135deg, #ef4444, #ec4899); }
                .nav-link.watch-link .nav-badge { background: linear-gradient(135deg, #3b82f6, #6366f1); }
                .nav-link:hover .nav-badge { transform: scale(1.15); }

                .nav-hamburger {
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 4px;
                }
                @media (max-width: 640px) { .nav-hamburger { display: flex; } }
                .ham-bar {
                    width: 22px; height: 2px;
                    background: #94a3b8;
                    border-radius: 2px;
                    transition: all 0.3s;
                }

                /* Mobile menu */
                .mobile-menu {
                    position: fixed;
                    top: 64px; left: 0; right: 0;
                    background: rgba(10,10,20,0.97);
                    backdrop-filter: blur(20px);
                    z-index: 99;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    animation: slideDown 0.2s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .mobile-nav-link {
                    color: #94a3b8;
                    font-size: 0.92rem;
                    font-weight: 500;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    border: none;
                    background: none;
                    text-align: left;
                    transition: color 0.2s, background 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    font-family: 'Inter', sans-serif;
                }
                .mobile-nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
                .mobile-nav-link.active { color: #a78bfa; background: rgba(167,139,250,0.1); }
                .mobile-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px; height: 20px;
                    padding: 0 5px;
                    border-radius: 999px;
                    font-size: 0.68rem;
                    font-weight: 800;
                    color: #fff;
                    margin-left: auto;
                }
                .mobile-badge.fav { background: linear-gradient(135deg, #ef4444, #ec4899); }
                .mobile-badge.watch { background: linear-gradient(135deg, #3b82f6, #6366f1); }

                /* ── Auth Navbar Zone ── */
                .nav-right {
                    display: flex;
                    align-items: center;
                    gap: 0.85rem;
                }
                .nav-auth-desktop {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                }
                @media (max-width: 640px) {
                    .nav-auth-desktop { display: none; }
                }

                .auth-btn-signin {
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    color: #fff;
                    font-size: 0.82rem;
                    font-weight: 600;
                    padding: 0.45rem 1rem;
                    border-radius: 999px;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
                    font-family: 'Inter', sans-serif;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
                }
                .auth-btn-signin:hover {
                    opacity: 0.92;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
                }

                .auth-user-pill {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 0.3rem 0.75rem 0.3rem 0.35rem;
                    border-radius: 999px;
                    font-size: 0.82rem;
                    color: #e2e8f0;
                }
                .auth-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #a78bfa, #818cf8);
                    color: #0f172a;
                    font-size: 0.72rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: uppercase;
                }
                .auth-user-name {
                    font-weight: 600;
                    max-width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: #f1f5f9;
                }
                .auth-logout-btn {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    font-size: 0.75rem;
                    padding: 0.2rem 0.4rem;
                    border-radius: 4px;
                    transition: color 0.2s, background 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .auth-logout-btn:hover {
                    color: #fca5a5;
                    background: rgba(239,68,68,0.12);
                }

                .auth-loading-pill {
                    width: 80px;
                    height: 30px;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.06);
                    animation: pulse 1.4s ease-in-out infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.85; }
                }

                .mobile-auth-divider {
                    height: 1px;
                    background: rgba(255,255,255,0.08);
                    margin: 0.6rem 0.5rem;
                }
                .mobile-user-box {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.6rem 0.8rem;
                    background: rgba(255,255,255,0.04);
                    border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.07);
                }
                .mobile-user-details {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    flex: 1;
                }
                .mobile-user-name {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #f1f5f9;
                }
                .mobile-user-email {
                    font-size: 0.75rem;
                    color: #64748b;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .mobile-logout-btn {
                    background: rgba(239,68,68,0.12);
                    border: 1px solid rgba(239,68,68,0.3);
                    color: #fca5a5;
                    font-size: 0.78rem;
                    font-weight: 600;
                    padding: 0.35rem 0.7rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-family: 'Inter', sans-serif;
                }
                .mobile-signin-btn {
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 700;
                    padding: 0.7rem 1rem;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-family: 'Inter', sans-serif;
                }

                /* ── Main ── */
                .main-content {
                    padding-top: 64px;
                }

                /* ── Footer ── */
                .footer {
                    margin-top: 5rem;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    background: rgba(255,255,255,0.02);
                    padding: 2.5rem 2rem;
                    text-align: center;
                }
                .footer-brand {
                    font-size: 1.1rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #fff 40%, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.4rem;
                }
                .footer-copy {
                    color: #4b5563;
                    font-size: 0.8rem;
                }
                .footer-tmdb {
                    margin-top: 0.5rem;
                    color: #374151;
                    font-size: 0.75rem;
                }
            `}</style>

            {/* Navbar */}
            <nav className={`navbar ${scrolled ? "scrolled" : "top"}`}>
                <div className="nav-brand" onClick={() => handleNav("/")}>
                    <div className="nav-logo-icon">🎬</div>
                    <span className="nav-brand-text">MovieVerse</span>
                </div>

                <div className="nav-links">
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            className={`nav-link${link.path === "/favorites" ? " fav-link" : ""}${link.path === "/watchlist" ? " watch-link" : ""}${location.pathname === link.path ? " active" : ""}`}
                            onClick={() => handleNav(link.path)}
                        >
                            {link.label}
                            {link.count !== undefined && link.count > 0 && (
                                <span className="nav-badge">{link.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="nav-right">
                    {/* Desktop Auth Zone */}
                    <div className="nav-auth-desktop">
                        {authLoading ? (
                            <div className="auth-loading-pill" />
                        ) : user ? (
                            <div className="auth-user-pill">
                                <div className="auth-avatar">{user.name.charAt(0)}</div>
                                <span className="auth-user-name" title={user.name}>{user.name}</span>
                                <button className="auth-logout-btn" onClick={logout} title="Sign Out">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                className="auth-btn-signin"
                                onClick={() => setAuthModalOpen(true)}
                            >
                                <span>✨</span>
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button className="nav-hamburger" onClick={() => setMenuOpen((p) => !p)} aria-label="Menu">
                        <span className="ham-bar" />
                        <span className="ham-bar" />
                        <span className="ham-bar" />
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="mobile-menu">
                    {navLinks.map((link) => (
                        <button
                            key={link.path}
                            className={`mobile-nav-link${location.pathname === link.path ? " active" : ""}`}
                            onClick={() => handleNav(link.path)}
                        >
                            <span>{link.icon}</span>
                            {link.label}
                            {link.count !== undefined && link.count > 0 && (
                                <span className={`mobile-badge${link.path === "/favorites" ? " fav" : " watch"}`}>
                                    {link.count}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="mobile-auth-divider" />
                    {authLoading ? (
                        <div className="auth-loading-pill" style={{ margin: "0.5rem auto" }} />
                    ) : user ? (
                        <div className="mobile-user-box">
                            <div className="auth-avatar">{user.name.charAt(0)}</div>
                            <div className="mobile-user-details">
                                <span className="mobile-user-name">{user.name}</span>
                                <span className="mobile-user-email">{user.email}</span>
                            </div>
                            <button
                                className="mobile-logout-btn"
                                onClick={() => {
                                    logout();
                                    setMenuOpen(false);
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button
                            className="mobile-signin-btn"
                            onClick={() => {
                                setMenuOpen(false);
                                setAuthModalOpen(true);
                            }}
                        >
                            ✨ Sign In / Join
                        </button>
                    )}
                </div>
            )}

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="footer">
                <div className="footer-brand">🎬 MovieVerse</div>
                <p className="footer-copy">© {new Date().getFullYear()} Amrenther · MovieVerse · All rights reserved.</p>
                <p className="footer-tmdb">Powered by The Movie Database (TMDB) API</p>
            </footer>

            {/* Auth Modal Overlay */}
            {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        </div>
    );
};

export default MainLayout;