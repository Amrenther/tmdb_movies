import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { authApi, type PublicUser, type ApiFieldError } from "../api/serverClient";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthError {
    message: string;
    code?: string;
    fieldErrors?: ApiFieldError[];
}

interface AuthContextType {
    user: PublicUser | null;
    /** true while the initial GET /auth/me check is in-flight on app start */
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

// ─── Helper — extract a human-readable error from an Axios error ───────────────

export function extractAuthError(err: unknown): AuthError {
    if (axios.isAxiosError(err)) {
        const data = err.response?.data as
            | { code?: string; message?: string; errors?: ApiFieldError[] }
            | undefined;
        return {
            message: data?.message ?? err.message ?? "Something went wrong",
            code: data?.code,
            fieldErrors: data?.errors,
        };
    }
    if (err instanceof Error) return { message: err.message };
    return { message: "An unknown error occurred" };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<PublicUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: restore session from the httpOnly cookie via GET /api/auth/me
    useEffect(() => {
        let cancelled = false;

        authApi
            .me()
            .then((res) => {
                if (!cancelled) setUser(res.data.user);
            })
            .catch(() => {
                // 401 = guest, network error = guest — both are fine
                if (!cancelled) setUser(null);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        setUser(res.data.user);
    }, []);

    const signup = useCallback(async (email: string, password: string, name: string) => {
        const res = await authApi.signup(email, password, name);
        setUser(res.data.user);
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            // Clear user regardless of network result — cookie is cleared server-side
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
