
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  RefreshCcw,
  Plus
} from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { apiService } from "@/lib/api";
import { formatCOP, cn } from "@/lib/utils";
import { getMesActualEs } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const clients = await apiService.getClientes();
      setData(clients);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Cargando sistema...</p>
      </div>
    );
  }

  // Calculate Metrics
  const totalClients = data.length;
  const activeClients = data.filter(c => c.ESTADO === "ACTIVO").length;
  const mesActual = getMesActualEs();
  const morosos = data.filter(c => c["MES PAGADO"] !== mesActual).length;

  const totalRevenue = data.reduce((acc, c) => {
    const val = typeof c.VALOR === 'string'
      ? parseFloat(c.VALOR.replace(/[$. ,]/g, ''))
      : (c.VALOR || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // Chart Data
  const estadoData = [
    { name: "Activos", value: activeClients, color: "#10b981" },
    { name: "Suspendidos", value: data.filter(c => c.ESTADO === "SUSPENDIDO").length, color: "#f59e0b" },
    { name: "Inactivos", value: data.filter(c => c.ESTADO === "INACTIVO").length ?? 0, color: "#ef4444" },
  ];

  const nodoCounts = data.reduce((acc: any, c) => {
    const nodo = c.NODO || "SIN NODO";
    acc[nodo] = (acc[nodo] || 0) + 1;
    return acc;
  }, {});

  const nodoData = Object.keys(nodoCounts).map(nodo => ({
    name: nodo,
    value: nodoCounts[nodo]
  })).sort((a, b) => b.value - a.value).slice(0, 8);

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">
            Panel de <span className="text-gradient">Control</span>
          </h1>
          <p className="text-slate-400 font-medium mt-2 text-lg">
            Resumen operativo de <span className="text-amber-400 font-bold">ALIANZANET</span> para {mesActual}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="p-4 glass-card text-amber-400 hover:text-amber-300 transition-all hover:scale-105 disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-6 h-6", refreshing && "animate-spin")} />
          </button>
          <button className="flex items-center gap-2 px-6 py-4 premium-gradient text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 hover:brightness-110">
            <Plus className="w-6 h-6" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Clientes"
          value={totalClients}
          icon={Users}
          color="amber"
        />
        <MetricCard
          title="Ingresos Mensuales"
          value={formatCOP(totalRevenue)}
          icon={Wallet}
          color="emerald"
        />
        <MetricCard
          title="Clientes Activos"
          value={activeClients}
          icon={CheckCircle2}
          color="blue"
        />
        <MetricCard
          title="Mora Proyectada"
          value={morosos}
          icon={AlertCircle}
          color="rose"
          delta={{ value: morosos, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pies Chart */}
        <div className="glass-card p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">Estado de Red</h3>
              <p className="text-sm text-slate-400">Distribución actual de servicios</p>
            </div>
            <div className="px-4 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20 animate-pulse">
              EN VIVO
            </div>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estadoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={130}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {estadoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8">
            {estadoData.map((item) => (
              <div key={item.name} className="flex flex-col items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">{item.name}</span>
                </div>
                <span className="text-2xl font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-white tracking-tight">Carga por Nodo</h3>
              <p className="text-sm text-slate-400">Top 8 nodos con más conexiones</p>
            </div>
            <Calendar className="w-6 h-6 text-slate-500" />
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nodoData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {nodoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorBar)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
