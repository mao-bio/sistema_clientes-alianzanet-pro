
import { cn } from "@/lib/utils";

interface BadgeProps {
    children: React.ReactNode;
    variant: "success" | "warning" | "danger" | "default";
}

const variants = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function Badge({ children, variant }: BadgeProps) {
    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
            variants[variant]
        )}>
            {children}
        </span>
    );
}
