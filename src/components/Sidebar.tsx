"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Users,
    AlertTriangle,
    MessageSquare,
    TrendingUp,
    LogOut,
    Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from 'framer-motion';

const menuItems = [
    { name: 'Dashboard', icon: BarChart3, href: '/' },
    { name: 'Clientes', icon: Users, href: '/clientes' },
    { name: 'Morosos', icon: AlertTriangle, href: '/morosos' },
    { name: 'Recordatorios', icon: MessageSquare, href: '/recordatorios' },
    { name: 'Finanzas', icon: TrendingUp, href: '/finanzas' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <aside className="hidden lg:flex w-80 h-screen bg-[#0a1525] border-r border-white/5 flex-col flex-shrink-0 sticky top-0 overflow-y-auto">
            {/* Logo Section */}
            <div className="p-8">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500 border border-white/10">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tighter italic">
                            ALIANZA<span className="text-gradient">NET</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Management Pro</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 font-bold group",
                                isActive
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/10 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.2)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform duration-500",
                                isActive ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span className="tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Profile */}
            <div className="p-6 mt-auto space-y-4">
                <div className="p-6 glass-card border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-xs font-black text-blue-950 shadow-lg">
                            {user?.substring(0, 2).toUpperCase() || 'AD'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{user || 'Admin'}</p>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">En Línea</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-rose-400/20 active:scale-95"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
