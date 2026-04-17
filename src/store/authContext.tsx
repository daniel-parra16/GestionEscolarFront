import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// ─── Tipos ─────────────────────────────────────────────

type User = {
    accessToken: string;
    refreshToken: string;
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    rol: "admin" | "profesor" | "estudiante" | "padre";
};

type AuthContextType = {
    user: User | null;
    login: (data: any) => void;
    logout: () => void;
    sessionExpired: boolean;
    setSessionExpired: (value: boolean) => void;
};

// ─── Context ───────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Utils ─────────────────────────────────────────────

function decodeJWT(token: string): any {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
}

const roleMap: Record<string, User["rol"]> = {
    ROLE_ADMIN: "admin",
    ROLE_PROFESOR: "profesor",
    ROLE_ESTUDIANTE: "estudiante",
    ROLE_PADRE: "padre",
};

// ─── Provider ──────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("auth");

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const payload = decodeJWT(parsed.accessToken);

                if (!payload) {
                    localStorage.removeItem("auth");
                } else {
                    const now = Date.now() / 1000;
                    if (payload.exp > now) {
                        setUser(parsed);
                    } else {
                        localStorage.removeItem("auth");
                    }
                }
            } catch {
                localStorage.removeItem("auth");
            }
        }

        const handleExpired = () => setSessionExpired(true);
        window.addEventListener("session-expired", handleExpired);
        return () => window.removeEventListener("session-expired", handleExpired);
    }, []);

    const login = (data: any) => {
        const payload = decodeJWT(data.accessToken);
        const rawRol = payload?.roles?.[0] ?? "";

        const userData: User = {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            id: payload?.sub ?? "",
            nombre: payload?.nombre ?? "",
            apellido: payload?.apellido ?? "",
            email: payload?.email ?? "",
            rol: roleMap[rawRol] ?? "estudiante",
        };

        setUser(userData);
        localStorage.setItem("auth", JSON.stringify(userData));
        setSessionExpired(false);
    };

    const logout = () => {
        setUser(null);
        setSessionExpired(false);
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, sessionExpired, setSessionExpired }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ──────────────────────────────────────────────

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
};