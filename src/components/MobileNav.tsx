
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Users,
    AlertTriangle,
    MessageSquare,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Dash', icon: BarChart3, href: '/' },
    { name: 'Clientes', icon: Users, href: '/clientes' },
    { name: 'Morosos', icon: AlertTriangle, href: '/morosos' },
    { name: 'Mensajes', icon: MessageSquare, href: '/recordatorios' },
    { name: 'Finanzas', icon: TrendingUp, href: '/finanzas' },
];

export function MobileBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-blue-950/80 backdrop-blur-xl border-t border-white/10 z-50 px-2 pb-safe">
            <div className="flex justify-around items-center h-16">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
                                isActive ? "text-amber-400" : "text-slate-400"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-xl transition-all",
                                isActive && "bg-amber-400/10"
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

export function MobileHeader() {
    const { logout, user } = useAuth();

    return (
        <header className="lg:hidden sticky top-0 bg-blue-950/40 backdrop-blur-2xl border-b border-white/10 z-50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
                <h1 className="text-lg font-black text-white italic">
                    ALIANZA<span className="text-amber-400">NET</span>
                </h1>
            </div>
            <button
                onClick={logout}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-[10px] font-black text-blue-950 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            >
                {user?.substring(0, 2).toUpperCase() || 'AD'}
            </button>
        </header>
    );
}
