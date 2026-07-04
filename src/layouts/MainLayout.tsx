import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => { setMenuOpen(false); }, [location]);

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
                    color: #94a3b8;
                    font-size: 0.88rem;
                    font-weight: 500;
                    padding: 0.4rem 0.85rem;
                    border-radius: 8px;
                    cursor: pointer;
                    border: none;
                    background: none;
                    transition: color 0.2s, background 0.2s;
                }
                .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
                .nav-link.active { color: #a78bfa; background: rgba(167,139,250,0.1); }

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
                }
                .mobile-nav-link:hover { color: #fff; background: rgba(255,255,255,0.06); }
                .mobile-nav-link.active { color: #a78bfa; background: rgba(167,139,250,0.1); }

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
                <div className="nav-brand" onClick={() => navigate("/")}>
                    <div className="nav-logo-icon">🎬</div>
                    <span className="nav-brand-text">MovieVerse</span>
                </div>

                <div className="nav-links">
                    <button
                        className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
                        onClick={() => navigate("/")}
                    >Home</button>
                </div>

                {/* Hamburger */}
                <button className="nav-hamburger" onClick={() => setMenuOpen((p) => !p)} aria-label="Menu">
                    <span className="ham-bar" />
                    <span className="ham-bar" />
                    <span className="ham-bar" />
                </button>
            </nav>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div className="mobile-menu">
                    <button
                        className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`}
                        onClick={() => navigate("/")}
                    >🏠 Home</button>
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
        </div>
    );
};

export default MainLayout;