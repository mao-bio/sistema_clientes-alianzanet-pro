
"use client";

import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Send,
    MessageCircle,
    Calendar,
    RefreshCcw,
    CheckCircle2,
    CreditCard,
    FileText
} from "lucide-react";
import { apiService } from "@/lib/api";
import { formatCOP, makeWhatsAppLink, cn, getDaysSince } from "@/lib/utils";
import Badge from "@/components/Badge";
import { getMesActualEs, MESES_ES } from "@/lib/constants";
import Modal from "@/components/Modal";
import PaymentForm from "@/components/PaymentForm";
import { motion, AnimatePresence } from "framer-motion";

export default function MorososPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [mes, setMes] = useState(getMesActualEs());
    const [search, setSearch] = useState("");
    const [sendingBatch, setSendingBatch] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<any | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await apiService.getMorosos(mes);
            setData(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [mes]);

    // Automatic Notification Logic (60+ days)
    useEffect(() => {
        if (loading || data.length === 0) return;

        const checkNotifications = async () => {
            const criticalDefaulters = data.filter(c => {
                const days = getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]);
                const alreadyNotified = c.FECHA_NOTIFICACION && getDaysSince(c.FECHA_NOTIFICACION) < 30; // Notified recently
                return days > 60 && !alreadyNotified;
            });

            if (criticalDefaulters.length > 0) {
                console.log(`⚠️ Detectados ${criticalDefaulters.length} clientes críticos (>60 días). Iniciando notificaciones...`);

                try {
                    // 1. Send Admin Report
                    await apiService.postAction({
                        action: "sendAdminReport",
                        destinatario: "alianzanet9@gmail.com",
                        morosos: criticalDefaulters.map(c => ({
                            nombre: c.NOMBRE,
                            dias: getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]),
                            deuda: c.VALOR
                        }))
                    });

                    // 2. Send Client Suspensions & Update DB
                    for (const client of criticalDefaulters) {
                        if (client.CORREO) {
                            await apiService.postAction({
                                action: "sendSuspensionNotice",
                                ...client
                            });
                        }

                        // Update FECHA_NOTIFICACION in DB to avoid loop
                        await apiService.postAction({
                            action: "saveCliente",
                            ...client,
                            FECHA_NOTIFICACION: new Date().toISOString()
                        });
                    }
                    console.log("✅ Notificaciones automáticas completadas.");
                } catch (error) {
                    console.error("❌ Error en notificaciones automáticas:", error);
                }
            }
        };

        const timer = setTimeout(checkNotifications, 3000); // Small delay to ensure data load
        return () => clearTimeout(timer);
    }, [data, loading]);

    const filtered = data
        .filter(c => {
            const matchesSearch =
                c.NOMBRE?.toLowerCase().includes(search.toLowerCase()) ||
                c.DIRECCION?.toLowerCase().includes(search.toLowerCase()) ||
                String(c.ID).includes(search);

            // 30 Days Logic: Only show if > 30 days overdue
            const days = getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]);
            return matchesSearch && days > 30;
        });

    const handleTelegramReport = async () => {
        if (filtered.length === 0) return;
        if (!confirm(`¿Enviar reporte de ${filtered.length} morosos a Telegram y Correo Admin?`)) return;

        setSendingBatch(true);
        try {
            const reportData = filtered.map(c => ({
                nombre: c.NOMBRE,
                dias: getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]),
                deuda: c.VALOR
            }));

            await apiService.postAction({
                action: "sendAdminReport",
                destinatario: "alianzanet9@gmail.com",
                morosos: reportData
            });
            alert("✅ Reporte enviado exitosamente");
        } catch (e) {
            alert("❌ Error al enviar reporte");
        } finally {
            setSendingBatch(false);
        }
    };

    const handleBatchEmails = async () => {
        if (filtered.length === 0) return;
        if (!confirm(`¿Estás seguro de enviar recordatorios a los ${filtered.length} clientes filtrados?`)) return;

        setSendingBatch(true);
        try {
            // Enviamos los datos completos para que GAS no tenga que buscar en Sheets
            const clientsData = filtered.map(c => ({
                ID: c.ID,
                NOMBRE: c.NOMBRE,
                CORREO: c.CORREO,
                PLAN: c.PLAN,
                VALOR: c.VALOR,
                MES_PAGADO: c["MES PAGADO"],
                TELEFONO: c["WHATSAPP 1"]
            }));

            await apiService.postAction({
                action: "sendReminder",
                clients: clientsData,
                mes: mes
            });
            alert("✅ " + filtered.length + " Recordatorios enviados (Full Data Mode)");
        } catch (e) {
            alert("❌ Error al enviar recordatorios");
        } finally {
            setSendingBatch(false);
        }
    };

    const handlePayment = (cliente: any) => {
        setSelectedClient(cliente);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const totalDeuda = filtered.reduce((acc, curr) => {
        const val = typeof curr.VALOR === 'string' ? parseFloat(curr.VALOR.replace(/[$. ,]/g, '')) : curr.VALOR || 0;
        return acc + (isNaN(val) ? 0 : val);
    }, 0);

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-white tracking-tight flex items-center gap-4">
                        <span className="p-4 glass-card bg-rose-500/10 border-rose-500/20 text-rose-500">
                            <AlertTriangle className="w-10 h-10" />
                        </span>
                        Control de <span className="text-gradient">Morosidad</span>
                    </h1>
                    <p className="text-slate-400 font-medium mt-4 text-lg">
                        Monitoreo y gestión de saldos pendientes por periodo
                    </p>
                </div>

                <div className="flex items-center gap-4 glass-card p-2 border-white/10 pr-6">
                    <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Periodo de Consulta</span>
                        <select
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            className="bg-transparent text-white font-black text-lg focus:outline-none appearance-none cursor-pointer"
                        >
                            {MESES_ES.map(m => (
                                <option key={m} value={m} className="bg-slate-900">{m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 glass-card border-rose-500/20 bg-rose-500/5 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-rose-500/10 blur-[50px] rounded-full group-hover:bg-rose-500/20 transition-all" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-black text-rose-400 uppercase tracking-[0.2em] mb-3">Total Pendiente Recaudar</p>
                            <h2 className="text-5xl font-black text-white tracking-tight italic">{formatCOP(totalDeuda)}</h2>
                        </div>
                        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 shadow-lg shadow-rose-500/10">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 glass-card border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/10 blur-[50px] rounded-full group-hover:bg-amber-500/20 transition-all" />
                    <div className="relative z-10 text-center md:text-left">
                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3">Clientes en Estado de Mora</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">{filtered.length} <span className="text-lg md:text-xl font-medium text-slate-500 italic">Usuarios</span></h2>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 relative z-10 w-full md:w-auto">
                        <button
                            onClick={handleTelegramReport}
                            disabled={sendingBatch || filtered.length === 0}
                            className="flex items-center justify-center gap-2 px-6 py-4 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-2xl font-black transition-all hover:bg-sky-500 hover:text-white disabled:opacity-30 disabled:grayscale hover:shadow-lg hover:shadow-sky-500/20"
                            title="Enviar reporte a Telegram"
                        >
                            <FileText className="w-5 h-5" />
                            <span className="text-sm">Reporte TG</span>
                        </button>
                        <button
                            onClick={handleBatchEmails}
                            disabled={sendingBatch || filtered.length === 0}
                            className="flex items-center justify-center gap-3 px-6 md:px-8 py-4 md:py-5 premium-gradient text-white rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-30 disabled:grayscale hover:brightness-110"
                        >
                            {sendingBatch ? <RefreshCcw className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6" />}
                            <span className="text-sm md:text-base">Recordatorio Masivo</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div className="glass-card p-6 border-white/5 relative group">
                <div className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar moroso por nombre, dirección o ID..."
                    className="w-full pl-16 pr-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all text-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Tabla Morosos */}
            <div className="glass-card border-white/5 overflow-hidden shadow-2xl relative">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente & Estado</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Suscripción & Deuda</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Información de Contacto</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Gestión de Cobro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                                                <span className="text-xl font-bold text-gradient">Analizando cartera...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-32 text-center">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center gap-6"
                                            >
                                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                    <CheckCircle2 className="w-12 h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-3xl font-black text-white italic">¡Recaudo Completo!</p>
                                                    <p className="text-slate-400 font-medium">No se registran deudas pendientes para {mes}.</p>
                                                </div>
                                            </motion.div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((cliente, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-white/[0.03] transition-all duration-300"
                                        >
                                            <td className="px-8 py-6">
                                                <p className="text-white font-black text-lg group-hover:text-rose-400 transition-colors">{cliente.NOMBRE}</p>
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="danger">PENDIENTE</Badge>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase">ID: {cliente.ID}</span>
                                                    </div>
                                                    <div className={cn(
                                                        "text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
                                                        getDaysSince(cliente["ULTIMO PAGO"] || cliente["FECHA DE INSTALACION"]) > 60 ? "text-rose-500" : "text-amber-500"
                                                    )}>
                                                        <Calendar className="w-3 h-3" />
                                                        {getDaysSince(cliente["ULTIMO PAGO"] || cliente["FECHA DE INSTALACION"])} Días de Mora
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{cliente.PLAN}</p>
                                                <p className="text-2xl font-black text-rose-500 tracking-tight italic">{formatCOP(cliente.VALOR)}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-white font-bold text-sm">{cliente.CORREO || 'No registrado'}</p>
                                                    <p className="text-slate-500 text-xs font-black tracking-wider uppercase">{cliente["WHATSAPP 1"] || 'Sin teléfono'}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handlePayment(cliente)}
                                                        className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20"
                                                        title="Registrar Pago"
                                                    >
                                                        <CreditCard className="w-5 h-5" />
                                                    </button>
                                                    {cliente["WHATSAPP 1"] && (
                                                        <a
                                                            href={makeWhatsAppLink(cliente["WHATSAPP 1"], cliente.NOMBRE)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-emerald-500/20"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                            Ejecutar Cobro
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Pago"
            >
                <PaymentForm
                    cliente={selectedClient}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}


