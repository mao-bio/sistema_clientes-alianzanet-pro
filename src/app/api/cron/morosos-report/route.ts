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
    const CRON_SECRET = process.env.CRON_SECRET || 'mi_secreto_local_de_seguridad';

    if (key !== CRON_SECRET) {
        console.warn("⚠️ Intento de ejecución de cron sin llave válida.");
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        console.log("🚀 [CRON] Iniciando tarea programada: Reporte mensual de morosos");

        const mes = getMesActualEs();
        console.log(`📅 Mes actual evaluado: ${mes}`);

        const data = await apiService.getMorosos(mes);

        if (!Array.isArray(data)) {
            console.error("❌ Los datos de Supabase no son un array:", data);
            throw new Error('La respuesta de Supabase no es un array');
        }

        console.log(`📥 Clientes recuperados que no han pagado ${mes}: ${data.length}`);

        // Aplicamos la misma lógica que en la UI:
        // Filtrar aquellos que el sistema detecta como morosos (> 30 días)
        const morosos = data.filter(c => {
            const diasMora = getDaysSince(c["ULTIMO PAGO"] || c["FECHA DE INSTALACION"]);
            return diasMora > 30;
        });

        if (morosos.length === 0) {
            console.log("✅ No se encontraron morosos críticos (>30 días) para el reporte de hoy.");
            return NextResponse.json({
                status: 'success',
                message: 'No se encontraron morosos críticos hoy',
                date: new Date().toISOString()
            });
        }

        console.log(`📊 Generando reporte para ${morosos.length} morosos críticos.`);

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

        console.log("✅ Reporte enviado exitosamente al bridge (GAS).");

        // 2. Enviar a Telegram DIRECTAMENTE
        let telegram_response = null;
        try {
            telegram_response = await apiService.sendTelegramReport(reportData);
            console.log("✅ Reporte enviado exitosamente a Telegram.");
        } catch (tgError) {
            console.error("❌ Error enviando a Telegram:", tgError);
        }

        return NextResponse.json({
            status: 'success',
            count: morosos.length,
            bridge_response: response,
            telegram_response: telegram_response,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ FATAL ERROR en Cron Job:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
