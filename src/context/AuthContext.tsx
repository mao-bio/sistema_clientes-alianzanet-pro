
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    user: string | null;
    login: (username: string, pass: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VALID_USERS = [
    { username: "admin", password: "admin123", name: "Administrador" },
    { username: "wiliam", password: "william26", name: "William" }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem("alianza_auth");
        const storedUser = localStorage.getItem("alianza_user");
        if (auth === "true") {
            setIsAuthenticated(true);
            setUser(storedUser);
        }
        setMounted(true);
    }, []);

    const login = (username: string, pass: string) => {
        const found = VALID_USERS.find(u => u.username === username && u.password === pass);
        if (found) {
            localStorage.setItem("alianza_auth", "true");
            localStorage.setItem("alianza_user", found.name);
            setIsAuthenticated(true);
            setUser(found.name);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem("alianza_auth");
        localStorage.removeItem("alianza_user");
        setIsAuthenticated(false);
        setUser(null);
    };

    if (!mounted) return null;

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
