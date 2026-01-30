"use client";

import { CheckCircle2, X, MapPin, Wifi, Phone, Mail, Calendar, CreditCard, Tag, FileText, User } from "lucide-react";
import { formatCOP, cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ClientDetailViewProps {
    cliente: any;
    onClose: () => void;
}

export default function ClientDetailView({ cliente, onClose }: ClientDetailViewProps) {
    if (!cliente) return null;

    const sections = [
        {
            title: "Información Personal",
            icon: User,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            details: [
                { label: "ID Cliente", value: cliente.ID, icon: Tag },
                { label: "Nombre", value: cliente.NOMBRE, icon: User },
                { label: "Dirección", value: cliente.DIRECCION, icon: MapPin },
                { label: "Email", value: cliente.CORREO || 'No registrado', icon: Mail },
            ]
        },
        {
            title: "Detalles del Servicio",
            icon: Wifi,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            details: [
                { label: "Plan", value: cliente.PLAN, icon: Wifi },
                { label: "Mensualidad", value: formatCOP(cliente.VALOR), icon: CreditCard },
                { label: "Nodo", value: cliente.NODO, icon: MapPin },
                { label: "Usuario PPPoE", value: cliente.USUARIO || 'No asignado', icon: Tag },
                { label: "PIN", value: cliente.PIN || 'N/A', icon: Tag },
            ]
        },
        {
            title: "Estado & Pagos",
            icon: Calendar,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            details: [
                { label: "Estado Actual", value: cliente.ESTADO, icon: CheckCircle2 },
                { label: "Mes Pagado", value: cliente["MES PAGADO"], icon: Calendar },
                { label: "Último Pago", value: cliente["ULTIMO PAGO"] || 'Sin registro', icon: Calendar },
                { label: "Próximo Pago", value: cliente["PROXIMO PAGO"] || 'N/A', icon: Calendar },
                { label: "Fecha Instalación", value: cliente["FECHA DE INSTALACION"] || 'No registrada', icon: Calendar },
            ]
        },
        {
            title: "Contacto & Notas",
            icon: Phone,
            color: "text-rose-400",
            bg: "bg-rose-400/10",
            details: [
                { label: "WhatsApp 1", value: cliente["WHATSAPP 1"] || cliente["CONTACTO 1"] || 'No registrado', icon: Phone },
                { label: "Contacto 2", value: cliente["CONTACTO 2"] || 'No registrado', icon: Phone },
                { label: "Factura", value: cliente.FACTURA || 'N/A', icon: FileText },
            ]
        }
    ];

    return (
        <div className="space-y-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Header / Summary */}
            <div className="flex items-center gap-6 p-6 glass-card border-white/10 bg-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl -mr-16 -mt-16 rounded-full" />
                <div className="w-20 h-20 rounded-2xl premium-gradient flex items-center justify-center text-white text-3xl font-black shadow-2xl relative z-10">
                    {cliente.NOMBRE?.charAt(0)}
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white italic tracking-tight">{cliente.NOMBRE}</h2>
                    <div className="flex gap-3 mt-2">
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                            ID: {cliente.ID}
                        </span>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            cliente.ESTADO === 'ACTIVO' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-rose-500/20 text-rose-400 border-rose-500/20"
                        )}>
                            {cliente.ESTADO}
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid de Secciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-6 border-white/5 space-y-4 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <div className={cn("p-2 rounded-xl", section.bg, section.color)}>
                                <section.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-white text-sm uppercase tracking-widest italic">{section.title}</h3>
                        </div>
                        <div className="space-y-4">
                            {section.details.map((detail, dIdx) => (
                                <div key={dIdx} className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <detail.icon className={cn("w-3 h-3 opacity-40", section.color)} />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{detail.label}</span>
                                    </div>
                                    <span className="text-white font-bold text-sm pl-5 group-hover:text-amber-400 transition-colors">
                                        {detail.value || 'N/A'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Notas Especiales */}
            {cliente.NOTA && (
                <div className="glass-card p-6 border-rose-500/10 bg-rose-500/5 rounded-3xl">
                    <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Observaciones Especiales
                    </h3>
                    <p className="text-slate-300 italic text-sm font-medium leading-relaxed">
                        "{cliente.NOTA}"
                    </p>
                </div>
            )}

            <div className="flex justify-end pt-4">
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                >
                    Cerrar Detalle
                </button>
            </div>
        </div>
    );
}
