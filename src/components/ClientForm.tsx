
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiService } from "@/lib/api";
import {
    PLANES, NODOS, ESTADOS, TV_BOX_OPTS, MESES_ES, VALORES_CUOTA
} from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ClientForm({ initialData, onSuccess, onCancel }: ClientFormProps) {
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
        defaultValues: initialData || {
            ID: 0,
            NOMBRE: "",
            DIRECCION: "",
            PLAN: PLANES[0],
            VALOR: VALORES_CUOTA[0],
            ESTADO: "ACTIVO",
            NODO: NODOS[0],
            "MES PAGADO": MESES_ES[new Date().getMonth()],
            "FECHA DE PAGO": "1 al 10",
            "TV BOX": "NO"
        }
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const oldEstado = initialData?.ESTADO;
            const newEstado = data.ESTADO;

            const payload: any = {
                ...data,
                action: "saveCliente",
                NOMBRE: data.NOMBRE.toUpperCase(),
                DIRECCION: data.DIRECCION.toUpperCase(),
                "WHATSAPP 1": data["CONTACTO 1"],
                "WHATSAPP 2": data["CONTACTO 2"]
            };

            // Configuraciones automáticas para clientes nuevos
            if (!initialData) {
                delete payload.ID;
                const hoy = new Date();
                payload["FECHA DE INSTALACION"] = hoy.toLocaleDateString('es-CO');

                // Próximo pago: día 10 del mes siguiente
                const proximoMonth = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 10);
                payload["PROXIMO PAGO"] = proximoMonth.toLocaleDateString('es-CO');
            }

            const res = await apiService.postAction(payload);
            if (res.error) throw new Error(res.error);

            // Logic for automatic notifications based on state or creation
            try {
                if (!initialData) {
                    // New client -> Welcome email
                    await apiService.postAction({ ...payload, action: "sendWelcome" });
                } else if (oldEstado !== newEstado) {
                    // Estado cambió -> Notificar
                    if (newEstado === "ACTIVO") {
                        await apiService.postAction({ ...payload, action: "sendReconnection" });
                    } else if (newEstado === "SUSPENDIDO" || newEstado === "INACTIVO") {
                        await apiService.postAction({ ...payload, action: "sendDeactivation" });
                    }
                }

                // Si se cambió manualmente el MES PAGADO en edición, actualizamos las fechas relacionadas
                if (initialData["MES PAGADO"] !== data["MES PAGADO"]) {
                    payload["ULTIMO PAGO"] = new Date().toLocaleDateString('es-CO');

                    const idx = MESES_ES.indexOf(data["MES PAGADO"]);
                    const proximoYear = new Date().getFullYear() + (idx === 11 ? 1 : 0);
                    const proximaFecha = new Date(proximoYear, (idx + 1) % 12, 10);
                    payload["PROXIMO PAGO"] = proximaFecha.toLocaleDateString('es-CO');

                    // Re-enviamos el comando para guardar estos cambios de fecha si es necesario
                    await apiService.postAction(payload);
                }
            } catch (e) {
                console.warn("Notification email could not be sent", e);
            }

            onSuccess();
        } catch (error) {
            alert("Error al guardar cliente");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sección Personal */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Información Personal</h3>

                    {initialData && (
                        <div className="form-group">
                            <label>ID Cliente</label>
                            <input
                                {...register("ID")}
                                type="number"
                                className="input-field bg-slate-900/50 text-slate-500"
                                readOnly
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Nombre Completo</label>
                        <input {...register("NOMBRE", { required: true })} className="input-field uppercase" />
                    </div>

                    <div className="form-group">
                        <label>Dirección</label>
                        <input {...register("DIRECCION")} className="input-field uppercase" />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input {...register("CORREO")} type="email" className="input-field" />
                    </div>
                </div>

                {/* Sección Servicio */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Servicio</h3>

                    <div className="form-group">
                        <label>Plan</label>
                        <select {...register("PLAN")} className="input-field">
                            {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Valor Mensual</label>
                        <select {...register("VALOR")} className="input-field">
                            {VALORES_CUOTA.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Nodo</label>
                        <select {...register("NODO")} className="input-field">
                            {NODOS.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Estado</label>
                        <select {...register("ESTADO")} className="input-field">
                            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>TV BOX</label>
                        <select {...register("TV BOX")} className="input-field">
                            {TV_BOX_OPTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                {/* Sección Técnica y Pagos */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Detalles Técnicos & Pagos</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Usuario PPPoE</label>
                            <input {...register("USUARIO")} className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>PIN/Clave</label>
                            <input {...register("PIN")} className="input-field" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Último Mes Pagado</label>
                        <select {...register("MES PAGADO")} className="input-field">
                            {MESES_ES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Contacto 1 (WA)</label>
                            <input {...register("CONTACTO 1")} className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Contacto 2</label>
                            <input {...register("CONTACTO 2")} className="input-field" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label>Notas Adicionales</label>
                <textarea {...register("NOTA")} className="input-field min-h-[80px]" />
            </div>

            <div className="mt-4 p-4 glass-card bg-amber-500/5 border-amber-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <Loader2 className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Notificación Automática</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enviar detalles por correo electrónico</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {initialData ? "Actualizar Cliente" : "Guardar Nuevo Cliente"}
                </button>
            </div>

            <style jsx>{`
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #94a3b8;
          margin-left: 0.25rem;
        }
        .input-field {
          background-color: #020617;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
      `}</style>
        </form>
    );
}
