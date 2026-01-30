
export default function Loading() {
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Cargando sistema...</p>
        </div>
    );
}
