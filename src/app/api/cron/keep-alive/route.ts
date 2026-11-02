import { NextResponse } from 'next/server';
import { supabase } from '@/lib/api';

// Evita caché: cada ejecución debe consultar realmente la base de datos.
export const dynamic = 'force-dynamic';

/**
 * Keep-alive de Supabase.
 *
 * El plan gratuito pausa los proyectos con poca actividad en 7 días.
 * Vercel Cron llama a este endpoint cada pocos días (ver vercel.json) y se
 * hace una lectura mínima en la base de datos para registrar actividad.
 *
 * Seguridad: si existe la variable CRON_SECRET, Vercel envía automáticamente
 * `Authorization: Bearer <CRON_SECRET>` y aquí se exige. No devuelve datos
 * de clientes, solo el estado de la consulta.
 */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const started = Date.now();
    const tables = ['clientes', 'historial'] as const;
    const results: Record<string, 'ok' | string> = {};

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*', { head: true, count: 'exact' }).limit(1);
        results[table] = error ? error.message : 'ok';
    }

    const failed = Object.values(results).some(r => r !== 'ok');
    if (failed) {
        console.error('❌ [KEEP-ALIVE] Falló la consulta a Supabase:', results);
    } else {
        console.log('✅ [KEEP-ALIVE] Supabase activo:', results);
    }

    return NextResponse.json(
        { status: failed ? 'error' : 'ok', results, ms: Date.now() - started, timestamp: new Date().toISOString() },
        { status: failed ? 500 : 200 }
    );
}
