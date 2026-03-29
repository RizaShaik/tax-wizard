/**
 * AuthContext.tsx — manages JWT, user state, login/signup/logout.
 */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as api from '../lib/api';

interface AuthUser {
    _id: string;
    name: string;
    email: string;
    age: number;
}

interface AuthContextProps {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
const TOKEN_KEY = 'tw_token';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: validate stored token
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { setIsLoading(false); return; }

        api.getMe()
            .then(({ user }) => setUser(user))
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { token, user } = await api.login(email, password);
        localStorage.setItem(TOKEN_KEY, token);
        setUser(user);
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        const { token, user } = await api.signup(name, email, password);
        localStorage.setItem(TOKEN_KEY, token);
        setUser(user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }, []);

    const updateUser = useCallback(async (data: Partial<AuthUser>) => {
        const { user } = await api.updateMe(data);
        setUser(user);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            signup,
            logout,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
