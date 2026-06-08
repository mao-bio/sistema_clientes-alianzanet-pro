import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { API_URL, TOKEN } from './constants';

const VALID_CLIENT_COLUMNS = [
    "ID", "NOMBRE", "DIRECCION", "FECHA DE INSTALACION", "PLAN", "VALOR",
    "FECHA DE PAGO", "MES PAGADO", "NODO", "TV BOX", "USUARIO", "PIN",
    "ESTADO", "ULTIMO PAGO", "PROXIMO PAGO", "FACTURA", "CONTACTO 1",
    "CONTACTO 2", "CORREO", "WHATSAPP 1", "WHATSAPP 2", "NOTA", "FECHA_NOTIFICACION"
];

function filterPayload(data: any) {
    const filtered: any = {};
    for (const key of VALID_CLIENT_COLUMNS) {
        if (key in data) {
            let value = data[key];

            if (key === "ID") value = Number(value);
            if (key === "VALOR" && typeof value === 'string') {
                value = parseFloat(value.replace(/[$. ,]/g, '')) || 0;
            }

            filtered[key] = value;
        }
    }
    return filtered;
}

export const apiService = {
    async getClientes() {
        console.log("🔍 Fetching todos los clientes...");
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('ID', { ascending: true });

        if (error) {
            console.error("❌ Error en getClientes:", error);
            throw error;
        }
        return data;
    },

    async postAction(payload: any) {
        const { action, ...data } = payload;
        // Priorizar el token de constantes si el env no existe
        const currentToken = process.env.NEXT_PUBLIC_API_TOKEN || TOKEN;

        console.log(`🚀 Ejecutando acción: ${action}`, { action });

        if (action === "saveCliente") {
            const dbData = filterPayload(data);
            const { error } = await supabase
                .from('clientes')
                .upsert(dbData, { onConflict: 'ID' });
            if (error) {
                console.error("❌ Error en saveCliente:", error);
                throw error;
            }
            return { status: "success" };
        }

        if (action === "deleteCliente") {
            const deletedId = Number(data.ID);
            console.log(`🗑️ Eliminando cliente ID: ${deletedId}`);

            const { error: deleteError } = await supabase
                .from('clientes')
                .delete()
                .eq('ID', deletedId);

            if (deleteError) throw deleteError;

            const { data: clientsToUpdate, error: fetchError } = await supabase
                .from('clientes')
                .select('ID')
                .gt('ID', deletedId)
                .order('ID', { ascending: true });

            if (fetchError) throw fetchError;

            if (clientsToUpdate && clientsToUpdate.length > 0) {
                for (const client of clientsToUpdate) {
                    await supabase
                        .from('clientes')
                        .update({ ID: client.ID - 1 })
                        .eq('ID', client.ID);
                }
            }

            return { status: "deleted" };
        }

        // Email GAS Bridge
        if (action.startsWith("send")) {
            console.log(`📤 Enviando reporte/email (${action}) a GAS...`);

            try {
                const response = await fetch(`${API_URL}?action=${action}&token=${currentToken}`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ ...payload, token: currentToken })
                });

                const resultText = await response.text();
                console.log("📩 Respuesta de GAS:", resultText);

                if (!response.ok) throw new Error(`GAS Error: ${resultText}`);
                return { status: "email_sent", response: resultText };
            } catch (err) {
                console.error("❌ Error conectando con GAS:", err);
                throw err;
            }
        }

        if (action === "saveHistorial") {
            const { error } = await supabase
                .from('historial')
                .insert(data);
            if (error) throw error;
            return { status: "saved" };
        }

        return { error: "Acción no manejada" };
    },

    async sendTelegramReport(reportData: any[]) {
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            console.warn("⚠️ Telegram no configurado (falta TOKEN o CHAT_ID)");
            return { error: "Telegram no configurado" };
        }

        const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long' });
        let message = `📊 *REPORTE DE MOROSOS - ${date.toUpperCase()}* 📊\n\n`;

        if (reportData.length === 0) {
            message += "✅ No hay morosos críticos hoy.";
        } else {
            message += `Se han detectado *${reportData.length}* clientes en mora:\n\n`;

            reportData.forEach((c, i) => {
                const total = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(c.deuda).replace('COP', '');
                message += `${i + 1}. *${c.nombre}*\n   ⏳ ${c.dias} días | 💰 ${total}\n\n`;
            });

            const totalDeuda = reportData.reduce((acc, c) => acc + (c.deuda || 0), 0);
            const totalFmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalDeuda).replace('COP', '');
            message += `➖➖➖➖➖➖➖➖➖➖\n💸 *DEUDA TOTAL: ${totalFmt}*`;
        }

        try {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("❌ Error enviando a Telegram:", error);
            throw error;
        }
    },

    async getMorosos(mes: string) {
        console.log(`📉 Buscando morosos para el mes: ${mes}`);
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .neq('MES PAGADO', mes);

        if (error) {
            console.error("❌ Error en getMorosos:", error);
            throw error;
        }
        return data;
    },

    async getHistorial() {
        const { data, error } = await supabase
            .from('historial')
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;
        return data;
    }
};

