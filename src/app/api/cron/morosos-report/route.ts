import { NextResponse } from 'next/server';
import { apiService } from '@/lib/api';
import { getDaysSince } from '@/lib/utils';
import { getMesActualEs } from '@/lib/constants';

// Forzar que sea dinámico y no se cachee
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // Seguridad: Verificar el token del cron para evitar ejecuciones no autorizadas
    // En producción (Vercel), se recomienda usar una variable de entorno CRON_SECRET
    const CRON_SECRET = process.env.CRON_SECRET || 'mi_secreto_local_de_seguridad';

    if (key !== CRON_SECRET) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        console.log("🚀 Iniciando tarea programada: Reporte mensual de morosos (25 de cada mes)");

        const mes = getMesActualEs();
        const data = await apiService.getMorosos(mes);

        if (!Array.isArray(data)) {
            throw new Error('La respuesta de Supabase no es un array');
        }

        // Aplicamos la misma lógica que en la UI:
        // Filtrar aquellos que el sistema detecta como morosos (> 30 días)
        const morosos = data.filter(c => {
            const diasMora = getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]);
            return diasMora > 30;
        });

        if (morosos.length === 0) {
            console.log("✅ No se encontraron morosos para el reporte de hoy.");
            return NextResponse.json({
                status: 'success',
                message: 'No se encontraron morosos hoy',
                date: new Date().toISOString()
            });
        }

        console.log(`📊 Generando reporte para ${morosos.length} morosos.`);

        const reportData = morosos.map(c => ({
            nombre: c.NOMBRE,
            dias: getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]),
            deuda: c.VALOR
        }));

        // Enviar al Bridge de Google Apps Script (que maneja Email y Telegram)
        const response = await apiService.postAction({
            action: "sendAdminReport",
            destinatario: "alianzanet9@gmail.com",
            morosos: reportData
        });

        console.log("✅ Reporte enviado exitosamente al administrador.");

        return NextResponse.json({
            status: 'success',
            count: morosos.length,
            bridge_response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Error en la tarea programada:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
