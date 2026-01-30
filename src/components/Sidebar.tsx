
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    AlertTriangle,
    MessageSquare,
    TrendingUp,
    Settings,
    LogOut,
    Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

    return (
        <aside className="hidden lg:flex w-72 h-screen sticky top-0 bg-blue-950/40 backdrop-blur-2xl border-r border-white/10 flex-col shadow-2xl z-50">
            <div className="p-8 flex flex-col items-center border-b border-white/5">
                <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img
                        src="/logo.png"
                        alt="ALIANZANET Logo"
                        className="h-16 w-auto object-contain relative z-10 filter drop-shadow-2xl"
                    />
                </div>
                <div className="mt-4 text-center">
                    <h2 className="text-xl font-black text-white tracking-widest italic flex items-center gap-2">
                        ALIANZA<span className="text-amber-400">NET</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">SISTEMA DE GESTIÓN PRO</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative",
                                isActive
                                    ? "text-white shadow-lg bg-white/5"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-amber-500/10 to-transparent border-l-[3px] border-amber-500 rounded-l-md"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-300 relative z-10",
                                isActive ? "bg-amber-500 text-blue-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "bg-white/5 text-slate-400 group-hover:text-amber-400 group-hover:bg-white/10"
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm tracking-wide relative z-10">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto">
                <div className="p-5 glass-card mb-6 border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-xs font-black text-blue-950 shadow-lg">AD</div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-blue-950 rounded-full shadow-lg" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Admin</p>
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">En Línea</p>
                        </div>
                    </div>
                </div>

                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-rose-400/20 active:scale-95">
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
