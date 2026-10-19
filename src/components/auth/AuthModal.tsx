import { useState, useRef, type FormEvent } from "react";
import { useAuth, extractAuthError } from "../../context/AuthContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthModalProps {
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AuthModal = ({ onClose }: AuthModalProps) => {
    const { login, signup } = useAuth();
    const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [topError, setTopError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const backdropRef = useRef<HTMLDivElement>(null);

    const clearErrors = () => {
        setTopError(null);
        setFieldErrors({});
    };

    const switchMode = (next: "login" | "signup" | "forgot") => {
        setMode(next);
        setName("");
        setEmail("");
        setPassword("");
        setShowPassword(false);
        clearErrors();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearErrors();
        setSubmitting(true);

        try {
            if (mode === "login") {
                await login(email, password);
            } else {
                await signup(email, password, name);
            }
            onClose(); // success — close the modal
        } catch (err) {
            const authErr = extractAuthError(err);

            if (authErr.fieldErrors && authErr.fieldErrors.length > 0) {
                const map: Record<string, string> = {};
                for (const fe of authErr.fieldErrors) map[fe.path] = fe.message;
                setFieldErrors(map);
            } else if (authErr.code === "RATE_LIMITED") {
                setTopError("Too many attempts. Please wait 15 minutes and try again.");
            } else if (authErr.code === "EMAIL_TAKEN") {
                setFieldErrors({ email: "This email is already registered." });
            } else if (authErr.code === "INVALID_CREDENTIALS") {
                setTopError("Incorrect email or password.");
            } else {
                setTopError(authErr.message || "Something went wrong. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    const isLogin = mode === "login";
    const isForgot = mode === "forgot";

    return (
        <>
            <style>{`
                .auth-backdrop {
                    position: fixed; inset: 0;
                    background: rgba(0, 0, 0, 0.72);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: fadeIn 0.18s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                .auth-modal {
                    background: #13131f;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 1.25rem;
                    padding: 2rem 2.25rem 2.25rem;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
                    animation: slideUp 0.22s ease;
                    position: relative;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(18px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .auth-close {
                    position: absolute; top: 1rem; right: 1rem;
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #94a3b8; width: 32px; height: 32px;
                    border-radius: 999px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1rem; transition: background 0.2s, color 0.2s;
                }
                .auth-close:hover { background: rgba(255,255,255,0.14); color: #fff; }

                .auth-title {
                    font-size: 1.5rem; font-weight: 800; color: #fff;
                    margin-bottom: 0.25rem;
                }
                .auth-subtitle {
                    font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;
                }

                .auth-error-banner {
                    background: rgba(239,68,68,0.12);
                    border: 1px solid rgba(239,68,68,0.35);
                    color: #fca5a5;
                    border-radius: 0.65rem;
                    padding: 0.65rem 0.9rem;
                    font-size: 0.83rem;
                    margin-bottom: 1.1rem;
                    line-height: 1.5;
                }

                .auth-field { margin-bottom: 1rem; }
                .auth-label {
                    display: block;
                    font-size: 0.8rem; font-weight: 600;
                    color: #94a3b8; margin-bottom: 0.4rem;
                    letter-spacing: 0.02em;
                }
                .auth-input-wrap {
                    position: relative;
                }
                .auth-input {
                    width: 100%;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.65rem;
                    padding: 0.65rem 0.9rem;
                    color: #e2e8f0;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    font-family: 'Inter', sans-serif;
                    box-sizing: border-box;
                }
                .auth-input.has-toggle {
                    padding-right: 2.8rem;
                }
                .auth-input:focus {
                    border-color: #7c3aed;
                    background: rgba(124,58,237,0.08);
                }
                .auth-input.error { border-color: rgba(239,68,68,0.6); }
                .auth-field-error {
                    color: #fca5a5; font-size: 0.75rem; margin-top: 0.3rem;
                }

                /* ── Password toggle button ── */
                .auth-pw-toggle {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1.05rem;
                    color: #64748b;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .auth-pw-toggle:hover { color: #a78bfa; }

                /* ── Forgot password link ── */
                .auth-forgot-link {
                    display: block;
                    text-align: right;
                    margin-top: -0.4rem;
                    margin-bottom: 0.85rem;
                    background: none;
                    border: none;
                    color: #7c6fa0;
                    font-size: 0.78rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    transition: color 0.2s;
                }
                .auth-forgot-link:hover { color: #a78bfa; }

                /* ── Forgot password info panel ── */
                .auth-forgot-panel {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 1rem 0 0.5rem;
                    gap: 0.85rem;
                    animation: fadeIn 0.18s ease;
                }
                .auth-forgot-icon {
                    font-size: 3rem;
                    line-height: 1;
                }
                .auth-forgot-title {
                    font-size: 1.15rem;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin: 0;
                }
                .auth-forgot-desc {
                    font-size: 0.85rem;
                    color: #94a3b8;
                    line-height: 1.65;
                    max-width: 290px;
                    margin: 0;
                }
                .auth-forgot-back {
                    margin-top: 0.5rem;
                    width: 100%;
                    padding: 0.7rem;
                    border-radius: 0.65rem;
                    border: 1px solid rgba(167,139,250,0.3);
                    background: rgba(124,58,237,0.12);
                    color: #a78bfa;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s;
                    font-family: 'Inter', sans-serif;
                }
                .auth-forgot-back:hover {
                    background: rgba(124,58,237,0.22);
                    border-color: rgba(167,139,250,0.55);
                }

                .auth-submit {
                    width: 100%;
                    padding: 0.75rem;
                    border-radius: 0.65rem;
                    border: none;
                    background: linear-gradient(135deg, #7c3aed, #4f46e5);
                    color: #fff;
                    font-size: 0.95rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                    font-family: 'Inter', sans-serif;
                    margin-top: 0.5rem;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                }
                .auth-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
                .auth-submit:disabled { opacity: 0.55; cursor: not-allowed; }

                .auth-spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .auth-switch {
                    text-align: center;
                    margin-top: 1.25rem;
                    font-size: 0.82rem;
                    color: #64748b;
                }
                .auth-switch-btn {
                    background: none; border: none;
                    color: #a78bfa; font-weight: 600; cursor: pointer;
                    padding: 0 0.2rem;
                    font-family: 'Inter', sans-serif;
                    font-size: inherit;
                    transition: color 0.2s;
                }
                .auth-switch-btn:hover { color: #c4b5fd; }

                .auth-no-merge-note {
                    margin-top: 1.25rem;
                    padding: 0.65rem 0.9rem;
                    background: rgba(167,139,250,0.08);
                    border: 1px solid rgba(167,139,250,0.2);
                    border-radius: 0.65rem;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    line-height: 1.55;
                }
                .auth-no-merge-note strong { color: #c4b5fd; }
            `}</style>

            <div className="auth-backdrop" ref={backdropRef} onClick={handleBackdropClick}>
                <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
                    <button className="auth-close" onClick={onClose} aria-label="Close">✕</button>

                    {/* ── Forgot Password Panel ── */}
                    {isForgot ? (
                        <>
                            <h2 className="auth-title" id="auth-modal-title">Forgot password?</h2>
                            <p className="auth-subtitle">We'll help you get back in.</p>
                            <div className="auth-forgot-panel">
                                <div className="auth-forgot-icon">🔐</div>
                                <h3 className="auth-forgot-title">Password reset</h3>
                                <p className="auth-forgot-desc">
                                    Email-based password reset is not yet available. To regain access,
                                    please contact support or create a new account with a different email.
                                </p>
                                <button
                                    className="auth-forgot-back"
                                    onClick={() => switchMode("login")}
                                >
                                    ← Back to Login
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* ── Login / Signup Panel ── */}
                            <h2 className="auth-title" id="auth-modal-title">
                                {isLogin ? "Welcome back" : "Create account"}
                            </h2>
                            <p className="auth-subtitle">
                                {isLogin
                                    ? "Sign in to access your lists on any device."
                                    : "Join MovieVerse to save your favorites and watchlist."}
                            </p>

                            {topError && (
                                <div className="auth-error-banner" role="alert">{topError}</div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                {!isLogin && (
                                    <div className="auth-field">
                                        <label className="auth-label" htmlFor="auth-name">Name</label>
                                        <input
                                            id="auth-name"
                                            className={`auth-input${fieldErrors.name ? " error" : ""}`}
                                            type="text"
                                            autoComplete="name"
                                            placeholder="Your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={submitting}
                                        />
                                        {fieldErrors.name && (
                                            <p className="auth-field-error" role="alert">{fieldErrors.name}</p>
                                        )}
                                    </div>
                                )}

                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="auth-email">Email</label>
                                    <input
                                        id="auth-email"
                                        className={`auth-input${fieldErrors.email ? " error" : ""}`}
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={submitting}
                                    />
                                    {fieldErrors.email && (
                                        <p className="auth-field-error" role="alert">{fieldErrors.email}</p>
                                    )}
                                </div>

                                <div className="auth-field">
                                    <label className="auth-label" htmlFor="auth-password">Password</label>
                                    <div className="auth-input-wrap">
                                        <input
                                            id="auth-password"
                                            className={`auth-input has-toggle${fieldErrors.password ? " error" : ""}`}
                                            type={showPassword ? "text" : "password"}
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                            placeholder={isLogin ? "Your password" : "Min. 8 characters"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={submitting}
                                        />
                                        <button
                                            type="button"
                                            className="auth-pw-toggle"
                                            onClick={() => setShowPassword((p) => !p)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                    {fieldErrors.password && (
                                        <p className="auth-field-error" role="alert">{fieldErrors.password}</p>
                                    )}
                                </div>

                                {/* Forgot password link — shown only in login mode */}
                                {isLogin && (
                                    <button
                                        type="button"
                                        className="auth-forgot-link"
                                        onClick={() => { clearErrors(); setMode("forgot"); }}
                                    >
                                        Forgot password?
                                    </button>
                                )}

                                <button type="submit" className="auth-submit" disabled={submitting}>
                                    {submitting && <span className="auth-spinner" />}
                                    {isLogin ? "Log in" : "Create account"}
                                </button>
                            </form>

                            <div className="auth-switch">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                {" "}
                                <button
                                    className="auth-switch-btn"
                                    type="button"
                                    onClick={() => switchMode(isLogin ? "signup" : "login")}
                                >
                                    {isLogin ? "Sign up" : "Log in"}
                                </button>
                            </div>

                            {!isLogin && (
                                <div className="auth-no-merge-note">
                                    <strong>Note:</strong> Your current guest lists will not be merged
                                    into your new account. They'll stay on this device until you clear them.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
