import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { API_URL, TOKEN } from './constants';

const VALID_CLIENT_COLUMNS = [
    "ID", "NOMBRE", "DIRECCION", "FECHA DE INSTALACION", "PLAN", "VALOR",
    "FECHA DE PAGO", "MES PAGADO", "NODO", "TV BOX", "USUARIO", "PIN",
    "ESTADO", "ULTIMO PAGO", "PROXIMO PAGO", "FACTURA", "CONTACTO 1",
    "CONTACTO 2", "CORREO", "WHATSAPP 1", "WHATSAPP 2", "NOTA"
];

function filterPayload(data: any) {
    const filtered: any = {};
    for (const key of VALID_CLIENT_COLUMNS) {
        if (key in data) {
            let value = data[key];

            // Forzar tipos correctos para Supabase
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
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('ID', { ascending: true });

        if (error) throw error;
        return data; // Ya no requiere mapeo
    },

    async postAction(payload: any) {
        const { action, ...data } = payload;
        const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || "MI_TOKEN_SEGURO";

        if (action === "saveCliente") {
            const dbData = filterPayload(data);
            const { error } = await supabase
                .from('clientes')
                .upsert(dbData, { onConflict: 'ID' });
            if (error) throw error;
            return { status: "success" };
        }

        if (action === "deleteCliente") {
            const { error } = await supabase
                .from('clientes')
                .delete()
                .eq('ID', data.ID);
            if (error) throw error;
            return { status: "deleted" };
        }

        // Email GAS Bridge
        if (action.startsWith("send")) {
            console.log("📤 Ejecutando acción de email:", action, payload);
            const currentToken = TOKEN;
            const response = await fetch(`${API_URL}?action=${action}&token=${currentToken}`, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ ...payload, token: currentToken })
            });

            const resultText = await response.text();
            console.log("📩 Respuesta del servidor de correos (GAS):", resultText);

            if (!response.ok) throw new Error("Error en servidor de correos (GAS): " + resultText);
            return { status: "email_sent", response: resultText };
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

    async getMorosos(mes: string) {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .neq('MES PAGADO', mes);

        if (error) throw error;
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
