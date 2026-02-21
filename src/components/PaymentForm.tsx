
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiService } from "@/lib/api";
import { formatCOP, MESES_ES } from "@/lib/utils";
import { Loader2, DollarSign } from "lucide-react";

interface PaymentFormProps {
    cliente: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PaymentForm({ cliente, onSuccess, onCancel }: PaymentFormProps) {
    const [loading, setLoading] = useState(false);
    const [adelanto, setAdelanto] = useState(0);

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: {
            mes: MESES_ES[new Date().getMonth()],
            sendReceipt: true
        }
    });

    const selectedMes = watch("mes");
    const valorMensual = typeof cliente.VALOR === 'string'
        ? parseFloat(cliente.VALOR.replace(/[$. ,]/g, ''))
        : cliente.VALOR;

    const totalPagar = valorMensual * (adelanto > 0 ? adelanto : 1);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            // Logic for calculating next payment dates based on advancement
            // Note: This logic duplicates some backend/frontend logic from Streamlit
            // ideally the API should handle "registerPayment" action more robustly
            // but we will stick to what the API likely expects: updating the client record.

            const payload: any = {
                ...cliente,
                action: "saveCliente",
                "MES PAGADO": data.mes,
                "ULTIMO PAGO": new Date().toLocaleDateString('es-CO'),
                "VALOR_RECIBO": totalPagar // For email receipt
            };

            // Calcular próximo pago: día 10 del mes siguiente al pagado
            const idx = MESES_ES.indexOf(data.mes);
            const proximoYear = new Date().getFullYear() + (idx === 11 ? 1 : 0);
            const proximoMonthIdx = (idx + 1 + (adelanto > 0 ? adelanto - 1 : 0)) % 12;
            const proximaFecha = new Date(proximoYear, proximoMonthIdx, 10);
            payload["PROXIMO PAGO"] = proximaFecha.toLocaleDateString('es-CO');

            if (adelanto > 0) {
                // Find index of selected month
                const idx = MESES_ES.indexOf(data.mes);
                const newIdx = (idx + adelanto - 1) % 12;
                payload["MES PAGADO"] = MESES_ES[newIdx];
                payload["NOTA"] = `Pago adelantado por ${adelanto} meses. ${cliente.NOTA || ''}`;
            }

            // Send update
            await apiService.postAction(payload);

            // Send receipt if requested
            if (data.sendReceipt) {
                try {
                    await apiService.postAction({ ...payload, action: "sendReceipt" });
                } catch (e) {
                    console.error("Error sending receipt", e);
                }
            }

            onSuccess();
        } catch (error: any) {
            console.error("Payment Error:", error);
            alert("Error al procesar pago: " + (error.message || "Error desconocido"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-indigo-300 font-bold uppercase tracking-wider">Cliente</p>
                    <h3 className="text-xl font-bold text-white">{cliente.NOMBRE}</h3>
                </div>
                <div className="sm:text-right">
                    <p className="text-sm text-indigo-300 font-bold uppercase tracking-wider">Plan Actual</p>
                    <p className="text-white font-mono">{cliente.PLAN} - {formatCOP(valorMensual)}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase">Mes a Pagar</label>
                        <select
                            {...register("mes")}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
                        >
                            {MESES_ES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 uppercase">Pago Adelantado</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[0, 3, 6].map(months => (
                                <button
                                    key={months}
                                    type="button"
                                    onClick={() => setAdelanto(months)}
                                    className={`px-2 py-3 rounded-xl border text-sm font-bold transition-all ${adelanto === months ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:bg-slate-900'}`}
                                >
                                    {months === 0 ? '1 Mes' : `${months} Meses`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-slate-400 font-medium">Total a Cobrar</span>
                        <span className="text-3xl font-bold text-emerald-400">{formatCOP(totalPagar)}</span>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-900 transition-colors">
                        <input type="checkbox" {...register("sendReceipt")} className="w-5 h-5 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-white font-medium">Enviar recibo por correo automáticamente</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                        Registrar Pago
                    </button>
                </div>
            </form>
        </div>
    );
}
