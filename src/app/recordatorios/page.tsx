
"use client";

import { useEffect, useState } from "react";
import {
    Mail,
    Send,
    Users,
    CheckCircle2,
    Search,
    Filter,
    MapPin
} from "lucide-react";
import { apiService } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "@/components/Badge";

export default function RecordatoriosPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [filterNodo, setFilterNodo] = useState("TODOS");
    const [filterPlan, setFilterPlan] = useState("TODOS");
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await apiService.getClientes();
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = data.filter(c => {
        const matchSearch =
            c.NOMBRE?.toLowerCase().includes(search.toLowerCase()) ||
            c.DIRECCION?.toLowerCase().includes(search.toLowerCase()) ||
            String(c.ID).includes(search);

        const matchNodo = filterNodo === "TODOS" || c.NODO === filterNodo;
        const matchPlan = filterPlan === "TODOS" || c.PLAN === filterPlan;

        return matchSearch && matchNodo && matchPlan;
    });

    const uniqueNodos = Array.from(new Set(data.filter(c => c.NODO).map(c => c.NODO)));
    const uniquePlanes = Array.from(new Set(data.filter(c => c.PLAN).map(c => c.PLAN)));

    const toggleSelect = (id: number) => {
        if (selectedClients.includes(id)) {
            setSelectedClients(selectedClients.filter(c => c !== id));
        } else {
            setSelectedClients([...selectedClients, id]);
        }
    };

    const handleSendManual = async () => {
        if (selectedClients.length === 0) return;
        if (!confirm(`¿Enviar recordatorio a ${selectedClients.length} clientes?`)) return;

        setSending(true);
        try {
            const fullClients = data
                .filter(c => selectedClients.includes(Number(c.ID)))
                .map(c => ({
                    ID: c.ID,
                    NOMBRE: c.NOMBRE,
                    CORREO: c.CORREO,
                    PLAN: c.PLAN,
                    VALOR: c.VALOR
                }));

            await apiService.postAction({
                action: "sendReminder",
                clients: fullClients,
                force: true
            });
            alert("✅ Mensajes de difusión enviados correctamente");
            setSelectedClients([]);
        } catch (e) {
            alert("❌ Error al enviar");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight flex items-center gap-4">
                        <span className="p-4 glass-card bg-amber-500/10 border-amber-500/20 text-amber-500">
                            <Mail className="w-10 h-10" />
                        </span>
                        Centro de <span className="text-gradient">Notificaciones</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-4 text-lg">
                        Difusión masiva de recordatorios y comunicados oficiales
                    </p>
                </div>

                <button
                    onClick={handleSendManual}
                    disabled={sending || selectedClients.length === 0}
                    className="flex items-center gap-3 px-8 py-5 premium-gradient text-white rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-30 disabled:grayscale hover:brightness-110"
                >
                    {sending ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-6 h-6" />}
                    <span>Enviar a {selectedClients.length} Seleccionados</span>
                </button>
            </div>

            {/* Buscador y Filtros */}
            <div className="flex flex-wrap items-center gap-6 glass-card p-6 border-white/5">
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar destinatarios por nombre, ID o dirección..."
                        className="w-full pl-14 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <select
                        className="bg-white/[0.03] border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-bold"
                        value={filterNodo}
                        onChange={(e) => setFilterNodo(e.target.value)}
                    >
                        <option value="TODOS" className="bg-slate-900">Todos los Nodos</option>
                        {uniqueNodos.map(n => <option key={n} value={n} className="bg-slate-900">{n}</option>)}
                    </select>

                    <select
                        className="bg-white/[0.03] border border-white/10 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all font-bold"
                        value={filterPlan}
                        onChange={(e) => setFilterPlan(e.target.value)}
                    >
                        <option value="TODOS" className="bg-slate-900">Todos los Planes</option>
                        {uniquePlanes.map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                    </select>
                </div>
            </div>

            <div className="glass-card border-white/5 overflow-hidden shadow-2xl relative">
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-white italic tracking-tight">Directorio de Difusión</h3>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                {filtered.length} Destinatarios filtrados
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const filteredIds = filtered.map(c => Number(c.ID));
                            const allSelected = filteredIds.every(id => selectedClients.includes(id));
                            if (allSelected) {
                                setSelectedClients(selectedClients.filter(id => !filteredIds.includes(id)));
                            } else {
                                setSelectedClients(Array.from(new Set([...selectedClients, ...filteredIds])));
                            }
                        }}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-amber-400 uppercase tracking-widest transition-all"
                    >
                        {filtered.length > 0 && filtered.every(c => selectedClients.includes(Number(c.ID)))
                            ? "Deseleccionar Filtrados"
                            : "Seleccionar Todos los Filtrados"}
                    </button>
                </div>

                <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-8">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                            <span className="text-xl font-bold text-gradient">Sincronizando destinatarios...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-slate-500">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">No se encontraron clientes para los filtros aplicados</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((client) => {
                                const isSelected = selectedClients.includes(Number(client.ID));
                                return (
                                    <motion.div
                                        key={client.ID}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => toggleSelect(Number(client.ID))}
                                        className={cn(
                                            "group relative p-6 rounded-3xl border cursor-pointer transition-all duration-300 select-none overflow-hidden",
                                            isSelected
                                                ? "bg-amber-500/10 border-amber-500/40 shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
                                                : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"
                                        )}
                                    >
                                        {/* Highlight Effect */}
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-[30px] rounded-full -mr-10 -mt-10" />
                                        )}

                                        <div className="flex items-start justify-between relative z-10">
                                            <div className="flex-1">
                                                <h4 className={cn("font-black text-lg transition-colors italic", isSelected ? "text-amber-400" : "text-white")}>
                                                    {client.NOMBRE}
                                                </h4>
                                                <p className="text-xs text-slate-500 mt-1 font-medium truncate max-w-[200px]">
                                                    {client.CORREO || "Sin correo electrónico"}
                                                </p>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 uppercase">
                                                        ID: {client.ID}
                                                    </span>
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                                                        {client.PLAN}
                                                    </span>
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                                                        {client.NODO}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border shadow-lg",
                                                isSelected
                                                    ? "bg-amber-500 text-blue-900 border-amber-400 rotate-[360deg]"
                                                    : "bg-white/5 text-slate-700 border-white/10"
                                            )}>
                                                <CheckCircle2 className={cn("w-5 h-5", isSelected ? "scale-110" : "scale-100 opacity-20")} />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
