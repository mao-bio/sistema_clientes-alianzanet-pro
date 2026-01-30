
"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem("alianza_auth");
        if (auth === "true") {
            setIsAuthenticated(true);
        }
        setChecking(false);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple authentication for internal tool
        // In production, this should be validated against env variable or backend
        if (password === "admin123") {
            localStorage.setItem("alianza_auth", "true");
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("alianza_auth");
        setIsAuthenticated(false);
    };

    if (checking) return null;

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060e1a] p-6 relative overflow-hidden">
                {/* Decorative Mesh Background */}
                <div className="bg-mesh" />

                {/* Glowing Orbs */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-lg relative z-10">
                    <div className="text-center mb-12">
                        <div className="w-24 h-24 premium-gradient rounded-[32px] mx-auto flex items-center justify-center shadow-[0_20px_40px_rgba(245,158,11,0.3)] mb-8 rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/20">
                            <ShieldCheck className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tighter mb-3 uppercase italic">
                            ALIANZA<span className="text-gradient">NET</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">Sistema de Gestión de Clientes ISP</p>
                    </div>

                    <div className="glass-card border-white/10 p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1 premium-gradient" />

                        <form onSubmit={handleLogin} className="relative z-10 space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 mb-3 block italic">Contraseña de Seguridad</label>
                                <div className="relative group/input">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl border border-white/10 group-focus-within/input:border-amber-500/50 transition-colors">
                                        <Lock className="w-5 h-5 text-slate-500 group-focus-within/input:text-amber-500" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[22px] pl-16 pr-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all font-black tracking-[0.5em] text-center text-xl"
                                        placeholder="••••••••"
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-rose-500 text-xs font-black mt-3 text-center uppercase tracking-widest italic"
                                    >
                                        Acceso Denegado: Credenciales Inválidas
                                    </motion.p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 premium-gradient text-white rounded-[22px] font-black transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden uppercase tracking-widest text-sm"
                            >
                                <span className="relative z-10">Autenticar Usuario</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-12 opacity-50">
                        ALIANZANET PRO &copy; {new Date().getFullYear()} &bull; INFRAESTRUCTURA DE RED RESTRINGIDA
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed top-4 right-4 z-50 md:hidden">
                <button onClick={handleLogout} className="p-2 bg-slate-900 text-red-400 rounded-full border border-red-500/20">
                    <Lock className="w-4 h-4" />
                </button>
            </div>
            {children}
        </>
    );
}
