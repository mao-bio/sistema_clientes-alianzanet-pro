import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const MESES_ES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

export function formatCOP(value: number | string) {
    const numericValue = typeof value === 'string'
        ? parseFloat(value.replace(/[$. ,]/g, ''))
        : value;

    if (isNaN(numericValue)) return '$0';

    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue).replace('COP', '').trim();
}

export function makeWhatsAppLink(number: string | number, name: string) {
    if (!number) return '';
    let cleanNumber = String(number).replace(/\D/g, '');

    // Lógica inteligente de prefijos (Colombia/Ecuador)
    if (cleanNumber.length === 10) {
        if (cleanNumber.startsWith('3')) {
            cleanNumber = '57' + cleanNumber;
        } else if (cleanNumber.startsWith('09')) {
            cleanNumber = '593' + cleanNumber.substring(1);
        } else if (cleanNumber.startsWith('9')) {
            cleanNumber = '593' + cleanNumber;
        }
    } else if (cleanNumber.length === 9 && cleanNumber.startsWith('9')) {
        cleanNumber = '593' + cleanNumber;
    }

    const msg = `Hola ${name.toUpperCase()} 👋, te saludamos de ALIANZANET. 🛰️\n\nTe informamos que no hemos registrado tu pago del mes actual. 💳\n\nPor favor, envíanos el soporte de pago para evitar interrupciones en tu servicio. ¡Gracias! ✨`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
}

export function getDaysSince(dateString?: string | null): number {
    if (!dateString) return 999;
    let date = new Date(dateString);

    // Soporte para DD/MM/YYYY
    if (isNaN(date.getTime()) && dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
            date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
    }

    if (isNaN(date.getTime())) return 0;

    const diffTime = Math.abs(new Date().getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getNodeColor(nodeName: string) {
    if (!nodeName) return { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" };

    const nodes: Record<string, { bg: string, text: string, border: string }> = {
        "NODO 1": { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
        "NODO 2": { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
        "NODO 3": { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
        "NODO 4": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
        "NODO 5": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
        "FIBRA": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
        "RADIO": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
    };

    const upperNode = nodeName.toUpperCase();

    // Si existe en el mapa predefinido
    if (nodes[upperNode]) return nodes[upperNode];

    // Si no, generar un color basado en el hash del nombre
    const colors = [
        { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
        { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
        { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
        { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
        { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
        { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
        { bg: "bg-lime-500/10", text: "text-lime-400", border: "border-lime-500/20" },
        { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/20" },
    ];

    let hash = 0;
    for (let i = 0; i < upperNode.length; i++) {
        hash = upperNode.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}
