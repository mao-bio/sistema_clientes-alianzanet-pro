
"use client";

import { useState } from "react";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, login, logout } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(username, password);
        if (!success) {
            setError(true);
        } else {
            setError(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060e1a] p-6 relative overflow-hidden">
                <div className="bg-mesh" />
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-lg relative z-10">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 premium-gradient rounded-[28px] mx-auto flex items-center justify-center shadow-[0_20px_40px_rgba(245,158,11,0.3)] mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 border border-white/20">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase italic">
                            ALIANZA<span className="text-gradient">NET</span>
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Sistema de Gestión de Clientes ISP</p>
                    </div>

                    <div className="glass-card border-white/10 p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-1 premium-gradient" />

                        <form onSubmit={handleLogin} className="relative z-10 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block italic">Usuario</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg border border-white/10 group-focus-within/input:border-amber-500/50 transition-colors">
                                            <User className="w-4 h-4 text-slate-500 group-focus-within/input:text-amber-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all font-bold tracking-wider"
                                            placeholder="Nombre de usuario"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 mb-2 block italic">Contraseña</label>
                                    <div className="relative group/input">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg border border-white/10 group-focus-within/input:border-amber-500/50 transition-colors">
                                            <Lock className="w-4 h-4 text-slate-500 group-focus-within/input:text-amber-400" />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/30 transition-all font-bold tracking-[0.3em]"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-rose-500 text-[10px] font-black text-center uppercase tracking-widest italic"
                                >
                                    Credenciales Incorrectas
                                </motion.p>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 premium-gradient text-white rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden uppercase tracking-widest text-xs"
                            >
                                <span className="relative z-10">Ingresar al Sistema</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mt-10 opacity-50">
                        ALIANZANET PRO &copy; {new Date().getFullYear()} &bull; INFRAESTRUCTURA DE RED RESTRINGIDA
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed top-4 right-4 z-[60] lg:hidden">
                <button
                    onClick={logout}
                    className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 backdrop-blur-xl shadow-lg active:scale-95 transition-all"
                >
                    <Lock className="w-5 h-5" />
                </button>
            </div>
            {children}
        </>
    );
}
