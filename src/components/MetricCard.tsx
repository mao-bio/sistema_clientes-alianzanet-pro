
"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    delta?: {
        value: number | string;
        isPositive: boolean;
    };
    color: "blue" | "emerald" | "amber" | "rose";
}

const colors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function MetricCard({ title, value, icon: Icon, delta, color }: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="p-6 glass-card relative overflow-hidden group"
        >
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>

                    {delta && (
                        <div className={cn(
                            "mt-3 text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit",
                            delta.isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                        )}>
                            <span>{delta.isPositive ? "↑" : "↓"} {delta.value}</span>
                            <span className="opacity-60 font-medium">este mes</span>
                        </div>
                    )}
                </div>

                <div className={cn("p-4 rounded-2xl border transition-all duration-300 shadow-lg", colors[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {/* Decorative background element */}
            <div className={cn(
                "absolute -right-6 -bottom-6 w-32 h-32 blur-[60px] rounded-full opacity-20 transition-opacity group-hover:opacity-30",
                color === "blue" ? "bg-blue-500" :
                    color === "emerald" ? "bg-emerald-500" :
                        color === "amber" ? "bg-amber-500" : "bg-rose-500"
            )} />
        </motion.div>
    );
}
