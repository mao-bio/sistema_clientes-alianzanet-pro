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
