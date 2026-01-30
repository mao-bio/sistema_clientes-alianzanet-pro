
"use client";

import { useEffect, useState } from "react";
import {
    Calculator,
    TrendingUp,
    TrendingDown,
    Save,
    History,
    DollarSign,
    CheckCircle2
} from "lucide-react";
import { apiService } from "@/lib/api";
import { formatCOP, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MESES_ES, getMesActualEs } from "@/lib/constants";
import MetricCard from "@/components/MetricCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

export default function FinanzasPage() {
    const [ingresos, setIngresos] = useState(0);
    const [gastos, setGastos] = useState({ internet: 0, energia: 0, otros: 0 });
    const [historial, setHistorial] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
    const [loading, setLoading] = useState(false);

    // Form states for closing
    const [cierreMes, setCierreMes] = useState(getMesActualEs());
    const [cierreAno, setCierreAno] = useState(new Date().getFullYear());
    const [nota, setNota] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [clients, history] = await Promise.all([
                apiService.getClientes(),
                apiService.getHistorial()
            ]);

            // Calculate auto income
            const totalIngresos = clients.reduce((acc: number, c: any) => {
                const val = typeof c.VALOR === 'string' ? parseFloat(c.VALOR.replace(/[$. ,]/g, '')) : c.VALOR || 0;
                return acc + (isNaN(val) ? 0 : val);
            }, 0);
            setIngresos(totalIngresos);

            if (Array.isArray(history)) {
                setHistorial(history);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const totalGastos = gastos.internet + gastos.energia + gastos.otros;
    const utilidad = ingresos - totalGastos;

    const handleSaveCierre = async () => {
        if (!confirm("¿Confirmar cierre de mes? Esto guardará el historial.")) return;

        try {
            await apiService.postAction({
                action: "saveHistorial",
                MES_REF: cierreMes,
                ANO_REF: cierreAno,
                INGRESOS: ingresos,
                GASTOS: totalGastos,
                UTILIDAD: utilidad,
                NOTAS: nota
            });
            alert("✅ Cierre guardado exitosamente");
            loadInitialData();
        } catch (e) {
            alert("❌ Error al guardar");
        }
    };

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight flex items-center gap-4">
                        <span className="p-4 glass-card bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                            <DollarSign className="w-10 h-10" />
                        </span>
                        Análisis <span className="text-gradient">Financiero</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-4 text-lg">
                        Gestión de ingresos, egresos y rentabilidad operativa
                    </p>
                </div>

                <div className="flex p-1.5 glass-card bg-white/5 border-white/10 rounded-[22px] shadow-2xl">
                    <button
                        onClick={() => setActiveTab('calculator')}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300",
                            activeTab === 'calculator'
                                ? "premium-gradient text-white shadow-lg shadow-amber-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Calculator className="w-4 h-4" />
                        Calculadora
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-300",
                            activeTab === 'history'
                                ? "premium-gradient text-white shadow-lg shadow-amber-500/20"
                                : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <History className="w-4 h-4" />
                        Historial
                    </button>
                </div>
            </div>

            {activeTab === 'calculator' ? (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="glass-card p-8 relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Ingresos Proyectados</h3>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Basado en Planes</p>
                                </div>
                            </div>
                            <div className="text-4xl font-black text-white italic tracking-tight relative z-10">{formatCOP(ingresos)}</div>
                        </div>

                        <div className="glass-card p-8 border-white/10 relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20">
                                    <TrendingDown className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Gastos Operativos</h3>
                                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-0.5">Egreso Mensual</p>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Inter/Ancho de Banda
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-amber-500/30 outline-none font-bold transition-all"
                                            value={gastos.internet}
                                            onChange={e => setGastos({ ...gastos, internet: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Energía/Suministros
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-amber-500/30 outline-none font-bold transition-all"
                                            value={gastos.energia}
                                            onChange={e => setGastos({ ...gastos, energia: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Otros Gastos Variables
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:ring-2 focus:ring-amber-500/30 outline-none font-bold transition-all"
                                        value={gastos.otros}
                                        onChange={e => setGastos({ ...gastos, otros: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Egresos:</span>
                                <span className="text-2xl font-black text-rose-500 italic tracking-tight">{formatCOP(totalGastos)}</span>
                            </div>
                        </div>

                        <div className="premium-gradient rounded-[32px] p-8 text-white flex flex-col justify-between shadow-[0_20px_50px_rgba(245,158,11,0.2)] relative overflow-hidden group">
                            {/* Patterns */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all group-hover:bg-white/20" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-[80px] -ml-32 -mb-32" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-sm font-black opacity-80 uppercase tracking-widest mb-1">Margen Operativo</h3>
                                        <div className="text-5xl font-black italic tracking-tighter">{formatCOP(utilidad)}</div>
                                    </div>
                                    <div className="px-4 py-2 bg-white/20 rounded-2xl font-black text-sm backdrop-blur-md border border-white/10">
                                        {ingresos > 0 ? ((utilidad / ingresos) * 100).toFixed(1) : 0}%
                                    </div>
                                </div>

                                <div className="h-1 bg-white/20 rounded-full mb-8 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${ingresos > 0 ? (utilidad / ingresos) * 100 : 0}%` }}
                                        className="h-full bg-white"
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            <div className="relative z-10 pt-8 border-t border-white/10">
                                <h4 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5" />
                                    Ejecutar Cierre de Caja
                                </h4>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold backdrop-blur-md">
                                        <select
                                            value={cierreMes}
                                            onChange={e => setCierreMes(e.target.value)}
                                            className="bg-transparent border-0 w-full text-white outline-none cursor-pointer appearance-none"
                                        >
                                            {MESES_ES.map(m => <option key={m} value={m} className="text-slate-900">{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold backdrop-blur-md">
                                        <input
                                            type="number"
                                            value={cierreAno}
                                            onChange={e => setCierreAno(Number(e.target.value))}
                                            className="bg-transparent border-0 w-full text-white outline-none"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveCierre}
                                    className="w-full py-5 bg-white text-orange-600 font-black rounded-[20px] hover:bg-orange-50 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
                                >
                                    Finalizar Periodo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-10">
                    <div className="glass-card p-8 min-h-[500px] border-white/5 relative">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tight">Rendimiento Histórico</h3>
                                <p className="text-sm text-slate-500">Comparativa de ingresos vs gastos por mes</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ingresos</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gastos</span>
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={historial}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="MES_REF" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                                />
                                <Bar dataKey="INGRESOS" name="Ingresos" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="GASTOS" name="Gastos" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Periodo / Referencia</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recaudo Total</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Gastos Oper.</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rendimiento</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Observaciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {historial.map((h: any, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.03] transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <p className="text-white font-black text-lg group-hover:text-amber-400 transition-colors uppercase italic">{h.MES_REF}</p>
                                            <p className="text-[10px] text-slate-500 font-black tracking-widest">{h.ANO_REF}</p>
                                        </td>
                                        <td className="px-8 py-6 text-amber-400 font-bold">{formatCOP(h.INGRESOS)}</td>
                                        <td className="px-8 py-6 text-rose-500 font-bold">{formatCOP(h.GASTOS)}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-emerald-500 font-black text-lg tracking-tight italic">{formatCOP(h.UTILIDAD)}</span>
                                                <span className="text-[10px] text-emerald-500/60 font-black uppercase">Rentable</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-400 text-sm italic font-medium max-w-[200px] truncate">{h.NOTAS || 'Sin anotaciones'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
